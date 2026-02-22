---
name: Roboto Light line height
overview: Download Roboto Light, patch its vertical metrics to reduce line height from ~1.17x to ~1.10x, and update the 96px font definition to use the local modified copy.
todos:
  - id: download-font
    content: Download Roboto Light TTF from Google Fonts
    status: pending
  - id: patch-metrics
    content: Use fonttools to patch hhea/OS2 vertical metrics to ~1.10x ratio and save as Roboto-Light-Tight.ttf
    status: pending
  - id: place-font
    content: Place modified TTF at guition-esp32-p4-jc8012p4a1/assets/fonts/Roboto-Light-Tight.ttf
    status: pending
  - id: update-yaml
    content: Update roboto_light96_font file reference in assets/fonts.yaml to use local patched font
    status: pending
isProject: false
---

# Reduce Roboto Light 96px Line Height

## Context

ESPHome derives LVGL `line_height` directly from the font file's `hhea` table metrics. For Roboto Light at size 96, the default ratio of ~1.17x produces a line height of ~113px instead of 96px. This causes excessive vertical spacing when the media title wraps to multiple lines.

There is no YAML-level override -- the font file itself must be patched.

## Steps

### 1. Download Roboto Light TTF

Get the font from Google Fonts (or copy from ESPHome's cache at `~/.esphome/fonts/`).

### 2. Inspect and patch vertical metrics

Use Python `fonttools` to:

- Read the current `hhea` table values (`ascent`, `descent`, `lineGap`) and `head.unitsPerEm`
- Calculate new values targeting a ~1.10x ratio: `(ascent - descent) / unitsPerEm = 1.10`
- For Roboto (UPM=2048), target sum = 2048 * 1.10 = 2253. Current sum is 2400 (1900 + 500), so we reduce by ~147 units total, e.g. `ascent=1800, descent=-453`.
- Update both `hhea` and `OS/2` tables for consistency
- Save as `Roboto-Light-Tight.ttf`

Result: at 96px, line height becomes `96 * 2253 / 2048 ≈ 106px` (down from 113px).

### 3. Place font file in project

Save to `guition-esp32-p4-jc8012p4a1/assets/fonts/Roboto-Light-Tight.ttf`.

### 4. Update font definition

In [assets/fonts.yaml](guition-esp32-p4-jc8012p4a1/assets/fonts.yaml), change the `roboto_light96_font` entry from:

```yaml
- file: "gfonts://Roboto@Light"
  id: roboto_light96_font
```

to:

```yaml
- file: "assets/fonts/Roboto-Light-Tight.ttf"
  id: roboto_light96_font
```

All other properties (`size`, `bpp`, `glyphs`) stay the same. The 40px Roboto Light font remains on `gfonts://` unchanged.

## Verification

After flashing, multi-line song titles on the media dashboard should have noticeably tighter line spacing (~106px per line instead of ~113px at size 96).