# Speaker Grouping

Control multi-room speaker groups directly from the touchscreen panel. The settings panel (swipe down) shows a speaker list on the right side where you can add or remove speakers from the group and adjust individual volumes.

![Speaker grouping panel](/images/guition-esp32-p4-jc8012p4a1-multi-speaker.jpg)

## How it works

- The panel auto-discovers all speakers from the configured integration in your Home Assistant instance
- The currently selected speaker is shown first
- The main volume adjusts all grouped speakers proportionally, keeping their relative balance
- Per-speaker `−` / `+` buttons let you fine-tune individual volumes within the group
- The toggle states update automatically when the group changes

## Compatibility

This feature relies on Home Assistant's `media_player.join` and `media_player.unjoin` services. These are only available on speaker platforms that support grouping. If your speakers don't support these services, the grouping controls will not work.


| Platform             | Supported | Integration name       |
| -------------------- | --------- | ---------------------- |
| Sonos                | Yes       | `sonos`                |
| Google Cast          | Yes       | `cast`                 |
| HEOS (Denon/Marantz) | Yes       | `heos`                 |
| Yamaha MusicCast     | Yes       | `yamaha_musiccast`     |
| LinkPlay             | Yes       | `linkplay`             |
| Bluesound            | Yes       | `bluesound`            |
| Bang & Olufsen       | Yes       | `bang_olufsen`         |


## Setup the Speaker Group sensor

Add the following template sensor to your Home Assistant `configuration.yaml`, replacing `sonos` with the integration you wish to use:

```yaml
template:
  - sensor:
      - name: "Speaker Group"
        state: >
          {%- set s = integration_entities("sonos") | select("match", "media_player") | list -%}
          {{ s | count }}
        attributes:
          data: >
            {%- set s = integration_entities("sonos") | select("match", "media_player") | list -%}
            {{ s | map("replace", "media_player.", "") | join(",") }}|{{ s | map("state_attr", "friendly_name") | join(",") }}|{{ s | map("state_attr", "volume_level") | join(",") }}
```

Restart Home Assistant after saving. To verify, check **Developer Tools → States** and look for `sensor.speaker_group` — the state should show the number of speakers and the `data` attribute should contain the pipe-delimited speaker info.

> **Migrating from the old UI helper?** If you previously created a `Speaker Group` helper via **Settings → Helpers**, delete it first to avoid a naming conflict.

## Behavior

- The speaker list appears in the settings panel (swipe down) when there are at least two speakers from the configured integration