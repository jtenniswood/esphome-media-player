#include "jpeg_image_hw.h"

#ifdef USE_ESP_IDF
#include "soc/soc_caps.h"
#if SOC_JPEG_CODEC_SUPPORTED

#include <cstring>
#include <JPEGDEC.h>
#include "driver/jpeg_decode.h"
#include "esphome/core/application.h"
#include "esphome/core/log.h"
#include "online_image.h"

static const char *const TAG = "online_image.jpeg_hw";

namespace esphome {
namespace online_image {

static int sw_fallback_draw_callback_(JPEGDRAW *jpeg) {
  ImageDecoder *decoder = (ImageDecoder *) jpeg->pUser;
  App.feed_wdt();
  if (jpeg->iBpp == 16) {
    decoder->draw_rgb565_block(jpeg->x, jpeg->y, jpeg->iWidth, jpeg->iHeight,
                               reinterpret_cast<const uint8_t *>(jpeg->pPixels));
    return 1;
  }
  return 1;
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

  jpeg_decode_picture_info_t info;
  esp_err_t err = jpeg_decoder_get_info(tx_buf, size, &info);
  if (err != ESP_OK) {
    ESP_LOGW(TAG, "HW codec rejected image (get_info): %s", esp_err_to_name(err));
    free(tx_buf);
    return this->software_decode_fallback_(buffer, size);
  }

  int src_w = info.width;
  int src_h = info.height;
  ESP_LOGD(TAG, "Image size: %d x %d", src_w, src_h);

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
  err = jpeg_decoder_process(decoder_engine, &decode_cfg, tx_buf, size, rx_buf, rx_allocated, &decoded_size);

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

int HwJpegDecoder::software_decode_fallback_(uint8_t *buffer, size_t size) {
  ESP_LOGI(TAG, "Falling back to software JPEG decoder");
  JPEGDEC jpeg;

  if (!jpeg.openRAM(buffer, size, sw_fallback_draw_callback_)) {
    ESP_LOGE(TAG, "Software fallback: could not open image: %d", jpeg.getLastError());
    return DECODE_ERROR_INVALID_TYPE;
  }

  auto jpeg_type = jpeg.getJPEGType();
  if (jpeg_type == JPEG_MODE_INVALID) {
    ESP_LOGE(TAG, "Software fallback: invalid JPEG");
    return DECODE_ERROR_INVALID_TYPE;
  }
  if (jpeg_type == JPEG_MODE_PROGRESSIVE) {
    ESP_LOGE(TAG, "Software fallback: progressive JPEG not supported");
    return DECODE_ERROR_INVALID_TYPE;
  }

  int src_w = jpeg.getWidth();
  int src_h = jpeg.getHeight();
  ESP_LOGD(TAG, "Software fallback: image size %d x %d", src_w, src_h);

  jpeg.setUserPointer(this);
  jpeg.setPixelType(this->image_->is_big_endian() ? RGB565_BIG_ENDIAN : RGB565_LITTLE_ENDIAN);

  int decode_options = 0;
  int out_w = src_w;
  int out_h = src_h;
  int target_w = this->image_->get_fixed_width();
  int target_h = this->image_->get_fixed_height();
  if (target_w > 0 && target_h > 0) {
    if (src_w / 8 >= target_w && src_h / 8 >= target_h) {
      decode_options = JPEG_SCALE_EIGHTH;
      out_w = src_w / 8;
      out_h = src_h / 8;
    } else if (src_w / 4 >= target_w && src_h / 4 >= target_h) {
      decode_options = JPEG_SCALE_QUARTER;
      out_w = src_w / 4;
      out_h = src_h / 4;
    } else if (src_w / 2 >= target_w && src_h / 2 >= target_h) {
      decode_options = JPEG_SCALE_HALF;
      out_w = src_w / 2;
      out_h = src_h / 2;
    }
    if (decode_options) {
      ESP_LOGD(TAG, "Software fallback: downscale %dx%d -> %dx%d", src_w, src_h, out_w, out_h);
    }
  }

  if (!this->set_size(out_w, out_h)) {
    return DECODE_ERROR_OUT_OF_MEMORY;
  }

  if (!jpeg.decode(0, 0, decode_options)) {
    ESP_LOGE(TAG, "Software fallback: decode failed");
    jpeg.close();
    return DECODE_ERROR_UNSUPPORTED_FORMAT;
  }

  this->decoded_bytes_ = size;
  jpeg.close();
  ESP_LOGI(TAG, "Software JPEG fallback decode complete (%d x %d)", out_w, out_h);
  return size;
}

}  // namespace online_image
}  // namespace esphome

#endif  // SOC_JPEG_CODEC_SUPPORTED
#endif  // USE_ESP_IDF
