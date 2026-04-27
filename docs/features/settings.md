# Settings

Most settings are configurable from the device page in Home Assistant (**Settings → Devices & Services → ESPHome** → your device) — no YAML or reflashing needed.

![Device settings](../images/ha-device-settings.png)

## Screen Saver

The browser Settings tab groups screen saver controls into idle screen behavior, brightness, and day/night behavior. See [Screen Saver](/features/screen-saver) for the full behavior details.

| Setting | Description |
|---------|-------------|
| **Dim After** | Time after playback pauses before the screen dims. |
| **Then After** | Time after dimming before the idle action runs. |
| **Day Action** | What happens during the day: show clock, turn screen off, or stay dimmed. |
| **Night Action** | What happens at night: show clock, turn screen off, or stay dimmed. |
| **Clock Brightness** | Backlight level for the clock idle screen. |
| **Night Schedule** | Optional daily schedule that turns the screen off outside the selected on/off hours. |
| **Day/Night: Active Brightness** | Brightness during active use for day and night. |
| **Day/Night: Dim Brightness** | Brightness after the paused dimming timer for day and night. |
| **Day/Night Source** | (Optional) Entity ID of a `binary_sensor` or `input_boolean` to control day/night mode (`on` = day, `off` = night). Leave empty to use `sun.sun` (default). See [Screen Saver](/features/screen-saver#custom-day-night-sensor). |

## Screen Tone <Badge type="info" text="ESP32-P4 only" />

Shifts album art toward warmer colors (reduced blue, slight red boost) for a more comfortable viewing experience — especially at night. Separate day and night sliders follow the same [day/night detection](/features/screen-saver#day-night-awareness) used by screen brightness. The tint updates instantly without reloading the image.

| Setting | Description |
|---------|-------------|
| **Day: Screen Warmth** | Warmth applied to album art during the day. 0% = no tint, 100% = maximum warmth. Default: 30%. |
| **Night: Screen Warmth** | Warmth applied to album art at night. 0% = no tint, 100% = maximum warmth. Default: 60%. |

## Volume

| Setting | Description |
|---------|-------------|
| **Speaker Panel Auto-Close** | Turns automatic closing of the volume/speaker panel on or off. Default: on. |
| **Speaker Panel Auto-Close Timer** | Time without any touch interaction before the speaker panel automatically closes and returns to the now-playing view. Hidden in the browser when auto-close is off. Default: 15 seconds. |
| **Source Input Media Player** | (Optional) Entity ID of a media player connected to the speaker's TV or Line-in input. See [Source Inputs](/features/source-inputs). Leave empty to disable. |
| **Speaker Group Sensor** | (Optional) Entity ID of the template sensor for [Speaker Grouping](/features/speaker-grouping). Leave empty to disable. |

## Playback

| Setting | Description |
|---------|-------------|
| **Track Clock** | Browser setting for the now-playing time label. On shows time remaining; off shows the track length. Tap the time label on the device to toggle this at any time. |
| **Media Player Entity** | The `media_player` entity to control. |

## Advanced

| Setting | Description |
|---------|-------------|
| **Linked Media Player** | Optional `media_player` entity used when the main speaker switches to a TV or Line-in source. The screen can show now-playing details from this related player instead of the main speaker. |

## Device

The browser Device tab contains clock settings, supported rotation controls, and firmware update controls.

![Firmware update controls](../images/ha-firmware.png)

| Setting | Description |
|---------|-------------|
| **Screen: Timezone** | IANA-style timezone for the clock and scheduled screen-off controls. The browser shows the current GMT offset. Defaults to UTC. |
| **Screen Rotation** | Rotation control shown only on devices that support changing orientation from the browser UI. |
| **Firmware: Auto Update** | When enabled, firmware updates are installed automatically when detected. Default: on. |
| **Firmware: Update Frequency** | How often the device checks for updates: Hourly, Daily (default), or Weekly. |
| **Firmware: Update** | Installs a checked update when one is available. |
| **Firmware: Check for Update** | Checks public releases without installing. The same browser button changes to **Install Update** after a newer version is found. |

See [Firmware Updates](/features/firmware-updates) for full details.
