#!/usr/bin/env python3
"""Validate the product catalog against existing generated and authored files."""

from __future__ import annotations

import os
import re
import sys
from pathlib import Path
from typing import Any, Iterable

from product_model import ROOT, load_device_catalog, load_devices, load_settings_catalog


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


def firmware_yaml_paths() -> list[Path]:
    return sorted(
        path
        for base in (ROOT / "common", ROOT / "devices")
        for path in base.rglob("*.yaml")
        if ".esphome" not in path.parts
    )


def check_dev_config(device_asset_slug: str, dev_config: dict[str, Any]) -> None:
    if not isinstance(dev_config, dict):
        fail(f"{device_asset_slug} dev config must be an object in product/devices.json")
    for key in ("name", "friendly_name"):
        if not isinstance(dev_config.get(key), str) or not dev_config[key].strip():
            fail(f"{device_asset_slug} is missing dev.{key} in product/devices.json")

    display_rotation = dev_config.get("display_rotation")
    if display_rotation is not None:
        if not isinstance(display_rotation, str) or display_rotation not in {"0", "90", "180", "270"}:
            fail(f"{device_asset_slug} dev.display_rotation must be one of 0, 90, 180, or 270")
        if not isinstance(dev_config.get("rotation_comment"), str) or not dev_config["rotation_comment"].strip():
            fail(f"{device_asset_slug} dev.rotation_comment must describe the local dev rotation")
    elif "rotation_comment" in dev_config:
        fail(f"{device_asset_slug} dev.rotation_comment requires dev.display_rotation")

    local_components = dev_config.get("local_components")
    if not isinstance(local_components, list) or not local_components:
        fail(f"{device_asset_slug} dev.local_components must be a non-empty list")
    assert_unique((str(component) for component in local_components), f"{device_asset_slug} local dev components")
    for component in local_components:
        if not isinstance(component, str) or not component.strip():
            fail(f"{device_asset_slug} dev.local_components entries must be non-empty strings")
        component_dir = ROOT / "components" / component
        if not component_dir.is_dir():
            fail(f"{device_asset_slug} dev.local_components references missing component {component!r}")


