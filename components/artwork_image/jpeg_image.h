#pragma once

#include "image_decoder.h"
#include "esphome/core/defines.h"
#ifdef USE_ARTWORK_IMAGE_JPEG_SUPPORT
#include <jpeglib.h>
#include <csetjmp>

namespace esphome {
namespace artwork_image {

/**
 * @brief Image decoder specialization for JPEG images.
 */
class JpegDecoder : public ImageDecoder {
 public:
  /**
   * @brief Construct a new JPEG Decoder object.
   *
   * @param display The image to decode the stream into.
   */
  JpegDecoder(ArtworkImage *image) : ImageDecoder(image) {}
  ~JpegDecoder() override {}

  int prepare(size_t download_size) override;
  int HOT decode(uint8_t *buffer, size_t size) override;
};

}  // namespace artwork_image
}  // namespace esphome

#endif  // USE_ARTWORK_IMAGE_JPEG_SUPPORT
