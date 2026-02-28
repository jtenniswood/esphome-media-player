# Manual installation

If you prefer to use the ESPHome dashboard (or CLI) instead of the [web installer](/), you can set up the device manually.

## Prerequisites

- A [supported panel](/devices/esp32-s3-4848s040) (e.g. Guition ESP32-S3 4848S040 or ESP32-P4 JC8012P4A1)
- **Home Assistant** with the [ESPHome add-on](https://esphome.io/guides/getting_started_hassio.html) (or ESPHome CLI)
- USB-C cable for the first flash
- WiFi name and password
- A media player already set up in Home Assistant

## Step 1: Add a new device in ESPHome

1. Open the **ESPHome dashboard** in Home Assistant.
2. Click **New Device** → **Continue**.
3. Choose **Empty Configuration**.
4. Give it a name (e.g. `living-room-music`) and click **Next**, then **Edit** on the new device.

## Step 2: Use the package for your device

Replace the default configuration with one of the following, depending on your hardware.

**Guition ESP32-S3 4848S040 (4"):**

```yaml
substitutions:
  name: "your-device-name"
  friendly_name: "Your Room Music"

wifi:
  ssid: !secret wifi_ssid
  password: !secret wifi_password

packages:
  music_dashboard:
    url: https://github.com/jtenniswood/esphome-media-player
    files: [guition-esp32-s3-4848s040/packages.yaml]
    ref: main
    refresh: 1s
```

**Guition ESP32-P4 JC8012P4A1 (10.1"):**

```yaml
substitutions:
  name: "your-device-name"
  friendly_name: "Your Room Music"

wifi:
  ssid: !secret wifi_ssid
  password: !secret wifi_password

packages:
  music_dashboard:
    url: https://github.com/jtenniswood/esphome-media-player
    files: [guition-esp32-p4-jc8012p4a1/packages.yaml]
    ref: main
    refresh: 1s
```

Adjust `name` and `friendly_name`. Optionally set `media_player` entity ID in substitutions, or leave it empty and set the media player later in Home Assistant.

## Step 3: Set WiFi secrets

1. In the ESPHome dashboard, open **Secrets**.
2. Add:

```yaml
wifi_ssid: "YourWiFiName"
wifi_password: "YourWiFiPassword"
```

3. Save.

## Step 4: Flash the device

1. Connect the panel via USB-C.
2. In the dashboard, open the three-dot menu for your device → **Install**.
3. Choose **Plug into this computer** (or **Manual download** if using the CLI).
4. Wait for the build and upload to finish (first run can take several minutes).

If the device is not detected, install the [CH340 USB driver](https://www.wch-ic.com/downloads/CH341SER_EXE.html) for your OS.

## Step 5: Adopt in Home Assistant

When the device is on your WiFi:

1. Check **Settings → Devices & Services** for a new ESPHome notification.
2. Click **Configure** and complete adoption.
3. The device and entities will appear in Home Assistant.

## Step 6: Select media player and settings

1. Go to **Settings → Devices & Services → ESPHome** and open your device.
2. Under **Configuration**, set the **Media Player** entity ID (e.g. `media_player.living_room`).
3. Adjust brightness, timeouts, and other options as in [Configurable settings](/configurable-settings).

To view device logs (including artwork load errors) in Home Assistant, enable **Subscribe to logs from the device** in the device's **Configure** screen. Logs then appear in **Settings → System → Logs** or **Developer Tools → Logs**.

For other problems, see [Troubleshooting](/troubleshooting).
