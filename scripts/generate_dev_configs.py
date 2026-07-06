#!/usr/bin/env python3
"""Generate catalog-backed local ESPHome development configs."""

from __future__ import annotations

import argparse
import difflib
import sys
from pathlib import Path
from typing import Any

from product_model import Device, ROOT, load_devices


def required_text(value: Any, label: str) -> str:
    if not isinstance(value, str) or not value.strip():
        raise RuntimeError(f"{label} must be a non-empty string")
    return value


def local_components(value: Any, label: str) -> list[str]:
    if not isinstance(value, list) or not value:
        raise RuntimeError(f"{label} must be a non-empty list")
    components: list[str] = []
    for index, component in enumerate(value, start=1):
        components.append(required_text(component, f"{label}[{index}]"))
    return components


def dev_config(device: Device) -> str:
    config = device.dev
    name = required_text(config.get("name"), f"{device.config} dev.name")
    friendly_name = required_text(config.get("friendly_name"), f"{device.config} dev.friendly_name")
    components = local_components(config.get("local_components"), f"{device.config} dev.local_components")

    substitutions = [
        "substitutions:",
        f'  name: "{name}"',
        f'  friendly_name: "{friendly_name}"',
    ]
    if "display_rotation" in config:
        if "rotation_comment" in config:
            substitutions.append(f"  # {required_text(config['rotation_comment'], f'{device.config} dev.rotation_comment')}")
        display_rotation = required_text(config["display_rotation"], f"{device.config} dev.display_rotation")
        substitutions.append(f'  display_rotation: "{display_rotation}"')

    return "\n".join(substitutions) + f"""

wifi:
  ssid: !secret wifi_ssid
  password: !secret wifi_password

packages:
  music_dashboard: !include packages.yaml

external_components:
  - source:
      type: local
      path: ../../components
    components: [{", ".join(components)}]
"""


def generated_configs() -> dict[Path, str]:
    return {
        ROOT / "devices" / device.config / "dev.yaml": dev_config(device)
        for device in load_devices()
    }


def write_or_check(path: Path, content: str, check: bool) -> bool:
    old = path.read_text() if path.exists() else ""
    if old == content:
        return False
    if check:
        rel = path.relative_to(ROOT)
        diff = "".join(
            difflib.unified_diff(
                old.splitlines(keepends=True),
                content.splitlines(keepends=True),
                fromfile=f"{rel} (current)",
                tofile=f"{rel} (generated)",
            )
        )
        print(diff, file=sys.stderr)
        return True
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(content)
    return True


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--check", action="store_true", help="Fail if local development configs are stale")
    args = parser.parse_args()

    changed = False
    configs = generated_configs()
    if args.check:
        unmanaged = sorted((ROOT / "devices").glob("*/dev.yaml"))
        unmanaged = [path for path in unmanaged if path not in configs]
        if unmanaged:
            for path in unmanaged:
                print(f"Unmanaged local development config: {path.relative_to(ROOT)}", file=sys.stderr)
            changed = True
    for path, content in sorted(configs.items()):
        changed = write_or_check(path, content, args.check) or changed
    if args.check and changed:
        print("Local development configs are stale. Run `npm run dev-configs:build`.", file=sys.stderr)
        return 1
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
