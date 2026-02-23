# Events & automations

The media controller exposes interaction events to Home Assistant so you can trigger automations when someone uses the panel: play/pause, skip track, or change volume (and on the 4" device, when switching to or from TV mode).

## Requirements

- **Home Assistant 2024.5 or newer** (required for ESPHome event entities).
- **You do not need to enable “Subscribe to logs”** for automations. Events are sent over the ESPHome API and appear as an event entity in Home Assistant. Use that entity as an automation trigger.

### Optional: See events in the Logs panel

If you want to see interaction messages (e.g. “Media: play_pause”) in **Settings → System → Logs**, you can enable **Subscribe to logs from the device** in the device’s ESPHome integration settings in Home Assistant. This is only for visibility and debugging; automations work without it.

## Event entity

After the device is set up and connected to Home Assistant, you get an event entity named **Media control** under the device. In the frontend: **Settings → Devices & services → [your device]** → look for the “Media control” event entity.

## Event types

| Event type        | When it fires                          | Available on        |
|-------------------|----------------------------------------|---------------------|
| `play_pause`      | User taps the play/pause button       | Both devices        |
| `next_track`      | User swipes to skip to next track     | Both devices        |
| `previous_track`  | User swipes to go to previous track   | Both devices        |
| `volume_change`   | User changes volume (arc or buttons) | Both devices        |
| `tv_mode_enter`   | User switches to TV source mode      | 4" (S3) only        |
| `tv_mode_exit`    | User switches back from TV mode      | 4" (S3) only        |

These events are available on the [Guition ESP32-S3 4848S040 (4")](/devices/esp32-s3-4848s040) and [Guition ESP32-P4 JC8012P4A1 (10.1")](/devices/esp32-p4-jc8012p4a1).

## Using events in automations

1. In Home Assistant, go to **Settings → Automations & Scenes** and create or edit an automation.
2. Under **Triggers**, add a trigger and choose **Event** (or **Device** and then pick an event-based trigger).
3. Select your media controller **device** and the **Media control** event entity.
4. Choose the **Event type** you want (e.g. `next_track`, `volume_change`, `play_pause`).
5. Add your conditions and actions as usual.

### Example: announce when user skips track

Trigger on the device’s “Media control” event with event type `next_track`, then call a TTS or notify action (e.g. announce “Skipping to next track” or the new track name from the media player).

### Example: sync volume to another speaker

Trigger on event type `volume_change`, then in the action read the media player’s `volume_level` and set another media player’s volume to match.

### Adding the trigger in the UI

The easiest way is to use the **visual editor**: add a trigger, choose **Device** (or **Event**), select your media controller device, then pick the **Media control** event entity and the event type (e.g. `next_track`). Home Assistant will generate the correct trigger for you. The exact trigger format in YAML depends on your Home Assistant version; the UI ensures compatibility.
