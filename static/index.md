---
layout: default
---

<script
  type="module"
  src="https://unpkg.com/esp-web-tools@10/dist/web/install-button.js?module"
></script>

# Music Dashboard for ESPHome

A touch-screen music dashboard for the **Guition ESP32-S3-4848S040**, built with [ESPHome](https://esphome.io/) and [LVGL](https://lvgl.io/). It connects to [Home Assistant](https://www.home-assistant.io/) to display album art, now-playing information, and playback controls for any media player entity.

---

## What You Need

Before you begin, make sure you have:

- A **Guition ESP32-S3-4848S040** panel -- [buy on AliExpress](https://s.click.aliexpress.com/e/_c3sIhvBv) (~£16)
- A **USB-C cable** to connect the panel to your computer
- A computer running **Google Chrome**, **Microsoft Edge**, or **Opera** (these browsers support Web Serial, which is required to flash the device)
- **Home Assistant** installed and running on your network
- A **media player** already set up in Home Assistant (for example, a Sonos speaker, Google Cast device, or any `media_player` entity)

---

## Step 1: Install the Firmware

1. Plug the Guition panel into your computer using a USB-C cable.
2. Click the **Install** button below.
3. A popup will ask you to select a serial port. Choose the one that appeared when you plugged in the device.
4. Wait for the installation to complete. This takes about two minutes.

> **Tip:** If no serial port appears, you may need to install the [CH340 USB driver](https://www.wch-ic.com/downloads/CH341SER_ZIP.html) for your operating system.

<esp-web-install-button manifest="firmware/music-dashboard.manifest.json">
  <button slot="activate">Install Music Dashboard</button>
  <span slot="unsupported">Your browser does not support Web Serial. Please open this page in Google Chrome, Microsoft Edge, or Opera.</span>
  <span slot="not-allowed">You need to open this page with HTTPS or on localhost to install firmware.</span>
</esp-web-install-button>

---

## Step 2: Connect to WiFi

After the firmware is installed, the device needs to connect to your WiFi network.

1. On your phone or computer, look for a new WiFi network called **music-dashboard-XXXXXX** (the last part is unique to your device).
2. Connect to that WiFi network.
3. A setup page should open automatically. If it does not, open a browser and go to **192.168.4.1**.
4. Select your home WiFi network from the list and enter your WiFi password.
5. Click **Save**. The device will restart and connect to your home network.

> **Note:** After the device connects to your WiFi, the temporary hotspot disappears. You do not need to reconnect -- the device remembers your WiFi credentials.

---

## Step 3: Add to Home Assistant

Once the device is on your WiFi network, Home Assistant will discover it automatically.

1. Open Home Assistant and go to **Settings > Devices & Services**.
2. You should see a notification that a new ESPHome device was discovered. Click **Configure**.
3. Follow the prompts to add the device. It will appear under the **ESPHome** integration.
4. The device is now connected with default settings.

> **Tip:** If the device does not appear within a minute, make sure it is on the same network as Home Assistant. You can also try going to **Settings > Devices & Services > Add Integration > ESPHome** and entering the device's IP address manually.

---

## Step 4: Configure Your Media Player

The device ships with default placeholder settings. To point it at your actual media player:

1. In Home Assistant, go to **Settings > Add-ons > ESPHome** and open the ESPHome dashboard.
2. The device should appear as a discovered device. Click **Adopt** to add it to your ESPHome dashboard.
3. Once adopted, click **Edit** to open the device configuration.
4. Update the `substitutions` block at the top with your own values:

```yaml
substitutions:
  name: "living-room-music"                         # Device hostname (lowercase, hyphens, no spaces)
  friendly_name: "Living Room Music"                 # Name shown in Home Assistant
  room: "Living Room"                                # Home Assistant area
  media_player: "media_player.living_room_speaker"   # Your media player entity ID
  home_assistant_url: "http://homeassistant.local:8123"  # Your Home Assistant URL
```

5. Add your WiFi credentials below the substitutions:

```yaml
wifi:
  ssid: !secret wifi_ssid
  password: !secret wifi_password
```

6. Click **Install** and choose **Wirelessly** to push the updated configuration to the device.

> **Finding your media player entity ID:** In Home Assistant, go to **Settings > Devices & Services > Entities** and search for your speaker or media player. The entity ID looks like `media_player.kitchen_sonos` or `media_player.living_room_speaker`.

---

## Firmware Updates

When a new version of the firmware is released, your device will detect it automatically. A **Firmware Update** notification will appear on the device page in Home Assistant. Click **Install** to update the device over the air -- no USB cable or recompilation needed.

---

## Need Help?

If you run into any issues, please [open an issue on GitHub](https://github.com/jtenniswood/esphome-media-player/issues). Include as much detail as you can, such as error messages, what step you are on, and your browser and operating system.

For more details about the project, features, and advanced configuration, see the [full documentation on GitHub](https://github.com/jtenniswood/esphome-media-player/tree/main/guition-esp32-s3-4848s040).
