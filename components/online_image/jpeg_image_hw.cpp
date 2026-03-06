#include "jpeg_image_hw.h"

#ifdef USE_ESP_IDF
#include "soc/soc_caps.h"
#if SOC_JPEG_CODEC_SUPPORTED

#include <csetjmp>
#include <cstring>
#include <jpeglib.h>
#include "driver/jpeg_decode.h"
#include "esphome/core/application.h"
#include "esphome/core/log.h"
#include "online_image.h"

static const char *const TAG = "online_image.jpeg_hw";

namespace esphome {
namespace online_image {

// The ESP-IDF HW JPEG decoder on P4 can't parse COM (0xFE) markers reliably.
// Strip them in-place before passing data to the hardware codec.
static size_t strip_com_markers(uint8_t *buf, size_t size) {
  if (size < 4 || buf[0] != 0xFF || buf[1] != 0xD8)
    return size;

  size_t rp = 2, wp = 2;

  while (rp + 1 < size) {
    if (buf[rp] != 0xFF) {
      buf[wp++] = buf[rp++];
      continue;
    }

    while (rp + 1 < size && buf[rp + 1] == 0xFF) {
      buf[wp++] = buf[rp++];
    }
    if (rp + 1 >= size)
      break;

    uint8_t marker = buf[rp + 1];

    if (marker == 0x00 || marker == 0xD9 || (marker >= 0xD0 && marker <= 0xD7) || marker == 0x01) {
      buf[wp++] = buf[rp++];
      buf[wp++] = buf[rp++];
      if (marker == 0xD9)
        break;
      continue;
    }

    // SOS — copy everything from here to the end (entropy-coded data follows)
    if (marker == 0xDA) {
      size_t remaining = size - rp;
      if (wp != rp)
        memmove(buf + wp, buf + rp, remaining);
      return wp + remaining;
    }

    if (rp + 3 >= size)
      break;

    uint16_t seg_len = (buf[rp + 2] << 8) | buf[rp + 3];
    size_t total = 2 + seg_len;

    if (rp + total > size) {
      size_t remaining = size - rp;
      if (wp != rp)
        memmove(buf + wp, buf + rp, remaining);
      return wp + remaining;
    }

    if (marker == 0xFE) {
      ESP_LOGD(TAG, "Stripping COM marker (%u bytes)", seg_len);
      rp += total;
      continue;
    }

    if (wp != rp)
      memmove(buf + wp, buf + rp, total);
    wp += total;
    rp += total;
  }

  return wp;
}

// Walk JPEG marker segments and inspect the SOF header to count color components.
// Returns true when Nf == 1 (grayscale), which the P4 HW codec cannot decode to RGB565.
static bool is_grayscale_jpeg(const uint8_t *data, size_t size) {
  if (size < 4 || data[0] != 0xFF || data[1] != 0xD8)
    return false;
  size_t pos = 2;
  while (pos + 3 < size) {
    if (data[pos] != 0xFF)
      return false;
    uint8_t marker = data[pos + 1];
    if (marker >= 0xC0 && marker <= 0xC2) {
      if (pos + 9 >= size)
        return false;
      return data[pos + 9] == 1;
    }
    if (marker == 0xD9 || marker == 0xDA)
      return false;
    if (marker == 0x01 || (marker >= 0xD0 && marker <= 0xD8)) {
      pos += 2;
      continue;
    }
    uint16_t seg_len = (data[pos + 2] << 8) | data[pos + 3];
    pos += 2 + seg_len;
  }
  return false;
}

int HwJpegDecoder::prepare(size_t download_size) {
  ImageDecoder::prepare(download_size);
  auto size = this->image_->resize_download_buffer(download_size);
  if (size < download_size) {
    ESP_LOGE(TAG, "Download buffer resize failed!");
    return DECODE_ERROR_OUT_OF_MEMORY;
  }
  return 0;
}

int HOT HwJpegDecoder::decode(uint8_t *buffer, size_t size) {
  if (size < this->download_size_) {
    ESP_LOGV(TAG, "Download not complete. Size: %zu/%zu", size, this->download_size_);
    return 0;
  }

  jpeg_decode_memory_alloc_cfg_t tx_cfg = {
      .buffer_direction = JPEG_DEC_ALLOC_INPUT_BUFFER,
  };
  size_t tx_allocated = 0;
  uint8_t *tx_buf = (uint8_t *) jpeg_alloc_decoder_mem(size, &tx_cfg, &tx_allocated);
  if (!tx_buf) {
    ESP_LOGE(TAG, "Failed to allocate aligned input buffer (%zu bytes)", size);
    return DECODE_ERROR_OUT_OF_MEMORY;
  }
  memcpy(tx_buf, buffer, size);
  size_t hw_size = strip_com_markers(tx_buf, size);
  if (hw_size != size) {
    ESP_LOGD(TAG, "Stripped %zu bytes of COM markers", size - hw_size);
  }

  jpeg_decode_picture_info_t info;
  esp_err_t err = jpeg_decoder_get_info(tx_buf, hw_size, &info);
  if (err != ESP_OK) {
    ESP_LOGW(TAG, "HW codec rejected image (get_info): %s", esp_err_to_name(err));
    free(tx_buf);
    return this->software_decode_fallback_(buffer, size);
  }

  if (info.sample_method == JPEG_DOWN_SAMPLING_GRAY || is_grayscale_jpeg(tx_buf, hw_size)) {
    ESP_LOGW(TAG, "Grayscale JPEG not supported by HW codec, using software fallback");
    free(tx_buf);
    return this->software_decode_fallback_(buffer, size);
  }

  int src_w = info.width;
  int src_h = info.height;
  ESP_LOGD(TAG, "Image size: %d x %d", src_w, src_h);

  if (src_w <= 0 || src_h <= 0) {
    ESP_LOGW(TAG, "HW codec returned invalid dimensions (%d x %d), using software fallback", src_w, src_h);
    free(tx_buf);
    return this->software_decode_fallback_(buffer, size);
  }

  if (!this->set_size(src_w, src_h)) {
    free(tx_buf);
    return DECODE_ERROR_OUT_OF_MEMORY;
  }

  int aligned_w = (src_w + 15) & ~15;
  int aligned_h = (src_h + 15) & ~15;
  size_t out_buf_size = aligned_w * aligned_h * 2;

  jpeg_decode_memory_alloc_cfg_t rx_cfg = {
      .buffer_direction = JPEG_DEC_ALLOC_OUTPUT_BUFFER,
  };
  size_t rx_allocated = 0;
  uint8_t *rx_buf = (uint8_t *) jpeg_alloc_decoder_mem(out_buf_size, &rx_cfg, &rx_allocated);
  if (!rx_buf) {
    ESP_LOGE(TAG, "Failed to allocate aligned output buffer (%zu bytes)", out_buf_size);
    free(tx_buf);
    return DECODE_ERROR_OUT_OF_MEMORY;
  }

  jpeg_decoder_handle_t decoder_engine;
  jpeg_decode_engine_cfg_t engine_cfg = {
      .intr_priority = 0,
      .timeout_ms = 200,
  };
  err = jpeg_new_decoder_engine(&engine_cfg, &decoder_engine);
  if (err != ESP_OK) {
    ESP_LOGW(TAG, "HW codec rejected image (engine): %s", esp_err_to_name(err));
    free(tx_buf);
    free(rx_buf);
    return this->software_decode_fallback_(buffer, size);
  }

  jpeg_decode_cfg_t decode_cfg = {
      .output_format = JPEG_DECODE_OUT_FORMAT_RGB565,
      .rgb_order = this->image_->is_big_endian() ? JPEG_DEC_RGB_ELEMENT_ORDER_RGB
                                                  : JPEG_DEC_RGB_ELEMENT_ORDER_BGR,
      .conv_std = JPEG_YUV_RGB_CONV_STD_BT601,
  };

  uint32_t decoded_size = 0;
  err = jpeg_decoder_process(decoder_engine, &decode_cfg, tx_buf, hw_size, rx_buf, rx_allocated, &decoded_size);

  jpeg_del_decoder_engine(decoder_engine);
  free(tx_buf);

  if (err == ESP_OK) {
    App.feed_wdt();
    for (int y = 0; y < src_h; y++) {
      this->draw_rgb565_block(0, y, src_w, 1, rx_buf + y * aligned_w * 2);
    }
    free(rx_buf);
    ESP_LOGD(TAG, "Hardware JPEG decode complete (%u bytes output)", decoded_size);
    this->decoded_bytes_ = size;
    return size;
  }

  free(rx_buf);
  ESP_LOGW(TAG, "HW codec rejected image (process): %s", esp_err_to_name(err));
  return this->software_decode_fallback_(buffer, size);
}

/// libjpeg-turbo error manager for longjmp-based error handling
struct HwJpegErrorMgr {
  jpeg_error_mgr pub;
  jmp_buf setjmp_buffer;
  char message[JMSG_LENGTH_MAX];
};

static void hw_jpeg_error_exit(j_common_ptr cinfo) {
  auto *err = reinterpret_cast<HwJpegErrorMgr *>(cinfo->err);
  (*(cinfo->err->format_message))(cinfo, err->message);
  longjmp(err->setjmp_buffer, 1);
}

int HwJpegDecoder::software_decode_fallback_(uint8_t *buffer, size_t size) {
  ESP_LOGI(TAG, "Falling back to software JPEG decoder (libjpeg-turbo)");

  jpeg_decompress_struct cinfo;
  HwJpegErrorMgr jerr{};

  cinfo.err = jpeg_std_error(&jerr.pub);
  jerr.pub.error_exit = hw_jpeg_error_exit;

  // Raw pointer for longjmp safety
  uint8_t *row_buffer = nullptr;

  if (setjmp(jerr.setjmp_buffer)) {
    ESP_LOGE(TAG, "Software fallback JPEG error: %s", jerr.message);
    free(row_buffer);
    jpeg_destroy_decompress(&cinfo);
    return DECODE_ERROR_UNSUPPORTED_FORMAT;
  }

  jpeg_create_decompress(&cinfo);
  jpeg_mem_src(&cinfo, buffer, size);

  if (jpeg_read_header(&cinfo, TRUE) != JPEG_HEADER_OK) {
    ESP_LOGE(TAG, "Software fallback: could not read JPEG header");
    jpeg_destroy_decompress(&cinfo);
    return DECODE_ERROR_INVALID_TYPE;
  }

  int src_w = cinfo.image_width;
  int src_h = cinfo.image_height;
  ESP_LOGD(TAG, "Software fallback: %dx%d, progressive=%s",
           src_w, src_h, cinfo.progressive_mode ? "yes" : "no");

  cinfo.out_color_space = JCS_RGB;
  cinfo.dct_method = JDCT_IFAST;

  // Use IDCT scaling to downscale during decode
  int target_w = this->image_->get_fixed_width();
  int target_h = this->image_->get_fixed_height();
  if (target_w > 0 && target_h > 0) {
    constexpr unsigned int denoms[] = {8, 4, 2, 1};
    for (unsigned int denom : denoms) {
      cinfo.scale_num = 1;
      cinfo.scale_denom = denom;
      jpeg_calc_output_dimensions(&cinfo);
      if (static_cast<int>(cinfo.output_width) >= target_w &&
          static_cast<int>(cinfo.output_height) >= target_h) {
        break;
      }
    }
    if (static_cast<int>(cinfo.output_width) < target_w ||
        static_cast<int>(cinfo.output_height) < target_h) {
      cinfo.scale_num = 1;
      cinfo.scale_denom = 1;
      jpeg_calc_output_dimensions(&cinfo);
    }
  } else {
    jpeg_calc_output_dimensions(&cinfo);
  }

  int out_w = cinfo.output_width;
  int out_h = cinfo.output_height;
  if (out_w != src_w || out_h != src_h) {
    ESP_LOGD(TAG, "Software fallback: IDCT downscale %dx%d -> %dx%d", src_w, src_h, out_w, out_h);
  }

  if (!this->set_size(out_w, out_h)) {
    jpeg_destroy_decompress(&cinfo);
    return DECODE_ERROR_OUT_OF_MEMORY;
  }

  jpeg_start_decompress(&cinfo);

  size_t row_stride = static_cast<size_t>(out_w) * 3;
  row_buffer = static_cast<uint8_t *>(malloc(row_stride));
  if (row_buffer == nullptr) {
    jpeg_destroy_decompress(&cinfo);
    return DECODE_ERROR_OUT_OF_MEMORY;
  }

  // HW decoder is only used for RGB565 image types — convert in-place
  bool big_endian = this->image_->is_big_endian();

  int y = 0;
  while (cinfo.output_scanline < cinfo.output_height) {
    uint8_t *row_ptr = row_buffer;
    jpeg_read_scanlines(&cinfo, &row_ptr, 1);

    if ((y & 63) == 0) {
      App.feed_wdt();
    }

    uint8_t *dst = row_buffer;
    for (int x = 0; x < out_w; x++) {
      uint8_t r = row_buffer[x * 3 + 0];
      uint8_t g = row_buffer[x * 3 + 1];
      uint8_t b = row_buffer[x * 3 + 2];
      uint16_t rgb565 = ((r & 0xF8) << 8) | ((g & 0xFC) << 3) | (b >> 3);
      if (big_endian) {
        dst[0] = rgb565 >> 8;
        dst[1] = rgb565 & 0xFF;
      } else {
        dst[0] = rgb565 & 0xFF;
        dst[1] = rgb565 >> 8;
      }
      dst += 2;
    }
    this->draw_rgb565_block(0, y, out_w, 1, row_buffer);
    y++;
  }

  jpeg_finish_decompress(&cinfo);
  jpeg_destroy_decompress(&cinfo);
  free(row_buffer);

  this->decoded_bytes_ = size;
  ESP_LOGI(TAG, "Software JPEG fallback decode complete (%d x %d)", out_w, out_h);
  return size;
}

}  // namespace online_image
}  // namespace esphome

#endif  // SOC_JPEG_CODEC_SUPPORTED
#endif  // USE_ESP_IDF
