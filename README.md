# ESPHome Media Controller for Home Assistant

A touchscreen media controller that shows album art and track info and lets you control play, pause, skip, and volume from any Home Assistant media player. Supports **4"** and **10.1"** panels. Built with [ESPHome](https://esphome.io/) and [LVGL](https://lvgl.io/); tested with Google and Sonos speakers.

![ESPHome Media Controller](images/guition-esp32-s3-4848s040-example1.jpg)

---

## Features

- **Album art** — Full-screen cover art from Home Assistant, with smooth transitions between tracks
- **Accent color** — Dominant color extracted from album art, applied to the UI and exposed as an HA light entity
- **Now playing** — Title, artist, elapsed/remaining time, and progress bar
- **Touch controls** — Play/pause, swipe for next/previous, volume arc dial (swipe down)
- **Screensaver** — Day/night aware dimming and screen-off when paused
- **Configurable from Home Assistant** — Media player, brightness, timeouts, track info duration; no reflashing

*Full details: [Features](https://jtenniswood.github.io/esphome-media-player/features)*

---

## Demo

[![ESPHome Media Player Demo Video](https://img.youtube.com/vi/aShTf0Q-5A0/maxresdefault.jpg)](https://youtu.be/aShTf0Q-5A0)

[**Watch on YouTube**](https://youtu.be/aShTf0Q-5A0)

---

## Get started

Install guide, web installer, and device setup are on the documentation site:

<a href="https://jtenniswood.github.io/esphome-media-player/">
  <img src="https://img.shields.io/badge/Open_Documentation_%26_Installer-blue?style=for-the-badge&logo=esphome&logoColor=white" alt="Open Documentation & Installer" />
</a>

---

## Documentation

The [documentation site](https://jtenniswood.github.io/esphome-media-player/) has the install guide, configurable settings, manual setup (ESPHome dashboard), and troubleshooting.

**Supported panels and where to buy:** [Devices](https://jtenniswood.github.io/esphome-media-player/devices/esp32-s3-4848s040) (4" and 10.1" options with links).

---

## Viewing device logs

Artwork load errors (e.g. when album art fails to download) are logged by the device. To see these messages in Home Assistant for remote debugging:

1. Open **Settings → Devices & Services → ESPHome** and select your device.
2. Click **Configure** and enable **Subscribe to logs from the device**.
3. When enabled, the device sends logs to Home Assistant; view them in **Settings → System → Logs** (or **Developer Tools → Logs**). Filter by your device name or search for the `artwork` tag to find artwork-related errors.

---

## Feedback

If you have any feedback or suggestions, please open an [issue](https://github.com/jtenniswood/esphome-media-player/issues).

---

## Gallery

![Volume controls](images/guition-esp32-s3-4848s040-volume.jpg)

More screenshots in the [documentation](https://jtenniswood.github.io/esphome-media-player/).