def check_devices() -> None:
    catalog = load_device_catalog()
    devices = load_devices()
    assert_unique((device.profile for device in devices), "device profiles")
    assert_unique((device.asset_slug for device in devices), "asset slugs")
    assert_unique((device.web_slug for device in devices), "web slugs")
    assert_unique((device.config for device in devices), "device configs")
    assert_unique((str(device.docs["order"]) for device in devices), "docs order values")
    package_paths = [device.package_path for device in devices]
    build_config_names = [device.config for device in devices]
    for device in devices:
        alternate_package_paths = device.alternate_package_paths or []
        if not isinstance(alternate_package_paths, list):
            fail(f"{device.asset_slug} alternate_package_paths must be a list in product/devices.json")
        for alternate_package_path in alternate_package_paths:
            if not isinstance(alternate_package_path, str) or not alternate_package_path.strip():
                fail(f"{device.asset_slug} alternate_package_paths entries must be non-empty strings")
            package_paths.append(alternate_package_path)

        aliases = device.build_aliases or []
        if not isinstance(aliases, list):
            fail(f"{device.asset_slug} build_aliases must be a list in product/devices.json")
        for alias in aliases:
            if not isinstance(alias, str) or not alias.strip():
                fail(f"{device.asset_slug} build_aliases entries must be non-empty strings")
            if alias.endswith(".yaml") or "/" in alias:
                fail(f"{device.asset_slug} build alias {alias!r} must be a plain build config name")
            build_config_names.append(alias)
    assert_unique(package_paths, "package paths")
    assert_unique(build_config_names, "build config names")

    for device in devices:
        if not device.factory_yaml.is_file():
            fail(f"{device.asset_slug} factory YAML is missing: {device.factory_yaml.relative_to(ROOT)}")

        build_yaml = ROOT / "builds" / f"{device.config}.yaml"
        if not build_yaml.is_file():
            fail(f"{device.asset_slug} build YAML is missing: {build_yaml.relative_to(ROOT)}")

        package_path = ROOT / device.package_path
        if not package_path.is_file():
            fail(f"{device.asset_slug} package path is missing: {device.package_path}")
        for alternate_package_path in device.alternate_package_paths or []:
            package_path = ROOT / alternate_package_path
            if not package_path.is_file():
                fail(f"{device.asset_slug} alternate package path is missing: {alternate_package_path}")

        esphome_config = device.esphome
        for key in ("title", "name", "friendly_name"):
            if not isinstance(esphome_config.get(key), str) or not esphome_config[key].strip():
                fail(f"{device.asset_slug} is missing esphome.{key} in product/devices.json")
        rotation_comments = esphome_config.get("rotation_comments", [])
        if not isinstance(rotation_comments, list):
            fail(f"{device.asset_slug} esphome.rotation_comments must be a list in product/devices.json")
        for index, comment in enumerate(rotation_comments, start=1):
            if not isinstance(comment, str) or not comment.strip():
                fail(f"{device.asset_slug} esphome.rotation_comments[{index}] must be a non-empty string")
        if "rotation_example" in esphome_config and (
            not isinstance(esphome_config["rotation_example"], str) or not esphome_config["rotation_example"].strip()
        ):
            fail(f"{device.asset_slug} esphome.rotation_example must be a non-empty string")

        check_dev_config(device.asset_slug, device.dev)

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

        assets = device.assets
        if not isinstance(assets, dict):
            fail(f"{device.asset_slug} assets must be an object in product/devices.json")
        icons_path = assets.get("icons")
        if not isinstance(icons_path, str) or not icons_path.strip():
            fail(f"{device.asset_slug} is missing assets.icons in product/devices.json")
        if not (ROOT / icons_path).is_file():
            fail(f"{device.asset_slug} assets.icons is missing: {icons_path}")

        docs_text = read(docs_path)
        purchase_component = f'<PurchaseLinks device="{device.web_slug}" />'
        if purchase_component not in docs_text:
            fail(f"{docs_path.relative_to(ROOT)} must render purchase links from product/devices.json")

    vitepress_config = read(ROOT / "docs" / ".vitepress" / "config.js")
    if "deviceSidebarItems" not in vitepress_config or "product/devices.json" not in vitepress_config:
        fail("docs/.vitepress/config.js must build the device sidebar from product/devices.json")
    social_image = catalog.get("social_image")
    if not isinstance(social_image, str) or not social_image.strip():
        fail("product/devices.json must define social_image")
    if not (ROOT / social_image).is_file():
        fail(f"product/devices.json social_image is missing: {social_image}")
    if "deviceCatalog.social_image" not in vitepress_config:
        fail("docs/.vitepress/config.js must read the social image from product/devices.json")

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

    base_yaml = read(ROOT / "common" / "device" / "base.yaml")
    rotation_yaml = read(ROOT / "common" / "addon" / "screen_rotation.yaml")
    if "screen_rotation: !include ../addon/screen_rotation.yaml" not in base_yaml:
        fail("common/device/base.yaml must include the shared screen rotation addon")
    if 'name: "Screen Rotation"' not in rotation_yaml:
        fail("common/addon/screen_rotation.yaml must define the Screen Rotation select")
    duplicated_rotation_files = [
        str(path.relative_to(ROOT))
        for path in (ROOT / "devices").glob("*/device/device.yaml")
        if 'name: "Screen Rotation"' in read(path)
    ]
    if duplicated_rotation_files:
        fail(f"Screen Rotation select must stay shared; remove duplicated device definitions in {duplicated_rotation_files}")

    lifecycle_addons = {
        "esphome_ota": "../addon/esphome_ota.yaml",
        "home_assistant_api": "../addon/home_assistant_api.yaml",
    }
    for package_name, include_path in lifecycle_addons.items():
        if f"{package_name}: !include {include_path}" not in base_yaml:
            fail(f"common/device/base.yaml must include the shared {package_name} addon")
    if "platform: esphome" not in read(ROOT / "common" / "addon" / "esphome_ota.yaml"):
        fail("common/addon/esphome_ota.yaml must define ESPHome OTA behavior")
    if "api:" not in read(ROOT / "common" / "addon" / "home_assistant_api.yaml"):
        fail("common/addon/home_assistant_api.yaml must define the Home Assistant API behavior")
    duplicated_lifecycle_files = [
        str(path.relative_to(ROOT))
        for path in (ROOT / "devices").glob("*/device/device.yaml")
        if re.search(r"^(api|ota):\s*$", read(path), re.MULTILINE)
    ]
    if duplicated_lifecycle_files:
        fail(f"OTA/API lifecycle behavior must stay shared; remove duplicated device definitions in {duplicated_lifecycle_files}")

    if "ui_state: !include ui_state.yaml" not in base_yaml:
        fail("common/device/base.yaml must include the shared UI state definitions")
    ui_state_yaml = read(ROOT / "common" / "device" / "ui_state.yaml")
    if "globals:" not in ui_state_yaml:
        fail("common/device/ui_state.yaml must define shared dashboard globals")
    shared_ui_state_ids = (
        "touch_x_start",
        "touch_y_start",
        "touch_x_end",
        "touch_y_end",
        "touch_start_time",
        "is_ui_hidden",
        "is_screen_dimmed",
        "was_screen_dimmed",
        "is_clock_showing",
        "is_panel_open",
        "was_panel_open",
        "is_tv_mode",
        "is_tv_idle",
        "actions_prompt_acked",
        "device_has_been_setup",
        "lvgl_ready",
    )
    for global_id in shared_ui_state_ids:
        if not re.search(rf"^\s*-\s+id:\s*{re.escape(global_id)}(?:\s|#|$)", ui_state_yaml, re.MULTILINE):
            fail(f"common/device/ui_state.yaml must define shared global {global_id}")
    duplicated_ui_state_files = [
        str(path.relative_to(ROOT))
        for path in (ROOT / "devices").glob("*/device/device.yaml")
        if any(
            re.search(rf"^\s*-\s+id:\s*{re.escape(global_id)}(?:\s|#|$)", read(path), re.MULTILINE)
            for global_id in shared_ui_state_ids
        )
    ]
    if duplicated_ui_state_files:
        fail(f"Dashboard UI state globals must stay shared; remove duplicated device definitions in {duplicated_ui_state_files}")

    setup_wrapper_files = sorted((ROOT / "devices").glob("*/setup/*.yaml"))
    if setup_wrapper_files:
        fail(
            "Setup screens must be included from common/setup directly; remove per-device setup wrappers in "
            f"{[str(path.relative_to(ROOT)) for path in setup_wrapper_files]}"
        )
    device_setup_includes = [
        str(path.relative_to(ROOT))
        for path in (ROOT / "devices").glob("*/device/lvgl.yaml")
        if re.search(r"!include\s+\.\./setup/", read(path))
    ]
    if device_setup_includes:
        fail(f"Device LVGL files must include shared setup screens directly from common/setup: {device_setup_includes}")

    theme_button = read(ROOT / "common" / "theme" / "button.yaml")
    for required_token in ("button_control_radius", "button_arc_width", "button_knob_radius"):
        if required_token not in theme_button:
            fail(f"common/theme/button.yaml must expose shared {required_token} substitution")
    device_theme_files = sorted((ROOT / "devices").glob("*/theme/button.yaml"))
    if device_theme_files:
        fail(
            "Button theme must stay shared in common/theme/button.yaml; remove per-device copies in "
            f"{[str(path.relative_to(ROOT)) for path in device_theme_files]}"
        )
    device_button_includes = [
        str(path.relative_to(ROOT))
        for path in (ROOT / "devices").glob("*/packages*.yaml")
        if "!include theme/button.yaml" in read(path)
    ]
    if device_button_includes:
        fail(f"Device packages must include the shared button theme from common/theme: {device_button_includes}")

    common_placeholder = ROOT / "common" / "assets" / "placeholder.png"
    if not common_placeholder.is_file():
        fail("common/assets/placeholder.png must provide the shared artwork placeholder")
    music_yaml = read(ROOT / "common" / "addon" / "music.yaml")
    if "common/assets/placeholder.png" not in music_yaml:
        fail("common/addon/music.yaml must use the shared artwork placeholder")
    duplicated_placeholders = sorted((ROOT / "devices").glob("*/assets/placeholder.png"))
    if duplicated_placeholders:
        fail(
            "Artwork placeholder must stay shared in common/assets; remove per-device copies in "
            f"{[str(path.relative_to(ROOT)) for path in duplicated_placeholders]}"
        )

    common_medium_icons_path = "common/assets/icons-medium.yaml"
    if any(device.assets["icons"] == common_medium_icons_path for device in devices):
        medium_icons = read(ROOT / common_medium_icons_path)
        for required_token in ("id: icon_font", "id: icon_font_small", "id: icon_font_large", "size: 62"):
            if required_token not in medium_icons:
                fail(f"{common_medium_icons_path} must keep shared medium icon token {required_token!r}")
    for device in devices:
        icons_path = device.assets["icons"]
        package_text = read(ROOT / "devices" / device.config / "packages.yaml")
        include_path = Path(os.path.relpath(ROOT / icons_path, ROOT / "devices" / device.config)).as_posix()
        if f"icons: !include {include_path}" not in package_text:
            fail(f"{device.config} must include the catalog icon asset file {icons_path}")
        local_icons = ROOT / "devices" / device.config / "assets" / "icons.yaml"
        if icons_path == common_medium_icons_path and local_icons.exists():
            fail(f"{local_icons.relative_to(ROOT)} duplicates {common_medium_icons_path}")

    release_yml = read(ROOT / ".github" / "workflows" / "release.yml")
    if "python3 scripts/product_model.py release-matrix" not in release_yml:
        fail("release.yml must build its device matrix from product/devices.json")
    if "fromJson(needs.release-matrix.outputs.matrix)" not in release_yml:
        fail("release.yml build-firmware matrix must use the product model output")
    hardcoded_entries = re.findall(r"- asset_slug: ([^\n]+)", release_yml)
    if hardcoded_entries:
        fail(f"release.yml contains hard-coded device entries: {hardcoded_entries}")

    web_template = read(ROOT / "docs" / "webserver" / "src" / "app.template.js")
    if "__WEB_DEVICE_PROFILES__" not in web_template:
        fail("docs/webserver/src/app.template.js must use product-model web device profile groups")
    hardcoded_web_profiles = [
        device.profile
        for device in devices
        if f'"{device.profile}"' in web_template or f"'{device.profile}'" in web_template
    ]
    if hardcoded_web_profiles:
        fail(f"Webserver source contains hard-coded device profiles: {hardcoded_web_profiles}")


