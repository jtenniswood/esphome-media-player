export default {
  base: '/esphome-media-player/',
  title: 'EspMedia',
  description: 'A media controller for Home Assistant',
  ignoreDeadLinks: true,
  head: [
    ['link', { rel: 'icon', type: 'image/svg+xml', href: '/esphome-media-player/favicon.svg' }],
  ],
  themeConfig: {
    socialLinks: [
      { icon: 'github', link: 'https://github.com/jtenniswood/esphome-media-player' },
    ],
    sidebar: [
      {
        text: 'About',
        link: '/',
      },
      {
        text: 'Installation',
        link: '/installation',
      },
      {
        text: 'Devices',
        items: [
          { text: 'ESP32-S3 4848S040 (4")', link: '/devices/esp32-s3-4848s040' },
          { text: 'ESP32-P4 86 Panel (4")', link: '/devices/esp32-p4-86-panel' },
          { text: 'ESP32-P4 JC4880P443 (4.3")', link: '/devices/esp32-p4-jc4880p443' },
          { text: 'ESP32-P4 JC8012P4A1 (10.1")', link: '/devices/esp32-p4-jc8012p4a1' },
        ],
      },
      {
        text: 'Features',
        items: [
          { text: 'Web Settings', link: '/features/webserver' },
          { text: 'Settings', link: '/features/settings' },
          { text: 'Screen Saver', link: '/features/screen-saver' },
          { text: 'Speaker Grouping', link: '/features/speaker-grouping' },
          { text: 'Firmware Updates', link: '/features/firmware-updates' },
        ],
      },
      {
        text: 'Manual Setup',
        items: [
          { text: 'ESPHome Config', link: '/advanced/esphome-config' },
          { text: 'Display Rotation', link: '/advanced/display-rotation' },
          { text: 'Host/Port Setup', link: '/advanced/host-port-setup' },
        ],
      },
      {
        text: 'Support',
        items: [
          { text: 'Roadmap', link: '/roadmap' },
          { text: 'Troubleshooting', link: '/advanced/troubleshooting' },
          { text: 'Raising an Issue', link: '/advanced/raising-an-issue' },
        ],
      },
    ],
  },
}
