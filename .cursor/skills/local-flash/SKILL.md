---
name: local-flash
description: Compile and flash ESPHome firmware locally to a USB-connected ESP32 device using Docker. Use when the user says "deploy locally", "dploy over usb", "build and flash", "upload firmware", "flash over USB", "test locally", or wants to test component changes on a physical device.
---

# Local Flash via USB

Compile ESPHome firmware with local component changes, then flash to a USB-connected device.

## Prerequisites

- Docker with `ghcr.io/esphome/esphome:latest`
- `esptool.py` or `esptool` on PATH
- Device connected via USB
- `secrets.yaml` in the target device directory with `wifi_ssid` and `wifi_password`

## Device Directories

| Device | Directory | Chip |
|--------|-----------|------|
| 10" P4 display | `guition-esp32-p4-jc8012p4a1/` | esp32p4 |
| 4" S3 display | `guition-esp32-s3-4848s040/` | esp32s3 |

## Workflow

### 1. Create dev.yaml (if not present)

Create `<device-dir>/dev.yaml` that uses local packages and local components:

```yaml
substitutions:
  name: "music-dashboard-dev"
  friendly_name: "Music Dashboard Dev"

wifi:
  ssid: !secret wifi_ssid
  password: !secret wifi_password

packages:
  music_dashboard: !include packages.yaml

external_components:
  - source:
      type: local
      path: ../components
    components: [online_image]
```

The `external_components` override ensures the build uses the local `components/` directory instead of pulling from GitHub.

### 2. Copy to a local directory

Docker on macOS has issues with Dropbox-synced volumes (file locking). Copy the project first:

```bash
rm -rf /tmp/esphome-build
rsync -a --exclude='.esphome' --exclude='node_modules' --exclude='.git' \
  "/Users/jtenniswood/Library/CloudStorage/Dropbox/Git/esphome-media-player/" \
  /tmp/esphome-build/
```

This takes 30-60 seconds due to Dropbox sync overhead.

### 3. Compile with Docker

```bash
docker run --rm \
  -v "/tmp/esphome-build:/config" \
  ghcr.io/esphome/esphome:latest \
  compile <device-dir>/dev.yaml
```

First build takes ~3-5 minutes. Incremental builds take ~30-60 seconds.

If only component files changed after an initial build, copy them directly instead of re-syncing everything:

```bash
cp components/online_image/*.cpp /tmp/esphome-build/components/online_image/
cp components/online_image/*.h /tmp/esphome-build/components/online_image/
```

### 4. Find USB serial port

```bash
ls /dev/tty.usb*
```

Typical: `/dev/tty.usbserial-201230`

### 5. Flash with esptool

**ESP32-P4:**
```bash
esptool.py --port /dev/tty.usbserial-XXXXXX --chip esp32p4 write_flash 0x0 \
  /tmp/esphome-build/<device-dir>/.esphome/build/<name>/.pioenvs/<name>/firmware.factory.bin
```

**ESP32-S3:**
```bash
esptool.py --port /dev/tty.usbserial-XXXXXX --chip esp32s3 write_flash 0x0 \
  /tmp/esphome-build/<device-dir>/.esphome/build/<name>/.pioenvs/<name>/firmware.factory.bin
```

Replace `XXXXXX` with the port from step 4 and `<name>` with the substitution `name` value from dev.yaml.

### 6. Verify

Device resets automatically. Wait 15-20 seconds for boot + WiFi, then check the display or ESPHome logs.

## Iterating Quickly

For rapid test cycles after the first build:

```bash
# Copy changed source files
cp components/online_image/online_image.cpp /tmp/esphome-build/components/online_image/

# Rebuild (incremental, ~30-60s)
docker run --rm -v "/tmp/esphome-build:/config" \
  ghcr.io/esphome/esphome:latest compile <device-dir>/dev.yaml

# Flash (~100s)
esptool.py --port /dev/tty.usbserial-XXXXXX --chip esp32p4 write_flash 0x0 \
  /tmp/esphome-build/<device-dir>/.esphome/build/<name>/.pioenvs/<name>/firmware.factory.bin
```

## Troubleshooting

- **"Resource deadlock avoided"**: Build from `/tmp/esphome-build`, not the Dropbox directory.
- **No USB serial devices**: Check cable supports data (not power-only). Try a different port.
- **esptool timeout**: Hold the BOOT button while running flash command.
- **Docker can't flash**: macOS Docker runs in a VM without USB access. Always use host `esptool`.
- **Protected member errors**: Diagnostic logging that accesses `buffer_width_`/`buffer_height_` must go through public methods like `get_width()`.
