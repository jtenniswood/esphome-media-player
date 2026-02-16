# Guition ESP32-S3 4848S040 (4.0")

4-inch touch LCD panel with ESP32-S3, running ESPHome and LVGL for home automation and sensor displays.

![Guition ESP32-S3 4848S040](guition-esp32-s3-4848s040.jpg)

## Configuration

- **Template**: [esphome/template.yaml](esphome/template.yaml) — use the **contents of this file as your ESPHome config** in the dashboard or CLI (create or edit your device config so it matches this file).

### Album Art Setup (required)

ESPHome's JPEG decoder only supports **baseline** JPEGs, but music services (Spotify, Apple Music, etc.) often serve album art as **progressive** JPEGs. A small Home Assistant helper is needed to convert images before the ESP device downloads them.

1. Copy [`home-assistant/scripts/convert_album_art.py`](../home-assistant/scripts/convert_album_art.py) to `/config/scripts/` on your HA instance.
2. Add the `shell_command` and `input_text` entries from [`home-assistant/configuration.yaml`](../home-assistant/configuration.yaml) to your HA `configuration.yaml`.
3. Create the automation from [`home-assistant/automations.yaml`](../home-assistant/automations.yaml) (via UI or file).
4. **Change `media_player.office`** in the shell_command and automation to match your media player entity.
5. Restart Home Assistant, then flash the updated ESPHome firmware.

## Where to Buy

- **Panel**: [AliExpress](https://s.click.aliexpress.com/e/_c3sIhvBv) (~£16)

## Stand

- **Desktop stand** (3D printable): [MakerWorld](https://makerworld.com/en/models/2327976-touch-screen-desktop-stand-for-guition-4848s040#profileId-2543111)