def name_patterns(name: str) -> tuple[str, str]:
    return (f'name: "{name}"', f"name: {name}")


TRACKED_FIRMWARE_DOMAINS = {
    "binary_sensor",
    "button",
    "number",
    "select",
    "sensor",
    "switch",
    "text",
    "text_sensor",
    "update",
}
SCHEMA_CHECK_DOMAINS = {"number", "select", "switch", "text"}
ROOT_KEY_RE = re.compile(r"^([A-Za-z_][A-Za-z0-9_]*):\s*(?:#.*)?$")


def strip_yaml_scalar(value: str) -> str:
    value = value.strip()
    if "#" in value and not value.startswith(("'", '"')):
        value = value.split("#", 1)[0].strip()
    if len(value) >= 2 and value[0] == value[-1] and value[0] in ("'", '"'):
        return value[1:-1]
    return value


def block_value(block: str, key: str) -> str | None:
    match = re.search(rf"^\s+{re.escape(key)}:\s*(.+?)\s*$", block, re.MULTILINE)
    return strip_yaml_scalar(match.group(1)) if match else None


def block_list_values(block: str, key: str) -> list[str]:
    lines = block.splitlines()
    for index, line in enumerate(lines):
        if not re.match(rf"^\s+{re.escape(key)}:\s*$", line):
            continue
        key_indent = len(line) - len(line.lstrip())
        values: list[str] = []
        for option_line in lines[index + 1 :]:
            if not option_line.strip():
                continue
            indent = len(option_line) - len(option_line.lstrip())
            if indent <= key_indent:
                break
            stripped = option_line.strip()
            if stripped.startswith("- "):
                values.append(strip_yaml_scalar(stripped[2:]))
        return values
    return []


