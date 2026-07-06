#!/usr/bin/env python3
"""Validate the product catalog against existing generated and authored files."""

from __future__ import annotations

import re
import sys
from pathlib import Path
from typing import Iterable

from product_model import ROOT, load_devices, load_settings_catalog


class ProductModelError(RuntimeError):
    pass


def fail(message: str) -> None:
    raise ProductModelError(message)


def read(path: Path) -> str:
    try:
        return path.read_text()
    except FileNotFoundError as exc:
        raise ProductModelError(f"Missing expected file: {path.relative_to(ROOT)}") from exc


def assert_unique(values: Iterable[str], label: str) -> None:
    seen: set[str] = set()
    duplicates: set[str] = set()
    for value in values:
        if value in seen:
            duplicates.add(value)
        seen.add(value)
    if duplicates:
        fail(f"Duplicate {label}: {', '.join(sorted(duplicates))}")


def docs_file_for_route(route: str) -> Path:
    route = route.strip("/")
    return ROOT / "docs" / f"{route}.md"


def check_devices() -> None:
    devices = load_devices()
    assert_unique((device.profile for device in devices), "device profiles")
    assert_unique((device.asset_slug for device in devices), "asset slugs")
    assert_unique((device.web_slug for device in devices), "web slugs")
    assert_unique((device.config for device in devices), "device configs")

    for device in devices:
        if not device.factory_yaml.is_file():
            fail(f"{device.asset_slug} factory YAML is missing: {device.factory_yaml.relative_to(ROOT)}")

        build_yaml = ROOT / "builds" / f"{device.config}.yaml"
        if not build_yaml.is_file():
            fail(f"{device.asset_slug} build YAML is missing: {build_yaml.relative_to(ROOT)}")

        package_path = ROOT / device.package_path
        if not package_path.is_file():
            fail(f"{device.asset_slug} package path is missing: {device.package_path}")

        base_package = ROOT / "devices" / device.config / "packages.yaml"
        package_text = read(base_package)
        if f'device_slug: "{device.profile}"' not in package_text:
            fail(f"{base_package.relative_to(ROOT)} device_slug does not match product/devices.json")
        if f'firmware_manifest_slug: "{device.web_slug}"' not in package_text:
            fail(f"{base_package.relative_to(ROOT)} firmware_manifest_slug does not match product/devices.json")

        docs_path = docs_file_for_route(device.docs_path)
        if not docs_path.is_file():
            fail(f"{device.asset_slug} docs page is missing: {docs_path.relative_to(ROOT)}")

    release_yml = read(ROOT / ".github" / "workflows" / "release.yml")
    if "python3 scripts/product_model.py release-matrix" not in release_yml:
        fail("release.yml must build its device matrix from product/devices.json")
    if "fromJson(needs.release-matrix.outputs.matrix)" not in release_yml:
        fail("release.yml build-firmware matrix must use the product model output")
    hardcoded_entries = re.findall(r"- asset_slug: ([^\n]+)", release_yml)
    if hardcoded_entries:
        fail(f"release.yml contains hard-coded device entries: {hardcoded_entries}")


def name_patterns(name: str) -> tuple[str, str]:
    return (f'name: "{name}"', f"name: {name}")


def check_settings() -> None:
    catalog = load_settings_catalog()
    settings = catalog["settings"]
    assert_unique((setting["key"] for setting in settings), "setting keys")

    firmware_yaml = "\n".join(
        path.read_text()
        for base in (ROOT / "common", ROOT / "devices")
        for path in base.rglob("*.yaml")
        if ".esphome" not in path.parts
    )

    for setting in settings:
        entity = setting.get("entity")
        if not entity:
            continue
        name = entity["name"]
        if not any(pattern in firmware_yaml for pattern in name_patterns(name)):
            fail(f"Setting entity {name!r} from product/settings.json was not found in firmware YAML")

        limits = setting.get("limits")
        if limits and entity.get("domain") != "number":
            fail(f"Setting {setting['key']} has limits but is not a number entity")


def main() -> int:
    try:
        check_devices()
        check_settings()
    except ProductModelError as exc:
        print(f"::error::{exc}", file=sys.stderr)
        return 1
    print("Product catalog checks passed.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
