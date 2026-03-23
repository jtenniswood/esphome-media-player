# Display Rotation

Both devices support display rotation for different mounting orientations (for example to change which side the power cable exits from). Set `display_rotation` and update `touch_swap_xy` / `touch_mirror_x` / `touch_mirror_y` to match.

::: warning
If you set `display_rotation` without updating the touch transform values, the screen image will be rotated but taps will register in the wrong position.
:::

## ESP32-S3 4848S040

The 480×480 square display supports all four rotations. At **270°** use **axis swap** with **both mirrors off** so taps and swipes line up with the rotated image.

| `display_rotation` | `touch_swap_xy` | `touch_mirror_x` | `touch_mirror_y` |
| ------------------- | ---------------- | ----------------- | ----------------- |
| `"0"` (default)     | `"false"`        | `"false"`         | `"false"`         |
| `"90"`              | `"false"`        | `"true"`          | `"false"`         |
| `"180"`             | `"false"`        | `"true"`          | `"true"`          |
| `"270"`             | `"true"`         | `"false"`         | `"false"`         |

### Example: 90-degree rotation

```yaml
substitutions:
  name: "music-dashboard"
  friendly_name: "Music Dashboard"
  display_rotation: "90"
  touch_mirror_x: "true"
  touch_mirror_y: "false"

wifi:
  ssid: !secret wifi_ssid
  password: !secret wifi_password

packages:
  music_dashboard:
    url: https://github.com/jtenniswood/esphome-media-player
    files: [guition-esp32-s3-4848s040/packages.yaml]
    ref: main
    refresh: 1s
```

### Example: 270-degree rotation

```yaml
substitutions:
  name: "music-dashboard"
  friendly_name: "Music Dashboard"
  display_rotation: "270"
  touch_swap_xy: "true"
  touch_mirror_x: "false"
  touch_mirror_y: "false"

wifi:
  ssid: !secret wifi_ssid
  password: !secret wifi_password

packages:
  music_dashboard:
    url: https://github.com/jtenniswood/esphome-media-player
    files: [guition-esp32-s3-4848s040/packages.yaml]
    ref: main
    refresh: 1s
```

## ESP32-P4 JC8012P4A1

The rectangular display supports both landscape and portrait orientations, each with a 180° flip option. Use the matching packages file for your orientation.

### Landscape (default)

Use `packages.yaml` (or `packages-landscape.yaml`). To flip 180°, override `display_rotation` and touch mirrors:

| `display_rotation` | `touch_swap_xy` | `touch_mirror_x` | `touch_mirror_y` |
| ------------------- | --------------- | ----------------- | ----------------- |
| `"90"` (default)    | `"true"`        | `"false"`         | `"false"`         |
| `"270"`             | `"true"`        | `"true"`          | `"true"`          |

### Portrait

Use `packages-portrait.yaml`. To flip 180°, override `display_rotation` and touch mirrors:

| `display_rotation` | `touch_swap_xy` | `touch_mirror_x` | `touch_mirror_y` |
| ------------------- | --------------- | ----------------- | ----------------- |
| `"0"` (default)     | `"false"`       | `"true"`          | `"false"`         |
| `"180"`             | `"false"`       | `"false"`         | `"true"`          |

### Example: flipped landscape

```yaml
substitutions:
  name: "music-dashboard-10inch"
  friendly_name: "Music Dashboard 10inch"
  display_rotation: "270"
  touch_swap_xy: "true"
  touch_mirror_x: "true"
  touch_mirror_y: "true"

wifi:
  ssid: !secret wifi_ssid
  password: !secret wifi_password

packages:
  music_dashboard:
    url: https://github.com/jtenniswood/esphome-media-player
    files: [guition-esp32-p4-jc8012p4a1/packages.yaml]
    ref: main
    refresh: 1s
```

### Example: portrait

```yaml
substitutions:
  name: "music-dashboard-10inch"
  friendly_name: "Music Dashboard 10inch"

wifi:
  ssid: !secret wifi_ssid
  password: !secret wifi_password

packages:
  music_dashboard:
    url: https://github.com/jtenniswood/esphome-media-player
    files: [guition-esp32-p4-jc8012p4a1/packages-portrait.yaml]
    ref: main
    refresh: 1s
```
