# Features

Overview of what the media controller does. Settings are described in [Configurable settings](/configurable-settings).

## Album art display

Full-screen album art is loaded from your Home Assistant instance. When a new track starts, the current artwork dims to 40% while the new image downloads, then fades back to full brightness. If artwork doesn’t appear, see [Troubleshooting](/troubleshooting#the-artwork-isnt-loading).

## Now playing info

The screen shows song title, artist, elapsed and remaining time, and a progress bar. The bar updates every second with smooth interpolation between position updates from Home Assistant.

## Auto-hide track info

When a new track is requested, the overlay (title, artist, time, play/pause) appears automatically if the duration is greater than 0. The hide timer starts when artwork has finished loading (or when playback starts); the default is 5 seconds. Set the duration to **0** in [Configurable settings](/configurable-settings) to never show track info when a new track is requested. After the overlay auto-hides, tap the screen to show it again; it then hides only when you tap again or when a new track is requested. When playback is paused, track info is shown by default; the hide timer starts when playback resumes.

## Touch controls

- **Play / Pause** — button in the bottom-right toggles playback.
- **Next / Previous** — swipe left or right to change tracks.
- **Volume** — swipe down to open the settings panel with an arc dial. Drag the knob or use + / − for 1% steps. Swipe up to close.
- **Hide / Show UI** — tap the screen during playback to hide or show the overlay.

## Screensaver

When playback is paused, the device uses a two-stage screensaver:

1. After a configurable inactivity period, the screen dims (day or night brightness).
2. After a further timeout, the screen turns off.

All timeouts and brightness levels are configurable from Home Assistant (see [Configurable settings](/configurable-settings)).
