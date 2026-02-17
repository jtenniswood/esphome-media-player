# Guition ESP32-P4 JC4880P443 Music Dashboard

Touch-screen music dashboard for the **Guition ESP32-P4 JC4880P443**, using the same app flow as the [S3 4848S040](https://github.com/jtenniswood/esphome-media-player/tree/main/guition-esp32-s3-4848s040) setup but adapted for this device’s hardware and screen size.

**Hardware:** ESP32-P4 with hosted ESP32-C6 for connectivity; **4.3" 480×800** portrait IPS capacitive touch (MIPI DSI, JC4880P443, GT911 touch).

---

## Screen size

- **Resolution:** 480×800 (portrait). The S3 4848S040 is 480×480; this config uses the P4 device file for hardware and scales the UI for 480×800 (bottom bar at y 670–800, same gestures and behavior).

---

## Features

Same as the S3 setup:

- Full-screen album art (480×800), now-playing info, progress bar
- Play/pause button, swipe left/right for track skip
- Swipe down for volume panel, swipe up to close
- Tap (outside play/pause) to toggle UI overlay
- TV mode when source is `"TV"`
- Two-stage screensaver (dim then off), day/night brightness, configurable timeouts
- OTA updates, HA API, optional network diagnostics

---

## Quick setup

1. In ESPHome, create a new device and use [esphome/template.yaml](esphome/template.yaml) as the config (same idea as the S3 template).
2. Set `substitutions` (e.g. `name`, `friendly_name`, `room`, `media_player`, `home_assistant_url`) and WiFi (or your C6/hosted network config).
3. Flash and adopt in Home Assistant.

Package list in the template points at `guition-esp32-p4-jc4880p443/` for device, sensors, lvgl, addons, assets, and theme.

---

## Layout (480×800)

| Element            | Position / size        |
|--------------------|-------------------------|
| Album art          | Full screen 480×800     |
| Bottom overlay     | y 670, height 130       |
| Title / artist     | Left, y 686 / 726       |
| Play/pause         | Right, 72×72 at (390, 686) |
| Progress bar       | y 794, width 480, height 6 |
| Settings panel     | Full screen; volume arc and +/- buttons centered |

Touch exclude zone for “tap = toggle UI” is the play/pause button: x 385–467, y 671–753.

---

## Directory layout

| Directory   | Purpose |
|------------|---------|
| `device/`  | P4 hardware (display, touch, backlight, C6 host), gesture globals/scripts, sensors, LVGL layout (480×800) |
| `addon/`   | Backlight/screensaver, time (SNTP), network, music (album art 480×800) |
| `assets/`  | Fonts, icons |
| `theme/`   | Button/control styles |
| `esphome/` | Template YAML that pulls the packages above |
