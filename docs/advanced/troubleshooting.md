# Troubleshooting

## The artwork isn't loading

Album art is loaded from your Home Assistant instance. If it isn't appearing:

1. **Check the media player entity** — make sure the entity you configured on the device page has an `entity_picture` attribute when playing. You can verify this in **Developer Tools → States** in Home Assistant.
2. **Check the Home Assistant host** — the device fetches artwork from `http://<ha_host>:<ha_port>/api/...`. If your Home Assistant instance uses a hostname or IP other than `homeassistant.local`, or runs on a port other than `8123`, artwork will fail to load. Set the `ha_host` and/or `ha_port` substitutions to match your setup — see [Non-standard Home Assistant host or port](/advanced/manual-setup#non-standard-home-assistant-host-or-port).
3. **Check network connectivity** — the device needs to reach your Home Assistant instance over the local network. Make sure both are on the same network/VLAN.
4. **Check the image size** — very large album art images may fail to download on the ESP32's limited memory. If you're using a custom media player integration, check whether it provides a resized image URL.
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
- Re-flash the firmware using the [web installer](/installation) or the [ESPHome dashboard](/advanced/manual-setup).

## Controls aren't working

- Make sure the media player entity supports the controls you're trying to use. Check **Developer Tools → States** for the `supported_features` attribute.
- For speaker grouping, ensure you've created the template sensor — see [Speaker Grouping](/features/speaker-grouping).

## Still stuck?

See [Raising an Issue](/advanced/raising-an-issue) for how to report a bug or request help.
