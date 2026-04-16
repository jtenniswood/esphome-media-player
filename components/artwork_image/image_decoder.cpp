#include "image_decoder.h"
#include "artwork_image.h"

#include "esphome/core/log.h"

namespace esphome {
namespace artwork_image {

static const char *const TAG = "artwork_image.decoder";

bool ImageDecoder::set_size(int width, int height) {
  bool success = this->image_->resize_(width, height) > 0;
  this->x_scale_ = static_cast<double>(this->image_->buffer_width_) / width;
  this->y_scale_ = static_cast<double>(this->image_->buffer_height_) / height;
  return success;
}

void ImageDecoder::draw(int x, int y, int w, int h, const Color &color) {
  auto width = std::min(this->image_->buffer_width_, static_cast<int>(std::ceil((x + w) * this->x_scale_)));
  auto height = std::min(this->image_->buffer_height_, static_cast<int>(std::ceil((y + h) * this->y_scale_)));
  for (int i = x * this->x_scale_; i < width; i++) {
    for (int j = y * this->y_scale_; j < height; j++) {
      this->image_->draw_pixel_(i, j, color);
    }
  }
}

void ImageDecoder::draw_rgb565_block(int x, int y, int w, int h, const uint8_t *data) {
  int bpp_bytes = this->image_->get_bpp() / 8;

  if (this->x_scale_ == 1.0 && this->y_scale_ == 1.0 && bpp_bytes == 2) {
    for (int row = 0; row < h; row++) {
      int dy = y + row;
      if (dy < 0 || dy >= this->image_->buffer_height_)
        continue;
      int start_x = std::max(0, x);
      int end_x = std::min(x + w, this->image_->buffer_width_);
      if (start_x >= end_x)
        continue;
      int copy_w = end_x - start_x;
      int src_offset = (row * w + (start_x - x)) * 2;
      int dst_pos = this->image_->get_position_(start_x, dy);
      memcpy(this->image_->buffer_ + dst_pos, data + src_offset, copy_w * 2);
    }
    return;
  }

  for (int row = 0; row < h; row++) {
    for (int col = 0; col < w; col++) {
      int src_x = x + col;
      int src_y = y + row;
      int src_offset = (row * w + col) * 2;

      auto target_w = std::min(this->image_->buffer_width_,
                               static_cast<int>(std::ceil((src_x + 1) * this->x_scale_)));
      auto target_h = std::min(this->image_->buffer_height_,
                               static_cast<int>(std::ceil((src_y + 1) * this->y_scale_)));
      for (int dy = static_cast<int>(src_y * this->y_scale_); dy < target_h; dy++) {
        for (int dx = static_cast<int>(src_x * this->x_scale_); dx < target_w; dx++) {
          int dst_pos = this->image_->get_position_(dx, dy);
          memcpy(this->image_->buffer_ + dst_pos, data + src_offset, 2);
          if (bpp_bytes > 2) {
            this->image_->buffer_[dst_pos + 2] = 0xFF;
          }
        }
      }
    }
  }
}

DownloadBuffer::DownloadBuffer(size_t size) : size_(size) {
  this->buffer_ = this->allocator_.allocate(size);
  this->reset();
  if (!this->buffer_) {
    ESP_LOGE(TAG, "Initial allocation of download buffer failed!");
    this->size_ = 0;
  }
}

uint8_t *DownloadBuffer::data(size_t offset) {
  if (offset > this->size_) {
    ESP_LOGE(TAG, "Tried to access beyond download buffer bounds!!!");
    return this->buffer_;
  }
  return this->buffer_ + offset;
}

size_t DownloadBuffer::read(size_t len) {
  this->unread_ -= len;
  if (this->unread_ > 0) {
    memmove(this->data(), this->data(len), this->unread_);
  }
  return this->unread_;
}

size_t DownloadBuffer::resize(size_t size) {
  if (this->size_ >= size) {
    return this->size_;
  }
  uint8_t *new_buffer = this->allocator_.allocate(size);
  if (new_buffer) {
    if (this->buffer_ && this->unread_ > 0) {
      memcpy(new_buffer, this->buffer_, this->unread_);
    }
    this->allocator_.deallocate(this->buffer_, this->size_);
    this->buffer_ = new_buffer;
    this->size_ = size;
    return size;
  } else {
    ESP_LOGE(TAG, "allocation of %zu bytes failed. Biggest block in heap: %zu Bytes", size,
             this->allocator_.get_max_free_block_size());
    this->allocator_.deallocate(this->buffer_, this->size_);
    this->buffer_ = nullptr;
    this->size_ = 0;
    this->reset();
    return 0;
  }
}

}  // namespace artwork_image
}  // namespace esphome
