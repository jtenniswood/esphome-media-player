# ESPHome Config

Install the media player firmware via the ESPHome dashboard instead of the web installer. This gives you full control over substitutions and lets you customise behaviour that the web installer leaves at defaults.

## Prerequisites

- [ESPHome](https://esphome.io/) 2026.4 or newer running (as a Home Assistant add-on or standalone)
- Your device connected via USB for the first flash (OTA updates work after that)

## Create a configuration

In the ESPHome dashboard, create a new YAML configuration for your device. Use one of the examples below as a starting point.

### ESP32-S3 4848S040 (4")

```yaml
substitutions:
  name: "music-dashboard"
  friendly_name: "Music Dashboard"

wifi:
  ssid: !secret wifi_ssid
  password: !secret wifi_password

packages:
  music_dashboard:
    url: https://github.com/jtenniswood/esphome-media-player
    files: [devices/guition-esp32-s3-4848s040/packages.yaml]
    ref: main
    refresh: 1s
```

### ESP32-P4 JC8012P4A1 (10.1")

```yaml
substitutions:
  name: "music-dashboard-10inch"
  friendly_name: "Music Dashboard 10inch"

wifi:
  ssid: !secret wifi_ssid
  password: !secret wifi_password

packages:
  music_dashboard:
    url: https://github.com/jtenniswood/esphome-media-player
    files: [devices/guition-esp32-p4-jc8012p4a1/packages.yaml]
    ref: main
    refresh: 1s
```

### Waveshare ESP32-P4 86 Panel (4")

```yaml
substitutions:
  name: "music-dashboard"
  friendly_name: "Music Dashboard"

wifi:
  ssid: !secret wifi_ssid
  password: !secret wifi_password

packages:
  music_dashboard:
    url: https://github.com/jtenniswood/esphome-media-player
    files: [devices/esp32-p4-86-panel/packages.yaml]
    ref: main
    refresh: 1s
```

## Available substitutions

These substitutions can be added to the `substitutions:` block in your configuration to override the defaults.

| Substitution      | Default                 | Description                                                                |
| ----------------- | ----------------------- | -------------------------------------------------------------------------- |
| `name`            | —                       | Device name used on your network (required)                                |
| `friendly_name`   | —                       | Display name shown in Home Assistant (required)                            |
| `media_player`    | `""`                    | Entity ID of your primary media player (configured in HA after first boot) |
| `linked_media_player` | `""`                | Entity ID of a linked media player for TV or Line-in source (optional)     |
| `ha_host`         | `"homeassistant.local"` | Hostname or IP address of Home Assistant                                   |
| `ha_port`         | `"8123"`                | Port that Home Assistant is running on                                     |
| `ha_protocol`     | `"http"`                | Protocol for artwork requests — `"http"` or `"https"`                      |
| `ha_verify_ssl`   | `"true"`                | Verify SSL certificate — set to `"false"` for self-signed or local CA certs |
| `display_rotation` | `"0"` (S3 / P4 86 Panel) / `"90"` (10.1" P4) | Display rotation in degrees. See [Display Rotation](/advanced/display-rotation).  |
