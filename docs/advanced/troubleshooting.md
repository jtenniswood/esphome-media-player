---
title: ESPHome Media Player Troubleshooting
description: Fix common ESPHome Media Player issues including missing album art, Wi-Fi setup problems, Home Assistant discovery, black screens, and media controls.
---

# Troubleshooting

## The artwork isn't loading

Album art is loaded from your Home Assistant instance. If it isn't appearing:

1. **Check the media player entity** — make sure the entity you configured on the device page has an `entity_picture` attribute when playing. You can verify this in **Developer Tools → States** in Home Assistant.
2. **Check the Home Assistant host and protocol** — the device fetches artwork from `<ha_protocol>://<ha_host>:<ha_port>/api/...`. If your Home Assistant instance uses HTTPS, a different hostname/IP, or a non-standard port, artwork will fail to load. Set the `ha_protocol` (`http` or `https`), `ha_host`, and/or `ha_port` substitutions to match your setup. If using HTTPS with a self-signed or local CA certificate, also set `ha_verify_ssl: "false"`. If artwork comes directly from a local media player with a self-signed certificate, such as Wiim, set `allow_insecure_local_artwork: "true"`. See [Host/Port Setup](/advanced/host-port-setup).
3. **Check network connectivity** — the device needs to reach your Home Assistant instance over the local network. Make sure both are on the same network/VLAN.
4. **Check the image format and size** — artwork is decoded on the device. Baseline JPEG, progressive JPEG, and PNG are handled by the native firmware decoder. Apple Music artwork is requested as a capped JPEG when the device can identify the public Apple CDN URL. HEIC/HEIF is detected but is not displayed by the current native firmware decoder. Very large images can also fail on the ESP32's limited memory. When reporting this, include the media provider and the device logs.
5. **Restart the device** — occasionally the image download can get stuck. A restart (via the physical button or from the ESPHome dashboard) usually resolves it.

## The device won't connect to Wi-Fi

- Make sure you're using a 2.4 GHz Wi-Fi network. The ESP32 does not support 5 GHz.
- If you entered the wrong credentials, the device will fall back to its hotspot mode (**esphome-media-player**). Connect to the hotspot and re-enter the correct credentials.
- Move the device closer to your router to rule out signal issues.

## The device isn't discovered in Home Assistant

- Ensure the [ESPHome integration](https://www.home-assistant.io/integrations/esphome/) is installed in Home Assistant.
- Check that the device and Home Assistant are on the same network.
- Try adding the device manually under **Settings → Devices & Services → Add Integration → ESPHome** using the device's IP address.

## Firmware compile fails while copying LVGL

If an ESP32-P4 compile fails with `shutil.Error` while copying `lvgl__lvgl` into `managed_components`, ESPHome has a partially written build cache. This can happen after an interrupted or failed compile, and retrying without cleaning usually hits the same cached folder again.

In the ESPHome dashboard, open the device menu and choose **Clean Build Files**, then compile again. If you are using ESPHome from a terminal, run:

```bash
esphome clean /config/music-7inch.yaml
esphome compile /config/music-7inch.yaml
```

If the dashboard clean option is not available, delete the affected build folder under `/config/.esphome/build/` for that device and compile again.

## Firmware compile fails with missing `.git/HEAD`

If ESPHome fails while reading the configuration with an error like `No such file or directory: '/config/.esphome/external_components/.../.git/HEAD'`, ESPHome has a broken cached copy of the project's external component checkout.

Delete the affected folder named in the error, then compile again. For example:

```bash
rm -rf /config/.esphome/external_components/5376f726
esphome compile /config/music-7inch.yaml
```

If the folder name is different in your error, delete that folder instead. If you are unsure which folder is affected, deleting `/config/.esphome/external_components/` is also safe; ESPHome will download the external components again on the next compile.

## Firmware compile fails with `speaker_group has not been declared`

Older versions of the project loaded the speaker-group helper through a relative file path that ESPHome resolves incorrectly for remote packages. Update your package to the latest `main` version, choose **Clean Build Files** from the device menu, and compile again.

If your configuration is pinned to an older commit, update or remove the pinned `ref`. The old helper path resolves differently depending on where your main YAML file is stored, so there is no single manual file location that works reliably for pinned remote packages.

## The screen is black / not responding

- Verify the device is powered via the USB-C port with an adequate power supply (5V 2A recommended).
- Try a different USB-C cable — some cables are charge-only and don't carry data for the initial flash.
- Re-flash the firmware using the [web installer](/installation) or the [ESPHome dashboard](/advanced/esphome-config).

## Controls aren't working

- Make sure the media player entity supports the controls you're trying to use. Check **Developer Tools → States** for the `supported_features` attribute.
- For speaker grouping, ensure you've created the template sensor — see [Speaker Grouping](/features/speaker-grouping).

## Still stuck?

See [Raising an Issue](/advanced/raising-an-issue) for how to report a bug or request help.
