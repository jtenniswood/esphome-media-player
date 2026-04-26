# Installation

## Requirements

- A supported device:
  - [Guition ESP32-S3 4848S040 (4")](/devices/esp32-s3-4848s040)
  - [ESP32-P4 86 Panel (4")](/devices/esp32-p4-86-panel)
  - [Guition ESP32-P4 JC4880P443 (4.3")](/devices/esp32-p4-jc4880p443)
  - [Guition ESP32-P4 JC8012P4A1 (10.1")](/devices/esp32-p4-jc8012p4a1)
- [Home Assistant](https://www.home-assistant.io/) with at least one `media_player` entity
- Google Chrome or Microsoft Edge (for the web installer)
- A USB-C cable

## Flash firmware

Click **Install** on your device to flash the firmware directly from your browser. No ESPHome dashboard or YAML required.

<InstallButton />

::: tip
If you prefer to install via the ESPHome dashboard, see [ESPHome Config](/advanced/esphome-config).
:::

## Connect to Wi-Fi

After flashing, the device creates a Wi-Fi hotspot called **esphome-media-player**. Connect to it from your phone or laptop and enter your home Wi-Fi credentials. The device will reboot and join your network.

## Add to Home Assistant

1. Home Assistant should automatically discover the device under **Settings → Devices & Services**. Click **Configure** to add it.

   ![Discovered device](./images/ha-discovered.png)

2. Once added, find the device under **Settings → Devices & Services → ESPHome**.

   ![ESPHome device list](./images/ha-esphome-list.png)

3. Open the device page and set the **Media Player Entity** field to the `media_player` entity you want to control (e.g. `media_player.living_room_speaker`).

   ![ESPHome device page](./images/ha-esphome-device.png)

4. Enable the media player controls for the entity if prompted.

   ![Enable controls](./images/ha-enable-controls.png)

That's it — the screen should start showing now-playing info from your selected media player.

## Next steps

- [Firmware Updates](/features/firmware-updates) — automatic over-the-air updates
- [Settings](/features/settings) — configure brightness, timeouts, and display options
- [Speaker Grouping](/features/speaker-grouping) — set up multi-room speaker control
- [Source Inputs](/features/source-inputs) — show media info from a TV or Line-in input
- [Troubleshooting](/advanced/troubleshooting) — common issues and fixes
