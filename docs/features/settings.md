# Settings

Most settings are configurable from the device page in Home Assistant (**Settings → Devices & Services → ESPHome** → your device) — no YAML or reflashing needed.

![Device settings](../images/ha-device-settings.png)

## Screen Saver

See [Screen Saver](/features/screen-saver) for all brightness, timer, clock, and day/night screen saver settings.

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
| **Install Latest Firmware** | Manually triggers an update check and install. |

See [Firmware Updates](/features/firmware-updates) for full details.
| **Source Input Media Player** | (Optional) Entity ID of a media player connected to the speaker's TV or Line In input. See [Source Inputs](/features/source-inputs). Leave empty to disable. |
| **Speaker Group Sensor** | (Optional) Entity ID of the template sensor for [Speaker Grouping](/features/speaker-grouping). Leave empty to disable. |
