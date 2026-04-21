export default {
  base: '/esphome-media-player/',
  title: 'ESPHome Media Player',
  description: 'A media controller for Home Assistant',
  ignoreDeadLinks: true,
  head: [
    [
      'script',
      {
        'data-name': 'BMC-Widget',
        'data-cfasync': 'false',
        src: 'https://cdnjs.buymeacoffee.com/1.0.0/widget.prod.min.js',
        'data-id': 'jtenniswood',
        'data-description': 'Support me on Buy me a coffee!',
        'data-message': '',
        'data-color': '#FFDD00',
        'data-position': 'Right',
        'data-x_margin': '18',
        'data-y_margin': '18',
      },
    ],
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
          { text: 'ESP32-P4 JC8012P4A1 (10.1")', link: '/devices/esp32-p4-jc8012p4a1' },
        ],
      },
      {
        text: 'Features',
        items: [
          { text: 'Settings', link: '/features/settings' },
          { text: 'Screen Saver', link: '/features/screen-saver' },
          { text: 'Screen Schedule', link: '/features/screen-schedule' },
          { text: 'Speaker Grouping', link: '/features/speaker-grouping' },
          { text: 'Source Inputs', link: '/features/source-inputs' },
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
