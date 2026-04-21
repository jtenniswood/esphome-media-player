# Screen Schedule

Screen Schedule lets the display go fully dark during hours when you do not want the media controller visible, such as overnight.

It is separate from the normal [Screen Saver](/features/screen-saver). The screen saver still handles dimming while the device is awake. Screen Schedule is the stronger rule: outside the saved hours, the backlight is turned off and artwork downloads are paused.

## Settings

All schedule controls are on the Home Assistant device page under the ESPHome device configuration.

The schedule uses the selected **Clock: Timezone** setting. If the device has not received a valid time from Home Assistant yet, it will not force the screen on or off.

| Setting | Description | Default |
|---------|-------------|---------|
| **Screen Schedule** | Enables automatic sleep and wake times. When off, the device uses the normal screen saver only. | Off |
| **Screen Schedule: On Time** | First whole hour when the screen should be awake. | 6:00 AM |
| **Screen Schedule: Off Time** | First whole hour when the screen should sleep. | 11:00 PM |

Home Assistant shows the on/off time selectors even when the schedule is off. They are ignored until **Screen Schedule** is enabled.

## How The Time Window Works

The on time is included. The off time is excluded.

For example, **6:00 AM** to **11:00 PM** means the screen wakes at 6:00 AM and sleeps at 11:00 PM.

Overnight ranges are supported. For example, **8:00 PM** to **7:00 AM** keeps the screen awake overnight and sleeps during the day.

If the on and off times are the same, the schedule is treated as always on.

## Manual Wake And Sleep

Touch works alongside the saved schedule:

| Gesture | Result |
|---------|--------|
| Tap while the screen is asleep | Wakes the screen without changing the saved schedule. |
| Press and hold for 3 seconds | Puts the screen to sleep manually. |

Manual sleep is deliberate. If you long-press during scheduled-on hours, the schedule will not immediately wake the screen again. Tap the screen to wake it.

If you tap to wake outside the scheduled-on hours, the screen stays awake for about 2 minutes, then the schedule may put it back to sleep.

## Artwork Downloads

While the screen is asleep, artwork downloads are paused. This avoids using network and memory for images that cannot be seen. When the screen wakes, the current artwork request is resumed.
