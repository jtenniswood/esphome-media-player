#pragma once

#include "image_decoder.h"
#include "esphome/core/defines.h"

#ifdef USE_ESP_IDF
#include "soc/soc_caps.h"
#if SOC_JPEG_CODEC_SUPPORTED

namespace esphome {
namespace online_image {

/**
 * @brief JPEG decoder using the ESP32-P4 hardware JPEG codec.
 * Decodes directly to RGB565 via hardware.
 * Only used when the target image type is RGB565.
 * Falls back to software libjpeg-turbo when the hardware codec rejects an image.
 */
class HwJpegDecoder : public ImageDecoder {
 public:
  HwJpegDecoder(OnlineImage *image) : ImageDecoder(image) {}
  ~HwJpegDecoder() override = default;

  int prepare(size_t download_size) override;
  int HOT decode(uint8_t *buffer, size_t size) override;

 protected:
  int software_decode_fallback_(uint8_t *buffer, size_t size);
};

}  // namespace online_image
}  // namespace esphome

#endif  // SOC_JPEG_CODEC_SUPPORTED
#endif  // USE_ESP_IDF
