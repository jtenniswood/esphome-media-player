# Settings

Most settings are configurable from the device page in Home Assistant (**Settings → Devices & Services → ESPHome** → your device) — no YAML or reflashing needed.

![Device settings](../images/ha-device-settings.png)

## Screen Saver

See [Screen Saver](/features/screen-saver) for all brightness, timer, clock, and day/night screen saver settings.

| Setting | Description |
|---------|-------------|
| **Day-Night Sensor** | (Optional) Entity ID of a `binary_sensor` or `input_boolean` to control day/night mode (`on` = day, `off` = night). Leave empty to use `sun.sun` (default). See [Screen Saver](/features/screen-saver#custom-day-night-sensor). |
| **Clock: Timezone** | City-based timezone for the clock screen saver. Select the nearest city to your location from the dropdown — DST is handled automatically. Defaults to UTC. |

## Screen Tone <Badge type="info" text="ESP32-P4 only" />

Shifts album art toward warmer colors (reduced blue, slight red boost) for a more comfortable viewing experience — especially at night. Separate day and night sliders follow the same [day/night detection](/features/screen-saver#day-night-awareness) used by screen brightness. The tint updates instantly without reloading the image.

| Setting | Description |
|---------|-------------|
| **Day: Screen Warmth** | Warmth applied to album art during the day. 0% = no tint, 100% = maximum warmth. Default: 30%. |
| **Night: Screen Warmth** | Warmth applied to album art at night. 0% = no tint, 100% = maximum warmth. Default: 60%. |

## Speakers

| Setting | Description |
|---------|-------------|
| **Speakers: Auto-Close Timeout** | Time without any touch interaction before the speaker panel automatically closes and returns to the now-playing view. Set to 0 to disable (panel stays open until manually closed). Default: 15 seconds. |

## Playback

| Setting | Description |
|---------|-------------|
| **Playback: Show Remaining Time** | When enabled, the time label shows elapsed and remaining time. When disabled, it shows elapsed and total duration. Tap the time label on the device to toggle this at any time. |
| **Media Player Entity** | The `media_player` entity to control. |

## Firmware Updates

![Firmware update controls](../images/ha-firmware.png)

| Setting | Description |
|---------|-------------|
| **Auto Update** | When enabled, firmware updates are installed automatically when detected. Default: on. |
| **Update Frequency** | How often the device checks for updates: Hourly, Daily (default), or Weekly. |
| **Firmware Update** | Shows current and latest firmware versions with an install button when an update is available. |
| **Check Latest Firmware** | Manually checks for updates without installing them. |
| **Install Latest Firmware** | Manually triggers an update check and install. |

See [Firmware Updates](/features/firmware-updates) for full details.
| **Source Input Media Player** | (Optional) Entity ID of a media player connected to the speaker's TV or Line-in input. See [Source Inputs](/features/source-inputs). Leave empty to disable. |
| **Speaker Group Sensor** | (Optional) Entity ID of the template sensor for [Speaker Grouping](/features/speaker-grouping). Leave empty to disable. |
