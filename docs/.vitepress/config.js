export default {
  base: '/esphome-media-player/',
  title: 'ESPHome Media Player',
  description: 'A media controller for Home Assistant',
  ignoreDeadLinks: true,
  themeConfig: {
    sidebar: [
      {
        text: 'Getting Started',
        link: '/',
      },
      {
        text: 'Devices',
        items: [
          { text: 'ESP32-S3 4848S040 (4")', link: '/devices/esp32-s3-4848s040' },
          { text: 'ESP32-P4 JC8012P4A1 (10.1")', link: '/devices/esp32-p4-jc8012p4a1' },
        ],
      },
      {
        text: 'Features',
        link: '/features',
      },
      {
        text: 'Configurable Settings',
        link: '/configurable-settings',
      },
      {
        text: 'Events & automations',
        link: '/automations',
      },
      {
        text: 'Manual Installation',
        link: '/manual-setup',
      },
      {
        text: 'Troubleshooting',
        link: '/troubleshooting',
      },
    ],
  },
}
