# Configurable settings

All of these are available from the device page in Home Assistant (**Settings → Devices & Services → ESPHome** → your device). No YAML or reflashing needed.

## Media player selection

After first boot, the display shows **“Set media player in device settings”** until a player is set:

1. Open your device under **ESPHome**.
2. Under **Configuration**, find the **Media Player** field.
3. Enter the entity ID (e.g. `media_player.living_room`).

The device updates immediately and keeps your choice across reboots. You can change it anytime. See [How do I configure a media player?](/troubleshooting#how-do-i-configure-a-media-player) if you need more detail.

## Backlight and screensaver

These are under the device’s **Configuration** section. Values persist across reboots.

### Switches

| Setting                 | Default | Description                                                                                       |
| ----------------------- | ------- | ------------------------------------------------------------------------------------------------ |
| Daytime Screen Saver   | ON      | Allow the screen to turn off during the day. Off = stays dimmed only.                           |
| Nighttime Screen Saver | ON      | Allow the screen to turn off at night. Off = stays dimmed only.                                  |

### Brightness

| Setting              | Range     | Step | Default | Description                               |
| -------------------- | --------- | ---- | ------- | ----------------------------------------- |
| Day Dim Brightness   | 0–100%    | 5%   | 35%     | Brightness when dimmed during the day     |
| Night Dim Brightness | 0–100%    | 5%   | 25%     | Brightness when dimmed at night            |

### Timeouts

| Setting             | Range     | Step | Default | Description                                    |
| ------------------- | --------- | ---- | ------- | ---------------------------------------------- |
| Dim Timeout         | 1–300 s   | 1 s  | 60 s    | Inactivity before the screen dims              |
| Screen Off Timeout  | 1–600 s   | 1 s  | 300 s   | Time after dimming before the screen turns off |

### Track info

| Setting             | Range | Step | Default | Description                                                                                                                                                                                                 |
| ------------------- | ----- | ---- | ------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Track Info Duration | 0–60 s| 1 s  | 5 s     | How long the track info overlay stays visible after artwork has loaded (or after playback starts) before auto-hiding. **0** = never show on new track and no auto-hide timer. Tap to show again after auto-hide; it then hides only on another tap or when a new track is requested. When playback is paused, track info stays visible; the timer starts when playback resumes. |
