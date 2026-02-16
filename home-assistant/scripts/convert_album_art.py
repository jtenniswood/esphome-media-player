#!/usr/bin/env python3
"""
Convert album art from progressive JPEG to baseline JPEG.

ESPHome's online_image JPEG decoder only supports baseline JPEGs.
Music services (Spotify, Apple Music, etc.) often serve album art as
progressive JPEGs, which causes decoding errors on the ESP device.

This script downloads the album art from Home Assistant's media player
proxy, re-encodes it as a baseline JPEG, and saves it to /config/www/
where ESPHome can fetch it.

Usage (called automatically by HA shell_command):
    python3 /config/scripts/convert_album_art.py "<full_image_url>"
"""

import sys
import os
import urllib.request
from io import BytesIO

try:
    from PIL import Image
except ImportError:
    sys.exit("Pillow is required: pip install Pillow")


def convert(url, output_path="/config/www/album_art.jpg"):
    """Download image from URL and save as baseline (non-progressive) JPEG."""
    data = urllib.request.urlopen(url, timeout=15).read()
    img = Image.open(BytesIO(data))

    if img.mode != "RGB":
        img = img.convert("RGB")

    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    img.save(output_path, "JPEG", progressive=False, quality=90)


if __name__ == "__main__":
    if len(sys.argv) < 2 or not sys.argv[1].strip():
        sys.exit("Usage: convert_album_art.py <url>")
    convert(sys.argv[1].strip())
