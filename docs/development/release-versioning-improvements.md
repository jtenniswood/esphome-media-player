---
title: Release Versioning Improvements
description: Maintainer notes for release tag versioning, firmware manifests, release checks, and release notes.
---

# Release Versioning Improvements

Public firmware releases use the GitHub Release tag as the single version source.
For a stable release, use a full semantic version tag such as `v2.0.3`. Short
tags such as `v2.1` should be normalized to `v2.1.0` before publishing.

The factory build YAML files keep `firmware_version: "0.0.0"` for day-to-day
work. The release workflow replaces that placeholder with the release tag before
compiling, so ESPHome project metadata, the firmware version sensor, web update
manifests, and release assets all agree.

## Release Assets

Each release should publish these files:

| Device | Release asset prefix | Public firmware path |
|---|---|---|
| Guition ESP32-S3 4848S040 | `media-player-4848s040` | `firmware/4848s040/` |
| Guition ESP32-P4 JC8012P4A1 | `media-player-jc8012p4a1` | `firmware/jc8012p4a1/` |
| Guition ESP32-P4 JC1060P470 | `media-player-jc1060p470` | `firmware/jc1060p470/` |
| Guition ESP32-P4 JC4880P443 | `media-player-jc4880p443` | `firmware/jc4880p443/` |
| ESP32-P4 86 Panel | `media-player-p4-86-panel` | `firmware/p4-86-panel/` |

For each prefix, the release must include:

```text
<prefix>.factory.bin
<prefix>.ota.bin
<prefix>.manifest.json
```

## Local Checks

Run these before changing the release process:

```sh
npm run check:firmware-release
npm run check:release-changelog
```

They are also included in:

```sh
npm run check:all
```

You can preview generated release notes locally:

```sh
npm run changelog:release -- v2.0.3
```

## What CI Verifies

The release workflow builds from the release tag, injects that tag into each
factory YAML, compiles the firmware, generates manifests from the compiled
binaries, verifies the local assets, uploads them to the GitHub Release, then
downloads the uploaded assets and verifies them again.

The verifier checks that:

- manifest versions match the release tag;
- manifest OTA checksums match the OTA binaries;
- manifest paths point to the expected release asset names;
- manifest release URLs point to the GitHub Release;
- factory and OTA binaries contain the release version;
- binaries contain ESPHome project metadata for the release version;
- binaries do not still contain `dev`, `main`, or `0.0.0` as ESPHome project versions.

The Pages workflow downloads firmware from the latest GitHub Release, publishes
it under the public `firmware/<device>/` folders, deploys the docs, and then
checks the public GitHub Pages URLs.
