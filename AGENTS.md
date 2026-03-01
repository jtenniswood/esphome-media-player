# AGENTS.md

## Cursor Cloud specific instructions

This is an ESPHome firmware project for touchscreen media controllers. The only locally runnable component is the **VitePress documentation site**.

### Services

| Service | How to run | Notes |
|---------|-----------|-------|
| Docs site (VitePress) | `npm run docs:dev` | Serves at `http://localhost:5173/esphome-media-player/` with hot reload |

### Key commands

- **Dev server:** `npm run docs:dev` (port 5173 by default)
- **Build:** `npm run docs:build` (output in `docs/.vitepress/dist/`)
- No lint or test scripts are configured in this repository.

### Notes

- The VitePress config is at `docs/.vitepress/config.js` (plain JS, not `.mts`).
- The site uses a `base: '/esphome-media-player/'` path prefix — all URLs include this prefix.
- Firmware (ESP32 YAML configs under `guition-*/` and `builds/`) cannot be compiled or tested locally without the ESPHome toolchain/Docker image and physical hardware.
