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


## Setup the Speaker Group helper

1. Go to **Settings → Devices & Services → Helpers** tab
2. Click **+ Create Helper** → **Template** → **Template a sensor**
3. Name the sensor `Speaker Group`
4. Paste in this code, changing sonos for the integration you wish to use.

```
{%- set s = integration_entities("sonos") | select("match", "media_player") | list -%}
{{ s | map("replace", "media_player.", "") | join(",") }}|{{ s | map("state_attr", "friendly_name") | join(",") }}|{{ s | map("state_attr", "volume_level") | join(",") }}
```

Leave all other fields as default and click **Submit**.

## Behavior

- The speaker list appears in the settings panel (swipe down) when there are at least two speakers from the configured integration