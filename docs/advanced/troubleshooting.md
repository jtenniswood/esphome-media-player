# Troubleshooting

## The artwork isn't loading

Album art is loaded from your Home Assistant instance. If it isn't appearing:

1. **Check the media player entity** — make sure the entity you configured on the device page has an `entity_picture` attribute when playing. You can verify this in **Developer Tools → States** in Home Assistant.
2. **Check the Home Assistant host and protocol** — the device fetches artwork from `<ha_protocol>://<ha_host>:<ha_port>/api/...`. If your Home Assistant instance uses HTTPS, a different hostname/IP, or a non-standard port, artwork will fail to load. Set the `ha_protocol` (`http` or `https`), `ha_host`, and/or `ha_port` substitutions to match your setup. If using HTTPS with a self-signed or local CA certificate, also set `ha_verify_ssl: "false"`. See [Host/Port Setup](/advanced/host-port-setup).
3. **Check network connectivity** — the device needs to reach your Home Assistant instance over the local network. Make sure both are on the same network/VLAN.
4. **Check the image format and size** — artwork is decoded on the device. Baseline JPEG and PNG are supported, and progressive JPEG is detected and attempted by the native JPEG decoder. HEIC/HEIF is detected but may still fail if the native decoder is not available in the firmware. Very large images can also fail on the ESP32's limited memory. When reporting this, include the media provider and the device logs.
5. **Restart the device** — occasionally the image download can get stuck. A restart (via the physical button or from the ESPHome dashboard) usually resolves it.

## The device won't connect to Wi-Fi

- Make sure you're using a 2.4 GHz Wi-Fi network. The ESP32 does not support 5 GHz.
- If you entered the wrong credentials, the device will fall back to its hotspot mode (**esphome-media-player**). Connect to the hotspot and re-enter the correct credentials.
- Move the device closer to your router to rule out signal issues.

## The device isn't discovered in Home Assistant

- Ensure the [ESPHome integration](https://www.home-assistant.io/integrations/esphome/) is installed in Home Assistant.
- Check that the device and Home Assistant are on the same network.
- Try adding the device manually under **Settings → Devices & Services → Add Integration → ESPHome** using the device's IP address.

## The screen is black / not responding

- Verify the device is powered via the USB-C port with an adequate power supply (5V 2A recommended).
- Try a different USB-C cable — some cables are charge-only and don't carry data for the initial flash.
- Re-flash the firmware using the [web installer](/installation) or the [ESPHome dashboard](/advanced/esphome-config).

## Controls aren't working

- Make sure the media player entity supports the controls you're trying to use. Check **Developer Tools → States** for the `supported_features` attribute.
- For speaker grouping, ensure you've created the template sensor — see [Speaker Grouping](/features/speaker-grouping).

## Still stuck?

See [Raising an Issue](/advanced/raising-an-issue) for how to report a bug or request help.
