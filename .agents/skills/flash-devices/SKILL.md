---
name: flash-devices
description: >-
  Flash ESPHome firmware to physical EspControl devices. Use when the user says
  "Flash Devices", "$flash-devices", "flash the device", "flash the S3",
  "deploy over IP", "OTA flash", "flash over USB", or wants local firmware
  uploaded to a connected or networked ESPHome device. Defaults to flashing the
  Guition ESP32-S3 4848S040 device over IP at 192.168.6.100.
---

# Flash Devices

Flash the current workspace firmware to a physical ESPHome device. Default to
the Guition ESP32-S3 4848S040 over Wi-Fi at `192.168.6.100` unless the user
names another device, gives another IP address, or explicitly asks for USB.

## Default Target

| Device | Config | Chip | Default transport |
| --- | --- | --- | --- |
| Guition ESP32-S3 4848S040 | `devices/guition-esp32-s3-4848s040/dev.yaml` | `esp32s3` | IP `192.168.6.100` |

Use `dev.yaml` by default because it includes local packages and local
components from the current workspace. Do not use `esphome.yaml` or factory
build wrappers unless the user specifically asks to flash a release/factory
configuration.

## Network Flash - Default

Use Docker ESPHome so the command works consistently without relying on a
locally installed ESPHome CLI:

```bash
docker run --rm \
  -v "$PWD:/config" \
  ghcr.io/esphome/esphome:stable \
  run /config/devices/guition-esp32-s3-4848s040/dev.yaml \
  --device 192.168.6.100 \
  --no-logs
```

If the user provides another IP, keep the same config unless they also name a
different device:

```bash
docker run --rm \
  -v "$PWD:/config" \
  ghcr.io/esphome/esphome:stable \
  run /config/devices/guition-esp32-s3-4848s040/dev.yaml \
  --device <ip-address> \
  --no-logs
```

`--no-logs` keeps the command as a one-shot flash instead of staying attached
to the device logs after upload. Interpret a successful flash as ESPHome
compiling successfully, connecting to the device, uploading the OTA image, and
reporting completion without an error. If ESPHome cannot connect to
`192.168.6.100`, report that the device may be offline, on another IP, or not
yet running compatible OTA firmware.

## USB Flash

Use USB only when the user asks for USB, serial, or a physically connected
device. Docker on macOS should compile the firmware, but the host should run
`esptool.py` or `esptool` for the actual USB flash.

Compile first:

```bash
docker run --rm \
  -v "$PWD:/config" \
  ghcr.io/esphome/esphome:stable \
  compile /config/devices/guition-esp32-s3-4848s040/dev.yaml
```

Find the serial port:

```bash
ls /dev/cu.usb* /dev/cu.wchusbserial* /dev/tty.usb* /dev/tty.wchusbserial* 2>/dev/null
```

Find the compiled factory image, then flash it:

```bash
FIRMWARE="$(find "$PWD" -path '*/.esphome/build/music-dashboard-dev/.pioenvs/music-dashboard-dev/firmware.factory.bin' -print -quit)"
esptool.py --port <serial-port> --chip esp32s3 write_flash 0x0 "$FIRMWARE"
```

If `esptool.py` is not available, try `esptool` with the same arguments. If no
serial port appears, ask the user to check the USB cable, port, and boot mode.
If flashing times out, ask the user to hold BOOT while starting the flash.

## Other Devices

If the user names another supported device, select its matching `dev.yaml` and
chip:

| Device | Config | Chip |
| --- | --- | --- |
| JC1060P470 10" P4 | `devices/guition-esp32-p4-jc1060p470/dev.yaml` | `esp32p4` |
| JC4880P443 P4 | `devices/guition-esp32-p4-jc4880p443/dev.yaml` | `esp32p4` |
| JC8012P4A1 P4 | `devices/guition-esp32-p4-jc8012p4a1/dev.yaml` | `esp32p4` |
| ESP32-P4 86 panel | `devices/esp32-p4-86-panel/dev.yaml` | `esp32p4` |

For network flashing another device, require the user to provide the target IP.
For USB flashing another device, use the listed chip in the `esptool` command.

## Before Flashing

- Run from the worktree that contains the changes the user wants to test.
- If web UI assets may have changed, run `python3 scripts/build.py` before the
  ESPHome command so bundled assets are current.
- If Docker reports that the ESPHome image is missing or stale, pull
  `ghcr.io/esphome/esphome:stable` and retry.
- Do not commit, push, or change branches as part of flashing unless the user
  asks for that separately.

## Report Back

Keep the result short and practical:

```text
Flash result:
  Device: Guition ESP32-S3 4848S040
  Method: IP 192.168.6.100
  Config: devices/guition-esp32-s3-4848s040/dev.yaml
  Result: OK
```

For failures, include the first meaningful ESPHome or `esptool` error and the
next action needed, such as checking power, Wi-Fi/IP, USB cable, or BOOT mode.