def collect_firmware_entity_blocks(paths: Iterable[Path]) -> dict[tuple[str, str], list[dict[str, Any]]]:
    blocks: dict[tuple[str, str], list[dict[str, Any]]] = {}

    for path in paths:
        domain: str | None = None
        current: list[str] = []

        def flush() -> None:
            if not domain or not current:
                return
            text = "\n".join(current)
            name = block_value(text, "name")
            if name:
                blocks.setdefault((domain, name), []).append({"path": path, "text": text})

        for line in read(path).splitlines():
            root_match = ROOT_KEY_RE.match(line)
            if root_match:
                flush()
                root_key = root_match.group(1)
                domain = root_key if root_key in TRACKED_FIRMWARE_DOMAINS else None
                current = []
                continue

            if domain and line.startswith("  - "):
                flush()
                current = [line]
            elif domain and current:
                current.append(line)

        flush()

    return blocks


def expected_firmware_value(setting: dict[str, Any], field: str) -> Any:
    firmware = setting.get("firmware", {})
    if field in firmware:
        return firmware[field]
    return setting.get("default")


def assert_scalar(setting_key: str, block: dict[str, Any], field: str, expected: Any) -> None:
    actual = block_value(block["text"], field)
    if actual is None:
        fail(f"{block['path'].relative_to(ROOT)} {setting_key} is missing {field}")
    if str(actual) != str(expected):
        fail(
            f"{block['path'].relative_to(ROOT)} {setting_key} {field} is {actual!r}; "
            f"product/settings.json expects {expected!r}"
        )


