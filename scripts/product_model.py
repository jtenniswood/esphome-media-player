"""Shared product catalog helpers.

The catalog is the source of truth for device identities and browser-facing
settings. Keep this module dependency-free so release and Pages workflows can
use it from sparse checkouts.
"""

from __future__ import annotations

from dataclasses import dataclass
import json
from pathlib import Path
import sys
from typing import Any


ROOT = Path(__file__).resolve().parents[1]
PRODUCT_DIR = ROOT / "product"
DEVICES_PATH = PRODUCT_DIR / "devices.json"
SETTINGS_PATH = PRODUCT_DIR / "settings.json"


@dataclass(frozen=True)
class Device:
    profile: str
    asset_slug: str
    web_slug: str
    config: str
    chip: str
    package_path: str
    docs_path: str
    docs: dict[str, Any]
    purchase: dict[str, str]
    display: dict[str, Any]
    installer: dict[str, Any]

    @property
    def factory_yaml(self) -> Path:
        return ROOT / "builds" / f"{self.config}.factory.yaml"

    @property
    def width(self) -> int:
        return int(self.display["width"])

    @property
    def height(self) -> int:
        return int(self.display["height"])


def _load_json(path: Path) -> dict[str, Any]:
    try:
        return json.loads(path.read_text())
    except FileNotFoundError as exc:
        raise RuntimeError(f"Missing product catalog file: {path}") from exc
    except json.JSONDecodeError as exc:
        raise RuntimeError(f"Invalid JSON in {path}: {exc}") from exc


def load_device_catalog() -> dict[str, Any]:
    return _load_json(DEVICES_PATH)


def load_devices() -> tuple[Device, ...]:
    catalog = load_device_catalog()
    devices = catalog.get("devices")
    if not isinstance(devices, list) or not devices:
        raise RuntimeError(f"{DEVICES_PATH} must contain a non-empty devices list")
    return tuple(Device(**device) for device in devices)


def load_settings_catalog() -> dict[str, Any]:
    catalog = _load_json(SETTINGS_PATH)
    settings = catalog.get("settings")
    if not isinstance(settings, list) or not settings:
        raise RuntimeError(f"{SETTINGS_PATH} must contain a non-empty settings list")
    return catalog


def device_by_slug() -> dict[str, Device]:
    return {
        value: device
        for device in load_devices()
        for value in (device.asset_slug, device.web_slug, device.config, device.profile)
    }


def default_asset_slugs() -> list[str]:
    return [device.asset_slug for device in load_devices()]


def firmware_manifest_slugs() -> dict[str, str]:
    return {device.profile: device.web_slug for device in load_devices()}


def install_devices() -> list[dict[str, Any]]:
    devices = sorted(load_devices(), key=lambda device: int(device.installer["order"]))
    return [
        {
            "key": device.web_slug,
            "label": device.display["label"],
            "size": device.display["size"],
            "resolution": f"{device.width} x {device.height}",
            "slots": int(device.installer["slots"]),
            "cols": int(device.installer["cols"]),
            "rows": int(device.installer["rows"]),
            "aspect": f"{device.width} / {device.height}" if device.width != device.height else "1 / 1",
            "shape": device.display["shape"],
            "manifest": f"{device.web_slug}/manifest.json",
        }
        for device in devices
    ]


def display_layout_label(device: Device) -> str:
    layout = str(device.display.get("layout", ""))
    if layout.startswith("landscape"):
        return "landscape"
    if layout.startswith("portrait"):
        return "portrait"
    return "square" if device.display.get("shape") == "square" else str(device.display.get("shape", ""))


def display_dimensions(device: Device) -> tuple[int, int]:
    width = device.width
    height = device.height
    layout = display_layout_label(device)
    if layout == "landscape":
        return max(width, height), min(width, height)
    if layout == "portrait":
        return min(width, height), max(width, height)
    return width, height


def devices_by_docs_order() -> list[Device]:
    return sorted(load_devices(), key=lambda device: int(device.docs["order"]))


def web_settings_state() -> dict[str, Any]:
    catalog = load_settings_catalog()
    state: dict[str, Any] = {}
    for setting in catalog["settings"]:
        if "default" in setting:
            state[setting["key"]] = setting["default"]
    state.update(catalog.get("browser_state", {}))
    return state


def web_settings_entities() -> dict[str, dict[str, Any]]:
    catalog = load_settings_catalog()
    return {
        setting["key"]: setting["entity"]
        for setting in catalog["settings"]
        if "entity" in setting
    }


def web_settings_number_limits() -> dict[str, dict[str, Any]]:
    catalog = load_settings_catalog()
    return {
        setting["key"]: setting["limits"]
        for setting in catalog["settings"]
        if "limits" in setting
    }


def web_setting_options() -> dict[str, list[Any]]:
    catalog = load_settings_catalog()
    return {
        setting["key"]: setting["options"]
        for setting in catalog["settings"]
        if "options" in setting
    }


def web_setting_default(key: str) -> Any:
    catalog = load_settings_catalog()
    for setting in catalog["settings"]:
        if setting["key"] == key and "default" in setting:
            return setting["default"]
    raise KeyError(key)


def release_matrix() -> dict[str, list[dict[str, str]]]:
    return {
        "include": [
            {
                "asset_slug": device.asset_slug,
                "config": device.config,
                "chip": device.chip,
            }
            for device in load_devices()
        ]
    }


def main(argv: list[str] | None = None) -> int:
    args = argv if argv is not None else sys.argv[1:]
    if args == ["release-matrix"]:
        print(json.dumps(release_matrix(), separators=(",", ":")))
        return 0
    print("Usage: product_model.py release-matrix", file=sys.stderr)
    return 2


if __name__ == "__main__":
    raise SystemExit(main())
