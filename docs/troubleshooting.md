# Troubleshooting

Common issues and what to try.

## How do I configure a media player?

1. Add your speaker (or other player) to Home Assistant so it has a `media_player` entity (e.g. Sonos, Google Cast, or any integration that provides a media player).
2. Note the entity ID (e.g. `media_player.living_room`).
3. On the ESPHome device: **Settings → Devices & Services → ESPHome** → your device.
4. Under **Configuration**, find the **Media Player** field and enter that entity ID.

The display will start showing that player’s now-playing info. You can change it later without reflashing. See [Settings](/configurable-settings) for more detail.

## The artwork isn’t loading

Artwork is fetched from Home Assistant. If cover art never appears or stays broken:

- Check that your media player integration in Home Assistant provides artwork (e.g. in the entity’s attributes or media browser).
- If it still doesn’t work, please [open an issue on GitHub](https://github.com/jtenniswood/esphome-media-player/issues) and include:
  - **Media player type** (e.g. Sonos, Google Cast, Plex).
  - **Service / integration** (e.g. “Sonos integration”, “Google Cast”).
  - **Device logs** from the ESPHome device (or Home Assistant logs) if there are any errors.

That helps add or fix support for your setup.

## Controls don’t respond

Play, pause, skip, and volume are sent from the panel to Home Assistant. If taps or swipes don’t do anything:

1. Go to **Settings → Devices & Services → Integrations** and click **ESPHome** (not the device count).
2. Find your device and click the **cog** to open its settings.
3. Enable **“Allow the device to perform Home Assistant actions”** and save.

Until this is enabled, the device cannot control your media player. See [Step 5: Enable device controls](/#step-5-enable-device-controls) in Getting Started.

## Flashing doesn’t work

The web installer and pre-built firmware only support the devices listed on the [Getting Started](/#what-you-need) page (e.g. Guition ESP32-S3 4848S040 and Guition ESP32-P4 JC8012P4A1). If you have a different board or panel:

- It may be an **unsupported device type**. We don’t provide installable images for every ESP32-based display; only the ones we document.
- Try the [CH340 USB driver](https://www.wch-ic.com/downloads/CH341SER_EXE.html) if the port doesn’t appear at all.
- For full control over the build, use [Manual Setup](/manual-setup) with the ESPHome dashboard and the appropriate device package from the repository (if available for your hardware).

If you believe your device is supported and flashing still fails, open an [issue on GitHub](https://github.com/jtenniswood/esphome-media-player/issues) with your device name and what happens when you try to flash.
