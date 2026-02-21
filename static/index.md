---
layout: default
---

## Guition ESP32-S3 Media Controller

A touchscreen media controller for Home Assistant, built with ESPHome and LVGL. Displays album art, track info, and provides touch controls for any media player in your smart home.

## Installation

Connect the Guition ESP32-S3-4848S040 to your computer via USB-C, then click the button below to install.

<esp-web-install-button manifest="./firmware/media-player.manifest.json"></esp-web-install-button>

<script type="module" src="https://unpkg.com/esp-web-tools@10/dist/web/install-button.js?module"></script>

Requires Google Chrome or Microsoft Edge on desktop.

## After Installation

1. The device will create a WiFi hotspot. Connect to it and enter your home WiFi credentials.
2. Once connected, Home Assistant will automatically discover the device.
3. Go to **Settings > Devices & Services > ESPHome** to adopt it.
4. Set the media player entity you want to control in the device configuration.

For full documentation, see the [GitHub repository](https://github.com/jtenniswood/esphome-media-player).
