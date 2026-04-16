#include "jpeg_image.h"
#ifdef USE_ARTWORK_IMAGE_JPEG_SUPPORT

#include "esphome/components/display/display_buffer.h"
#include "esphome/core/application.h"
#include "esphome/core/helpers.h"
#include "esphome/core/log.h"

#include "artwork_image.h"
static const char *const TAG = "artwork_image.jpeg";

namespace esphome {
namespace artwork_image {

/// Custom error manager that longjmps instead of calling exit()
struct JpegErrorMgr {
  jpeg_error_mgr pub;
  jmp_buf setjmp_buffer;
  char message[JMSG_LENGTH_MAX];
};

static void jpeg_error_exit(j_common_ptr cinfo) {
  auto *err = reinterpret_cast<JpegErrorMgr *>(cinfo->err);
  (*(cinfo->err->format_message))(cinfo, err->message);
  longjmp(err->setjmp_buffer, 1);
}

static constexpr size_t MAX_JPEG_DOWNLOAD_SIZE = 2 * 1024 * 1024;  // 2 MB

int JpegDecoder::prepare(size_t download_size) {
  if (download_size > MAX_JPEG_DOWNLOAD_SIZE) {
    ESP_LOGE(TAG, "JPEG too large to decode: %zu bytes (max %zu). Consider using a smaller image URL.",
             download_size, MAX_JPEG_DOWNLOAD_SIZE);
    return DECODE_ERROR_OUT_OF_MEMORY;
  }
  ImageDecoder::prepare(download_size);
  auto size = this->image_->resize_download_buffer(download_size);
  if (size < download_size) {
    ESP_LOGE(TAG, "Download buffer resize failed!");
    return DECODE_ERROR_OUT_OF_MEMORY;
  }
  return 0;
}

int HOT JpegDecoder::decode(uint8_t *buffer, size_t size) {
  if (size < this->download_size_) {
    ESP_LOGV(TAG, "Download not complete. Size: %zu/%zu", size, this->download_size_);
    return 0;
  }

  jpeg_decompress_struct cinfo;
  JpegErrorMgr jerr{};

  cinfo.err = jpeg_std_error(&jerr.pub);
  jerr.pub.error_exit = jpeg_error_exit;

  // Raw pointer for longjmp safety — unique_ptr destructors are skipped by longjmp
  uint8_t *row_buffer = nullptr;

  if (setjmp(jerr.setjmp_buffer)) {
    ESP_LOGE(TAG, "JPEG decode error: %s", jerr.message);
    free(row_buffer);
    jpeg_destroy_decompress(&cinfo);
    return DECODE_ERROR_UNSUPPORTED_FORMAT;
  }

  jpeg_create_decompress(&cinfo);
  jpeg_mem_src(&cinfo, buffer, size);

  if (jpeg_read_header(&cinfo, TRUE) != JPEG_HEADER_OK) {
    ESP_LOGE(TAG, "Could not read JPEG header");
    jpeg_destroy_decompress(&cinfo);
    return DECODE_ERROR_INVALID_TYPE;
  }

  int src_w = cinfo.image_width;
  int src_h = cinfo.image_height;
  ESP_LOGD(TAG, "JPEG header: %dx%d, components=%d, progressive=%s",
           src_w, src_h, cinfo.num_components,
           cinfo.progressive_mode ? "yes" : "no");

  // Request RGB output regardless of input colorspace
  cinfo.out_color_space = JCS_RGB;
  // Use fast integer IDCT — slightly lower quality but faster on ESP32
  // and avoids pulling in the float IDCT code path.
  cinfo.dct_method = JDCT_IFAST;

  // Use IDCT scaling to downscale during decode
  int target_w = this->image_->get_fixed_width();
  int target_h = this->image_->get_fixed_height();
  if (target_w > 0 && target_h > 0) {
    // libjpeg supports scale_num/scale_denom ratios: 1/1, 1/2, 1/4, 1/8
    // Accept output >= 83% of target — LVGL zoom handles the remaining upscale.
    // This avoids decoding at full resolution when a slightly-smaller IDCT step
    // is available (e.g. 800→400 via 1/2 instead of 800→800 via 1/1 for a 480 target).
    int thresh_w = target_w * 5 / 6;
    int thresh_h = target_h * 5 / 6;
    constexpr unsigned int denoms[] = {8, 4, 2, 1};
    for (unsigned int denom : denoms) {
      cinfo.scale_num = 1;
      cinfo.scale_denom = denom;
      jpeg_calc_output_dimensions(&cinfo);
      if (static_cast<int>(cinfo.output_width) >= thresh_w &&
          static_cast<int>(cinfo.output_height) >= thresh_h) {
        break;
      }
    }
    if (static_cast<int>(cinfo.output_width) < thresh_w ||
        static_cast<int>(cinfo.output_height) < thresh_h) {
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
    ESP_LOGD(TAG, "Using IDCT downscale: %dx%d -> %dx%d", src_w, src_h, out_w, out_h);
  }

  if (!this->set_size(out_w, out_h)) {
    jpeg_destroy_decompress(&cinfo);
    return DECODE_ERROR_OUT_OF_MEMORY;
  }

  jpeg_start_decompress(&cinfo);

  // Allocate row buffers (raw pointers — safe across longjmp)
  size_t row_stride = static_cast<size_t>(out_w) * 3;
  row_buffer = static_cast<uint8_t *>(malloc(row_stride));
  if (row_buffer == nullptr) {
    jpeg_destroy_decompress(&cinfo);
    return DECODE_ERROR_OUT_OF_MEMORY;
  }

  bool use_rgb565 = (this->image_->image_type() == image::ImageType::IMAGE_TYPE_RGB565);
  bool big_endian = this->image_->is_big_endian();

  int y = 0;
  while (cinfo.output_scanline < cinfo.output_height) {
    uint8_t *row_ptr = row_buffer;
    jpeg_read_scanlines(&cinfo, &row_ptr, 1);

    if ((y & 63) == 0) {
      App.feed_wdt();
    }

    if (use_rgb565) {
      // Convert RGB888 -> RGB565 in-place (2 bpp fits within the 3 bpp
      // source buffer, so no separate allocation needed).  We read forward
      // and write forward; the write pointer never overtakes the read
      // pointer because 2 < 3.
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
    } else {
      // Per-pixel draw for other image types
      for (int x = 0; x < out_w; x++) {
        Color color(row_buffer[x * 3 + 0], row_buffer[x * 3 + 1], row_buffer[x * 3 + 2]);
        this->draw(x, y, 1, 1, color);
      }
    }
    y++;
  }

  jpeg_finish_decompress(&cinfo);
  jpeg_destroy_decompress(&cinfo);
  free(row_buffer);

  this->decoded_bytes_ = size;
  return size;
}

}  // namespace artwork_image
}  // namespace esphome

#endif  // USE_ARTWORK_IMAGE_JPEG_SUPPORT
