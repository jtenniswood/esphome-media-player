# Screen Saver

When playback is paused, the device uses a two-stage screen saver to reduce power consumption and prevent burn-in. All settings are configurable from the device page in Home Assistant (**Settings → Devices & Services → ESPHome** → your device).

## How it works

1. **Dimming** — After **Screen Saver: Paused Dimming** elapses (default: 60 s), the screen dims to the **Day/Night: Dim Brightness** level.
2. **Screen saver** — After **Screen Saver: Timer** elapses (default: 300 s), the screen saver activates:
   - If **Screen Saver: Clock** is enabled, a large `HH:MM` clock is shown at **Screen Saver: Clock Brightness**.
   - If **Screen Saver: Clock** is disabled and the **Day/Night: Screen Saver** switch is on, the screen turns off completely.
   - If both are disabled, the screen stays at dim brightness indefinitely.

Any touch or new media playback instantly returns the display to full active brightness.

[Night Schedule](/features/night-schedule) is separate from this screen saver. The screen saver reacts to playback and idle time while the device is awake. Night Schedule can turn the backlight fully off during saved hours and pause artwork downloads while asleep.

## Clock screen saver

An optional clock screen saver displays the current time in large, thin digits on a black background. When enabled, it replaces the screen-off stage — the display is never fully dark.

The clock position drifts subtly each minute across a small region to prevent burn-in. Brightness is controlled independently via **Screen Saver: Clock Brightness** (default: 35%).

## Day/Night awareness

Brightness levels and screen saver behavior adapt automatically based on whether it is currently "day" or "night":

- **Daytime** — uses **Day: Active Brightness**, **Day: Dim Brightness**, and the **Day: Screen Saver** switch.
- **Nighttime** — uses **Night: Active Brightness**, **Night: Dim Brightness**, and the **Night: Screen Saver** switch.

This lets you configure different behavior for day and night — for example, keeping the screen on during the day but turning it off at night. On the ESP32-P4, [Screen Tone](/features/settings#screen-tone) warmth also follows the same day/night detection, so album art can shift warmer at night.

By default, the device reads the `sun.sun` entity in Home Assistant (sun above horizon = day, below horizon = night). If that state is not available yet, the device uses daytime brightness as a safe fallback. You can override day/night detection with any `binary_sensor` or `input_boolean` entity by setting the **Day-Night Sensor** field on the device page.

### Custom day/night sensor

To use your own logic for day vs night:

1. Create a `binary_sensor` or `input_boolean` helper in Home Assistant that reflects your preferred day/night state (`on` = day, `off` = night).
2. On the ESPHome device page (**Settings → Devices & Services → ESPHome** → your device), enter the entity ID in the **Day-Night Sensor** field — for example, `binary_sensor.daytime` or `input_boolean.is_daytime`.
3. The device will immediately start using the custom sensor instead of `sun.sun`.

To revert to the default sun-based behavior, clear the **Day-Night Sensor** field.

This is useful when you want day/night to depend on more than just the sun — for example, room lighting levels, party mode, or a time-based schedule.

## Settings

### Timers

| Setting | Description | Default |
|---------|-------------|---------|
| **Screen Saver: Paused Dimming** | Time after playback pauses before the screen dims. | 60 s |
| **Screen Saver: Timer** | Time after dimming before the screen saver activates. | 300 s |

### Clock

| Setting | Description | Default |
|---------|-------------|---------|
| **Screen Saver: Clock** | Enable the clock screen saver. When on, a 24-hour clock (`HH:MM`) is shown instead of turning the screen off. | On |
| **Screen Saver: Clock Brightness** | Backlight level for the clock screen saver. | 35% |
| **Clock: Timezone** | City-based timezone for the clock display. Select the nearest city to your location — DST is handled automatically for cities that observe it. | UTC |

### Brightness

| Setting | Description | Default |
|---------|-------------|---------|
| **Day: Active Brightness** | Screen brightness during active use (daytime). | 100% |
| **Night: Active Brightness** | Screen brightness during active use (nighttime). | 75% |
| **Day: Dim Brightness** | Screen brightness when dimmed (daytime). | 35% |
| **Night: Dim Brightness** | Screen brightness when dimmed (nighttime). | 25% |

### Screen saver switches

| Setting | Description | Default |
|---------|-------------|---------|
| **Day: Screen Saver** | When enabled, the screen turns off after the timer elapses (daytime). When disabled, the screen stays dimmed. | On |
| **Night: Screen Saver** | When enabled, the screen turns off after the timer elapses (nighttime). When disabled, the screen stays dimmed. | On |
