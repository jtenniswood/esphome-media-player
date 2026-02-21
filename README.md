# Guition ESP32-S3 4848S040 (4.0") Media Controller

![Guition ESP32-S3 Media Controller](images/guition-esp32-s3-4848s040-example1.jpg)

## Guition ESP32-S3 Media Controller

I really wanted a way to control my music, whilst being able to see the track cover art, without costing a fortune, by using this £15 [Guition ESP32-S3-4848S040](https://s.click.aliexpress.com/e/_c3sIhvBv) screen and home assistant.

It is built with [ESPHome](https://esphome.io/) and [LVGL](https://lvgl.io/). It connects to [Home Assistant](https://www.home-assistant.io/) to control and collect the track data, and has been tested with Google and Sonos speakers.

---

## Where to Buy

- **Panel:** [AliExpress](https://s.click.aliexpress.com/e/_c3sIhvBv) (~£16)

## Stand

- **Desktop stand** (3D printable): [MakerWorld](https://makerworld.com/en/models/2327976-touch-screen-desktop-stand-for-guition-4848s040#profileId-2543111)

---

### Demo Video

[![ESPHome Media Player Demo Video](https://img.youtube.com/vi/aShTf0Q-5A0/maxresdefault.jpg)](https://youtu.be/aShTf0Q-5A0)

[▶️ **Watch on YouTube**](https://youtu.be/aShTf0Q-5A0)

---

## Features

### Album Art Display

Full-screen 480x480 album art fetched directly from your Home Assistant instance. When a new track starts, the current artwork dims to 40% opacity while the new image downloads, giving instant visual feedback that a change is happening. Once loaded, the new art fades back to full brightness. 

### Now Playing Info

Displays the song title, artist name, elapsed and remaining time, and a progress bar at the bottom of the screen. The progress bar updates every second with smooth interpolation between Home Assistant position updates. 

### Auto-Hide Track Info

When a new track starts, the overlay (title, artist, time, play/pause button) automatically appears. There are controls in the device page inside Home Assistant. Setting the timer to 0 will keep the overlay permanently visible. See [Configurable Settings](#configurable-settings) for details.

### Touch Controls

- **Play / Pause** -- corner button in the bottom-right corner toggles playback.
- **Next / Previous track** -- swipe the screen to change tracks. 
- **Volume** -- swipe down to open the settings panel, which shows an interactive arc dial. Drag the arc knob to set volume, or use the **+** and **-** buttons for fine 1% adjustments. The current volume percentage is displayed in the centre of the dial. Swipe up to close.
- Hide / ShowUI -- Tap anywhere when the track is playing to hide the UI information.

### Screensaver

When playback is paused, the device has a two-stage screensaver.

1. After a configurable period of inactivity, the screen dims to a day or night brightness level.
2. After a further timeout, the screen turns off completely.

Settings are fully configurable from Home Assistant (see [Configurable Settings](#configurable-settings) below).

---

## Configurable Settings

### Template Settings (set once during setup)

These values are defined in the `substitutions` block of your ESPHome configuration. You set them when you first create the device and they rarely need changing.


| Setting         | Description                              | Example                    |
| --------------- | ---------------------------------------- | -------------------------- |
| `name`          | Device hostname on your network          | `living-room-music`        |
| `friendly_name` | Display name shown in Home Assistant     | `Living Room Music`        |

### Media Player Selection (configurable at runtime)

The media player entity is configured from the Home Assistant device settings page — no YAML editing or reflashing required. After first boot, the display shows **"Set media player in device settings"** until you configure it:

1. Go to **Settings > Devices & Services > ESPHome** and click on your device.
2. Under **Configuration**, find the **Media Player** text field.
3. Enter the entity ID of the media player you want to control (e.g., `media_player.living_room`).

The device will immediately start tracking the selected media player. The selection persists across reboots. You can change it at any time without reflashing.

> **Tip:** If you already know your media player entity ID during setup, you can pre-fill it in the `substitutions` block with `media_player: "media_player.living_room"`. This sets the initial value so it's ready on first boot.


### Backlight and Screensaver Settings (adjustable at runtime)

![Home Assistant Settings](images/device-settings.png)

These settings are exposed as entities under the device's **Configuration** section in Home Assistant. All values persist across reboots.

**Switches:**


| Setting                | Default | Description                                                                                                    |
| ---------------------- | ------- | -------------------------------------------------------------------------------------------------------------- |
| Daytime Screen Saver   | ON      | Allow the screen to turn off completely during the day. When off, the screen stays dimmed but never turns off. |
| Nighttime Screen Saver | ON      | Allow the screen to turn off completely at night. When off, the screen stays dimmed but never turns off.       |


**Brightness:**


| Setting              | Range     | Step | Default | Description                                  |
| -------------------- | --------- | ---- | ------- | -------------------------------------------- |
| Day Dim Brightness   | 0 -- 100% | 5%   | 35%     | Screen brightness when dimmed during the day |
| Night Dim Brightness | 0 -- 100% | 5%   | 25%     | Screen brightness when dimmed at night       |


**Timeouts:**


| Setting            | Range      | Step | Default | Description                                       |
| ------------------ | ---------- | ---- | ------- | ------------------------------------------------- |
| Dim Timeout        | 1 -- 300 s | 1 s  | 60 s    | Seconds of inactivity before the screen dims      |
| Screen Off Timeout | 1 -- 600 s | 1 s  | 300 s   | Seconds after dimming before the screen turns off |


**Track Info:**


| Setting             | Range     | Step | Default | Description                                                                            |
| ------------------- | --------- | ---- | ------- | -------------------------------------------------------------------------------------- |
| Track Info Duration | 0 -- 60 s | 1 s  | 0 s     | Seconds the track info overlay stays visible after a track change. 0 = always visible. |


---

## Quick Install (Recommended)

The easiest way to get started -- no ESPHome knowledge required.

### What You Need

- A **Guition ESP32-S3-4848S040** panel (see [Where to Buy](#where-to-buy))
- A **USB-C cable**
- **Google Chrome** or **Microsoft Edge** on desktop
- **Home Assistant** with a media player entity already configured

### Step 1: Flash the Firmware

1. Connect the Guition panel to your computer with a USB-C cable.
2. Visit the **[Web Installer](https://jtenniswood.github.io/esphome-media-player/)** and click **Install**.
3. Select the serial port for your device and wait for the flash to complete.

> **Tip:** If the device is not detected, you may need to install the [CH340 USB driver](https://www.wch-ic.com/downloads/CH341SER_EXE.html) for your operating system.

### Step 2: Connect to WiFi

After flashing, the device will create a WiFi hotspot:

1. Connect to the hotspot from your phone or computer.
2. A captive portal will open -- enter your home WiFi network name and password.
3. The device will restart and connect to your network.

### Step 3: Adopt in Home Assistant

Once the device connects to your WiFi:

1. Home Assistant should automatically discover it. Check **Settings > Devices & Services** for a new ESPHome notification.
2. Click **Configure** and follow the prompts to adopt the device.
3. The device and its entities will appear in Home Assistant.

### Step 4: Select Your Media Player

1. Go to **Settings > Devices & Services > ESPHome** and click on your device.
2. Under **Configuration**, find the **Media Player** text field.
3. Enter the entity ID of the media player you want to control (e.g., `media_player.living_room`).

![Device Settings](images/device-settings.png)

### Automatic Updates

The device automatically checks for firmware updates every 6 hours. When an update is available, a **Firmware Update** entity appears in Home Assistant. You can trigger the update from there or let it notify you.

---

## Alternative: Manual install using ESPHome Dashboard

If you prefer full control through the ESPHome dashboard, see the [Manual Setup Guide](docs/manual-setup.md).

---

## Feedback

If you have any feedback or suggestions, please just log an issue.

---

## Gallery

![Volume Controls](images/guition-esp32-s3-4848s040-volume.jpg)
![Example Media](images/guition-esp32-s3-4848s040-example2.jpg)
![Example Media](images/guition-esp32-s3-4848s040-example3.jpg)