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
    assert_unique((str(device.docs["order"]) for device in devices), "docs order values")

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
        if not str(device.docs.get("sidebar", "")).strip():
            fail(f"{device.asset_slug} is missing docs.sidebar in product/devices.json")
        if not str(device.purchase.get("label", "")).strip():
            fail(f"{device.asset_slug} is missing purchase.label in product/devices.json")
        if not str(device.purchase.get("url", "")).strip():
            fail(f"{device.asset_slug} is missing purchase.url in product/devices.json")
        accessories = device.purchase.get("accessories", [])
        if not isinstance(accessories, list):
            fail(f"{device.asset_slug} purchase.accessories must be a list in product/devices.json")
        for index, accessory in enumerate(accessories, start=1):
            if not str(accessory.get("label", "")).strip():
                fail(f"{device.asset_slug} purchase accessory {index} is missing label")
            if not str(accessory.get("source", "")).strip():
                fail(f"{device.asset_slug} purchase accessory {index} is missing source")
            if not str(accessory.get("url", "")).strip():
                fail(f"{device.asset_slug} purchase accessory {index} is missing url")
        docs_text = read(docs_path)
        purchase_component = f'<PurchaseLinks device="{device.web_slug}" />'
        if purchase_component not in docs_text:
            fail(f"{docs_path.relative_to(ROOT)} must render purchase links from product/devices.json")

    vitepress_config = read(ROOT / "docs" / ".vitepress" / "config.js")
    if "deviceSidebarItems" not in vitepress_config or "product/devices.json" not in vitepress_config:
        fail("docs/.vitepress/config.js must build the device sidebar from product/devices.json")

    theme_index = read(ROOT / "docs" / ".vitepress" / "theme" / "index.js")
    purchase_links = read(ROOT / "docs" / ".vitepress" / "theme" / "components" / "PurchaseLinks.vue")
    supported_devices = read(ROOT / "docs" / ".vitepress" / "theme" / "components" / "SupportedDevices.vue")
    installation_md = read(ROOT / "docs" / "installation.md")
    release_docs = read(ROOT / "docs" / "development" / "release-versioning-improvements.md")
    if "PurchaseLinks" not in theme_index:
        fail("docs/.vitepress/theme/index.js must register PurchaseLinks")
    if "product/devices.json" not in purchase_links:
        fail("PurchaseLinks.vue must render from product/devices.json")
    if "SupportedDevices" not in theme_index:
        fail("docs/.vitepress/theme/index.js must register SupportedDevices")
    if "product/devices.json" not in supported_devices:
        fail("SupportedDevices.vue must render from product/devices.json")
    if "<SupportedDevices />" not in installation_md:
        fail("docs/installation.md must render supported devices from product/devices.json")
    if '<SupportedDevices mode="release" />' not in release_docs:
        fail("release-versioning-improvements.md must render release devices from product/devices.json")

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
    docs_sections = catalog.get("docs_sections", [])
    if not isinstance(docs_sections, list) or not docs_sections:
        fail("product/settings.json must define docs_sections")
    assert_unique((section["title"] for section in docs_sections), "settings docs sections")
    docs_section_titles = {section["title"] for section in docs_sections}

    firmware_yaml = "\n".join(
        path.read_text()
        for base in (ROOT / "common", ROOT / "devices")
        for path in base.rglob("*.yaml")
        if ".esphome" not in path.parts
    )

    for setting in settings:
        docs = setting.get("docs")
        if docs:
            if docs["section"] not in docs_section_titles:
                fail(f"Setting {setting['key']} references unknown docs section {docs['section']!r}")
            if not str(docs.get("label", "")).strip():
                fail(f"Setting {setting['key']} docs label is empty")
            if not str(docs.get("description", "")).strip():
                fail(f"Setting {setting['key']} docs description is empty")

        entity = setting.get("entity")
        if not entity:
            continue
        name = entity["name"]
        if not any(pattern in firmware_yaml for pattern in name_patterns(name)):
            fail(f"Setting entity {name!r} from product/settings.json was not found in firmware YAML")

        limits = setting.get("limits")
        if limits and entity.get("domain") != "number":
            fail(f"Setting {setting['key']} has limits but is not a number entity")

        options = setting.get("options")
        if options:
            if "default" in setting and setting["default"] not in options:
                fail(f"Setting {setting['key']} default is not present in its options list")
            if limits:
                min_value = limits["min"]
                max_value = limits["max"]
                invalid = [value for value in options if value < min_value or value > max_value]
                if invalid:
                    fail(f"Setting {setting['key']} has options outside its limits: {invalid}")

    settings_md = read(ROOT / "docs" / "features" / "settings.md")
    theme_index = read(ROOT / "docs" / ".vitepress" / "theme" / "index.js")
    if "<SettingsReference />" not in settings_md:
        fail("docs/features/settings.md must render settings from product/settings.json")
    if "SettingsReference" not in theme_index:
        fail("docs/.vitepress/theme/index.js must register SettingsReference")


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