def assert_number(setting_key: str, block: dict[str, Any], field: str, expected: int | float) -> None:
    actual = block_value(block["text"], field)
    if actual is None:
        fail(f"{block['path'].relative_to(ROOT)} {setting_key} is missing {field}")
    try:
        actual_number = float(actual)
    except ValueError as exc:
        raise ProductModelError(f"{block['path'].relative_to(ROOT)} {setting_key} {field} is not numeric: {actual!r}") from exc
    if actual_number != float(expected):
        fail(
            f"{block['path'].relative_to(ROOT)} {setting_key} {field} is {actual!r}; "
            f"product/settings.json expects {expected!r}"
        )


def validate_firmware_setting(
    setting: dict[str, Any],
    catalog: dict[str, Any],
    firmware_blocks: dict[tuple[str, str], list[dict[str, Any]]],
) -> None:
    entity = setting.get("entity")
    if not entity or entity["domain"] not in SCHEMA_CHECK_DOMAINS:
        return

    domain = entity["domain"]
    name = entity["name"]
    blocks = firmware_blocks.get((domain, name), [])
    if not blocks:
        fail(f"Setting entity {name!r} was not found as a {domain} in firmware YAML")

    for block in blocks:
        if domain == "number":
            limits = setting.get("limits")
            if not limits:
                fail(f"Setting {setting['key']} is a number but has no limits in product/settings.json")
            assert_number(setting["key"], block, "min_value", limits["min"])
            assert_number(setting["key"], block, "max_value", limits["max"])
            assert_number(setting["key"], block, "step", limits["step"])
            assert_scalar(setting["key"], block, "initial_value", expected_firmware_value(setting, "initial_value"))

        elif domain == "select":
            expected_options = setting.get("options")
            options_key = entity.get("optionsKey")
            if expected_options is None and options_key:
                expected_options = catalog.get("browser_state", {}).get(options_key)
            if expected_options and len(expected_options) > 1:
                actual_options = block_list_values(block["text"], "options")
                if actual_options != [str(option) for option in expected_options]:
                    fail(
                        f"{block['path'].relative_to(ROOT)} {setting['key']} options are {actual_options!r}; "
                        f"product/settings.json expects {expected_options!r}"
                    )
            assert_scalar(setting["key"], block, "initial_option", expected_firmware_value(setting, "initial_option"))

        elif domain == "switch" and "default" in setting:
            expected = "RESTORE_DEFAULT_ON" if setting["default"] else "RESTORE_DEFAULT_OFF"
            firmware = setting.get("firmware", {})
            assert_scalar(setting["key"], block, "restore_mode", firmware.get("restore_mode", expected))

        elif domain == "text" and "default" in setting:
            assert_scalar(setting["key"], block, "initial_value", expected_firmware_value(setting, "initial_value"))


def check_settings() -> None:
    catalog = load_settings_catalog()
    schema_version = catalog.get("schema_version")
    if not isinstance(schema_version, int) or schema_version < 1:
        fail("product/settings.json must define a positive schema_version")

    settings = catalog["settings"]
    assert_unique((setting["key"] for setting in settings), "setting keys")
    docs_sections = catalog.get("docs_sections", [])
    if not isinstance(docs_sections, list) or not docs_sections:
        fail("product/settings.json must define docs_sections")
    assert_unique((section["title"] for section in docs_sections), "settings docs sections")
    docs_section_titles = {section["title"] for section in docs_sections}

    paths = firmware_yaml_paths()
    firmware_yaml = "\n".join(path.read_text() for path in paths)
    firmware_blocks = collect_firmware_entity_blocks(paths)

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
        validate_firmware_setting(setting, catalog, firmware_blocks)

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
