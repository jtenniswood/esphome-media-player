const siteUrl = 'https://jtenniswood.github.io'
const base = '/esphome-media-player/'
const siteName = 'ESPHome Media Player'
const siteDescription = 'A Home Assistant media controller for ESP32 touchscreen displays, built with ESPHome and LVGL.'
const socialImage = 'https://raw.githubusercontent.com/jtenniswood/esphome-media-player/main/docs/images/guition-esp32-p4-jc8012p4a1-example1.jpg'

function canonicalUrl(page) {
  const path = page
    .replace(/(^|\/)index\.md$/, '$1')
    .replace(/\.md$/, '.html')

  return new URL(`${base}${path}`, siteUrl).toString()
}

export default {
  base,
  title: siteName,
  description: siteDescription,
  ignoreDeadLinks: true,
  sitemap: {
    hostname: `${siteUrl}${base}`,
  },
  head: [
    ['link', { rel: 'icon', type: 'image/svg+xml', href: `${base}favicon.svg` }],
    ['meta', { name: 'theme-color', content: '#0f172a' }],
  ],
  transformHead({ page, title, description }) {
    const url = canonicalUrl(page)

    return [
      ['link', { rel: 'canonical', href: url }],
      ['meta', { property: 'og:type', content: 'website' }],
      ['meta', { property: 'og:site_name', content: siteName }],
      ['meta', { property: 'og:title', content: title }],
      ['meta', { property: 'og:description', content: description }],
      ['meta', { property: 'og:url', content: url }],
      ['meta', { property: 'og:image', content: socialImage }],
      ['meta', { name: 'twitter:card', content: 'summary_large_image' }],
      ['meta', { name: 'twitter:title', content: title }],
      ['meta', { name: 'twitter:description', content: description }],
      ['meta', { name: 'twitter:image', content: socialImage }],
    ]
  },
  themeConfig: {
    search: {
      provider: 'local',
    },
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
          { text: 'ESP32-P4 JC1060P470 (7")', link: '/devices/esp32-p4-jc1060p470' },
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
          { text: 'Troubleshooting', link: '/advanced/troubleshooting' },
          { text: 'Raising an Issue', link: '/advanced/raising-an-issue' },
        ],
      },
    ],
  },
}
