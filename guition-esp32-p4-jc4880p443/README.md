# Guition ESP32-P4 JC4880P443

Music dashboard setup for the **Guition ESP32-P4 with JC4880P443** (4.3" MIPI DSI, 480×800, GT911 touch). Hardware is defined in `device/device.yaml`; layout is adapted from the S3 4848S040 for the taller screen.

## Screen size

- **Resolution:** 480×800 (portrait)
- **Panel:** JC4880P443 (MIPI DSI, 4.3" IPS)

## Usage

1. Copy `esphome/template.yaml` into your ESPHome config (or use it as a package).
2. Set `name`, `friendly_name`, `room`, `media_player`, `home_assistant_url`, and WiFi in your main YAML or via the template substitutions.
3. Build and flash.

## Package layout

- `device/device.yaml` — ESP32-P4, display (480×800), touch, backlight output, globals, gesture scripts
- `device/lvgl.yaml` — LVGL UI for 480×800
- `device/sensors.yaml` — Home Assistant media_player sensors and logic
- `addon/backlight.yaml` — Backlight light + screensaver
- `addon/music.yaml` — Album art (resize 480×800)
- `addon/time.yaml` — SNTP
- `addon/network.yaml` — Status, WiFi, IP
- `assets/` — Fonts, icons
- `theme/button.yaml` — LVGL theme

Gestures match the S3 build: swipe left/right for track skip, swipe down for settings, tap to toggle UI (play/pause button area excluded).
