#!/usr/bin/env python3
"""Firmware release helpers used by CI.

The release tag is the source of truth for public firmware versions. This
script keeps YAML patching, manifest generation, Pages preparation, and asset
verification in one tested place instead of duplicating shell snippets across
workflows.
"""

from __future__ import annotations

import argparse
from dataclasses import dataclass
import hashlib
import json
import re
import sys
import time
import urllib.error
import urllib.request
from pathlib import Path
from tempfile import TemporaryDirectory
from urllib.parse import urljoin


ROOT = Path(__file__).resolve().parent.parent
PROJECT_NAME = "jtenniswood.media-player"
FIRMWARE_NAME = "jtenniswood.media-player"
REPO = "jtenniswood/esphome-media-player"
PUBLIC_BASE_URL = "https://jtenniswood.github.io/esphome-media-player"
VERSION_RE = re.compile(r"^v\d+\.\d+\.\d+(?:[-+][0-9A-Za-z.-]+)?$")
FIRMWARE_VERSION_PLACEHOLDER = '  firmware_version: "0.0.0"'
PLACEHOLDER_STRINGS = {"dev", "main", "0.0.0"}


@dataclass(frozen=True)
class Device:
    asset_slug: str
    web_slug: str
    config: str
    chip: str

    @property
    def factory_yaml(self) -> Path:
        return ROOT / "builds" / f"{self.config}.factory.yaml"


DEVICES = (
    Device(
        asset_slug="media-player-jc8012p4a1",
        web_slug="jc8012p4a1",
        config="guition-esp32-p4-jc8012p4a1",
        chip="ESP32-P4",
    ),
    Device(
        asset_slug="media-player-jc1060p470",
        web_slug="jc1060p470",
        config="guition-esp32-p4-jc1060p470",
        chip="ESP32-P4",
    ),
    Device(
        asset_slug="media-player-jc4880p443",
        web_slug="jc4880p443",
        config="guition-esp32-p4-jc4880p443",
        chip="ESP32-P4",
    ),
    Device(
        asset_slug="media-player-p4-86-panel",
        web_slug="p4-86-panel",
        config="esp32-p4-86-panel",
        chip="ESP32-P4",
    ),
    Device(
        asset_slug="media-player-4848s040",
        web_slug="4848s040",
        config="guition-esp32-s3-4848s040",
        chip="ESP32-S3",
    ),
)
DEVICE_BY_SLUG = {
    value: device
    for device in DEVICES
    for value in (device.asset_slug, device.web_slug, device.config)
}
DEFAULT_ASSET_SLUGS = [device.asset_slug for device in DEVICES]


class FirmwareReleaseError(RuntimeError):
    pass


def release_url(version: str) -> str:
    return f"https://github.com/{REPO}/releases/tag/{version}"


def assert_version(version: str) -> None:
    if not VERSION_RE.match(version):
        raise FirmwareReleaseError(
            f"{version!r} is not a full release tag. Use vMAJOR.MINOR.PATCH, for example v2.0.3."
        )


def resolve_device(slug: str) -> Device:
    try:
        return DEVICE_BY_SLUG[slug]
    except KeyError as exc:
        known = ", ".join(DEFAULT_ASSET_SLUGS)
        raise FirmwareReleaseError(f"Unknown device slug {slug!r}. Expected one of: {known}") from exc


def md5sum(path: Path) -> str:
    digest = hashlib.md5()
    with path.open("rb") as f:
        for chunk in iter(lambda: f.read(1024 * 1024), b""):
            digest.update(chunk)
    return digest.hexdigest()


def sha256sum(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as f:
        for chunk in iter(lambda: f.read(1024 * 1024), b""):
            digest.update(chunk)
    return digest.hexdigest()


def printable_string_list(path: Path, min_length: int = 3) -> list[str]:
    data = path.read_bytes()
    strings: list[str] = []
    current = bytearray()

    def flush() -> None:
        nonlocal current
        if len(current) >= min_length:
            strings.append(current.decode("ascii", errors="ignore"))
        current = bytearray()

    for byte in data:
        if 32 <= byte <= 126:
            current.append(byte)
        else:
            flush()
    flush()
    return strings


def contains_sequence(strings: list[str], sequence: list[str]) -> bool:
    if len(strings) < len(sequence):
        return False
    last_start = len(strings) - len(sequence) + 1
    return any(strings[idx : idx + len(sequence)] == sequence for idx in range(last_start))


def require_file(path: Path, label: str) -> None:
    if not path.is_file():
        raise FirmwareReleaseError(f"{label} not found: {path}")


def assert_binary_version(path: Path, version: str) -> None:
    require_file(path, "firmware image")
    strings = printable_string_list(path)
    string_set = set(strings)
    if version not in string_set:
        raise FirmwareReleaseError(f"{path} does not contain firmware version {version}")

    expected_log_version = f"Project {PROJECT_NAME} version {version}"
    if expected_log_version not in string_set:
        raise FirmwareReleaseError(f"{path} does not contain ESPHome project version {version}")

    expected_project_metadata = ["package_import_url", version, PROJECT_NAME, "project_version"]
    if not contains_sequence(strings, expected_project_metadata):
        raise FirmwareReleaseError(f"{path} does not contain API project metadata version {version}")

    for placeholder in PLACEHOLDER_STRINGS:
        placeholder_log_version = f"Project {PROJECT_NAME} version {placeholder}"
        placeholder_project_metadata = ["package_import_url", placeholder, PROJECT_NAME, "project_version"]
        if placeholder_log_version in string_set or contains_sequence(strings, placeholder_project_metadata):
            raise FirmwareReleaseError(f"{path} still contains firmware version placeholder {placeholder}")


def load_manifest(path: Path) -> dict:
    require_file(path, "firmware manifest")
    try:
        return json.loads(path.read_text())
    except json.JSONDecodeError as exc:
        raise FirmwareReleaseError(f"{path} is not valid JSON: {exc}") from exc


def first_build(manifest: dict, manifest_path: Path) -> dict:
    builds = manifest.get("builds")
    if not isinstance(builds, list) or not builds:
        raise FirmwareReleaseError(f"{manifest_path} has no firmware builds")
    if not isinstance(builds[0], dict):
        raise FirmwareReleaseError(f"{manifest_path} first build is not an object")
    return builds[0]


def verify_manifest(
    manifest_path: Path,
    slug: str,
    version: str,
    ota_md5: str,
    expected_release_url: str | None = None,
    require_factory: bool = True,
) -> dict:
    manifest = load_manifest(manifest_path)
    actual_version = str(manifest.get("version", "")).strip()
    if actual_version != version:
        raise FirmwareReleaseError(f"{manifest_path} version {actual_version!r} does not match {version!r}")
    if actual_version in PLACEHOLDER_STRINGS:
        raise FirmwareReleaseError(f"{manifest_path} contains placeholder version {actual_version}")
    if manifest.get("home_assistant_domain") != "esphome":
        raise FirmwareReleaseError(f"{manifest_path} home_assistant_domain must be esphome")

    build = first_build(manifest, manifest_path)
    ota = build.get("ota")
    if not isinstance(ota, dict):
        raise FirmwareReleaseError(f"{manifest_path} build has no ota object")

    expected_ota_path = f"{slug}.ota.bin"
    if ota.get("path") != expected_ota_path:
        raise FirmwareReleaseError(f"{manifest_path} ota.path must be {expected_ota_path}")
    if ota.get("md5") != ota_md5:
        raise FirmwareReleaseError(f"{manifest_path} ota.md5 does not match {expected_ota_path}")
    if ota.get("sha256") and ota.get("sha256") != sha256sum(manifest_path.parent / expected_ota_path):
        raise FirmwareReleaseError(f"{manifest_path} ota.sha256 does not match {expected_ota_path}")

    expected_url = expected_release_url or release_url(version)
    if ota.get("release_url") != expected_url:
        raise FirmwareReleaseError(f"{manifest_path} release_url must be {expected_url}")

    if require_factory:
        expected_factory_path = f"{slug}.factory.bin"
        parts = build.get("parts")
        if not isinstance(parts, list) or not parts:
            raise FirmwareReleaseError(f"{manifest_path} build has no factory parts")
        first_part = parts[0]
        if not isinstance(first_part, dict):
            raise FirmwareReleaseError(f"{manifest_path} first factory part is not an object")
        if first_part.get("path") != expected_factory_path:
            raise FirmwareReleaseError(f"{manifest_path} factory path must be {expected_factory_path}")
        if first_part.get("offset") != 0:
            raise FirmwareReleaseError(f"{manifest_path} factory offset must be 0")
        if first_part.get("md5") and first_part.get("md5") != md5sum(manifest_path.parent / expected_factory_path):
            raise FirmwareReleaseError(f"{manifest_path} factory md5 does not match {expected_factory_path}")
        if first_part.get("sha256") and first_part.get("sha256") != sha256sum(manifest_path.parent / expected_factory_path):
            raise FirmwareReleaseError(f"{manifest_path} factory sha256 does not match {expected_factory_path}")

    return build


def verify_files(
    slug: str,
    version: str,
    manifest: Path,
    factory: Path | None,
    ota: Path,
    expected_release_url: str | None = None,
) -> None:
    assert_version(version)
    require_file(manifest, "firmware manifest")
    require_file(ota, "OTA firmware")
    require_factory = factory is not None
    if require_factory:
        require_file(factory, "factory firmware")

    verify_manifest(manifest, slug, version, md5sum(ota), expected_release_url, require_factory=require_factory)
    assert_binary_version(ota, version)
    if factory is not None:
        assert_binary_version(factory, version)


def find_first(paths: list[Path]) -> Path | None:
    for path in paths:
        if path.is_file():
            return path
    return None


def locate_release_files(base_dir: Path, slug: str) -> tuple[Path, Path, Path]:
    device = DEVICE_BY_SLUG.get(slug)
    asset_slug = device.asset_slug if device else slug
    web_slug = device.web_slug if device else slug
    dirs = [base_dir / web_slug, base_dir / asset_slug, base_dir]
    manifests = []
    factories = []
    otas = []
    for directory in dirs:
        manifests.extend([directory / "manifest.json", directory / f"{asset_slug}.manifest.json"])
        factories.append(directory / f"{asset_slug}.factory.bin")
        otas.append(directory / f"{asset_slug}.ota.bin")

    manifest = find_first(manifests)
    factory = find_first(factories)
    ota = find_first(otas)
    if manifest is None:
        raise FirmwareReleaseError(f"No manifest found for {asset_slug} in {base_dir}")
    if factory is None:
        raise FirmwareReleaseError(f"No factory image found for {asset_slug} in {base_dir}")
    if ota is None:
        raise FirmwareReleaseError(f"No OTA image found for {asset_slug} in {base_dir}")
    return manifest, factory, ota


def locate_release_images(base_dir: Path, slug: str) -> tuple[Path, Path]:
    device = DEVICE_BY_SLUG.get(slug)
    asset_slug = device.asset_slug if device else slug
    web_slug = device.web_slug if device else slug
    dirs = [base_dir / web_slug, base_dir / asset_slug, base_dir]
    factories = [directory / f"{asset_slug}.factory.bin" for directory in dirs]
    otas = [directory / f"{asset_slug}.ota.bin" for directory in dirs]
    factory = find_first(factories)
    ota = find_first(otas)
    if factory is None:
        raise FirmwareReleaseError(f"No factory image found for {asset_slug} in {base_dir}")
    if ota is None:
        raise FirmwareReleaseError(f"No OTA image found for {asset_slug} in {base_dir}")
    return factory, ota


def manifest_version(path: Path) -> str:
    version = str(load_manifest(path).get("version", "")).strip()
    if not version or version in PLACEHOLDER_STRINGS:
        raise FirmwareReleaseError(f"{path} has invalid version {version!r}")
    assert_version(version)
    return version


def verify_directory(base_dir: Path, slugs: list[str], version: str, expected_release_url: str | None = None) -> None:
    for slug in slugs:
        device = DEVICE_BY_SLUG.get(slug)
        asset_slug = device.asset_slug if device else slug
        manifest, factory, ota = locate_release_files(base_dir, asset_slug)
        verify_files(asset_slug, version, manifest, factory, ota, expected_release_url)


def fetch_url(url: str, timeout: int = 30) -> bytes:
    request = urllib.request.Request(url, headers={"User-Agent": "esphome-media-player-release-check"})
    with urllib.request.urlopen(request, timeout=timeout) as response:
        return response.read()


def download(url: str, path: Path) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_bytes(fetch_url(url))


def public_manifest_url(base_url: str, device: Device) -> str:
    return base_url.rstrip("/") + f"/firmware/{device.web_slug}/manifest.json"


def download_and_verify_public_device(base_url: str, device: Device, version: str, out_dir: Path) -> None:
    manifest_url = public_manifest_url(base_url, device)
    slug_dir = out_dir / device.web_slug
    manifest_path = slug_dir / "manifest.json"
    download(manifest_url, manifest_path)

    build = first_build(load_manifest(manifest_path), manifest_path)
    ota = build.get("ota")
    if not isinstance(ota, dict) or not ota.get("path"):
        raise FirmwareReleaseError(f"{manifest_url} has no OTA path")
    ota_path = slug_dir / Path(str(ota["path"])).name
    download(urljoin(manifest_url, ota["path"]), ota_path)

    parts = build.get("parts")
    if not isinstance(parts, list) or not parts or not isinstance(parts[0], dict) or not parts[0].get("path"):
        raise FirmwareReleaseError(f"{manifest_url} has no factory path")
    factory_path = slug_dir / Path(str(parts[0]["path"])).name
    download(urljoin(manifest_url, parts[0]["path"]), factory_path)

    verify_files(device.asset_slug, version, manifest_path, factory_path, ota_path)


def verify_pages(base_url: str, slugs: list[str], version: str, retries: int, delay: float) -> None:
    last_error: Exception | None = None
    devices = [resolve_device(slug) for slug in slugs]
    for attempt in range(1, retries + 1):
        try:
            with TemporaryDirectory() as tmp:
                out_dir = Path(tmp)
                for device in devices:
                    download_and_verify_public_device(base_url, device, version, out_dir)
            return
        except Exception as exc:  # noqa: BLE001 - converted to CI-friendly error after retries
            last_error = exc
            if attempt >= retries:
                break
            print(f"Public firmware verification attempt {attempt} failed: {exc}", file=sys.stderr)
            time.sleep(delay)
    raise FirmwareReleaseError(f"Public firmware verification failed after {retries} attempts: {last_error}")


def write_manifest(
    slug: str,
    chip: str,
    version: str,
    factory: Path,
    ota: Path,
    out: Path,
    summary: str = "",
    expected_release_url: str | None = None,
) -> None:
    require_file(factory, "factory firmware")
    require_file(ota, "OTA firmware")
    url = expected_release_url or release_url(version)
    data = {
        "name": FIRMWARE_NAME,
        "version": version,
        "home_assistant_domain": "esphome",
        "new_install_prompt_erase": False,
        "builds": [
            {
                "chipFamily": chip,
                "parts": [
                    {
                        "path": f"{slug}.factory.bin",
                        "offset": 0,
                        "md5": md5sum(factory),
                        "sha256": sha256sum(factory),
                    },
                ],
                "ota": {
                    "path": f"{slug}.ota.bin",
                    "md5": md5sum(ota),
                    "sha256": sha256sum(ota),
                    "summary": summary,
                    "release_url": url,
                },
            },
        ],
    }
    out.parent.mkdir(parents=True, exist_ok=True)
    out.write_text(json.dumps(data, indent=2) + "\n")


def prepare_pages(release_dir: Path, output_dir: Path, version: str, slugs: list[str], summary: str = "") -> None:
    output_dir.mkdir(parents=True, exist_ok=True)
    for slug in slugs:
        device = resolve_device(slug)
        try:
            manifest, factory, ota = locate_release_files(release_dir, device.asset_slug)
        except FirmwareReleaseError:
            manifest = None
            factory, ota = locate_release_images(release_dir, device.asset_slug)
        device_dir = output_dir / device.web_slug
        device_dir.mkdir(parents=True, exist_ok=True)

        target_factory = device_dir / f"{device.asset_slug}.factory.bin"
        target_ota = device_dir / f"{device.asset_slug}.ota.bin"
        target_manifest = device_dir / "manifest.json"
        target_factory.write_bytes(factory.read_bytes())
        target_ota.write_bytes(ota.read_bytes())

        if manifest is not None and (
            manifest.name == "manifest.json" or manifest.name == f"{device.asset_slug}.manifest.json"
        ):
            target_manifest.write_bytes(manifest.read_bytes())
        else:
            write_manifest(
                device.asset_slug,
                device.chip,
                version,
                target_factory,
                target_ota,
                target_manifest,
                summary=summary,
            )

        verify_files(device.asset_slug, version, target_manifest, target_factory, target_ota)


def cmd_inject(args: argparse.Namespace) -> None:
    assert_version(args.version)
    device = resolve_device(args.slug)
    path = Path(args.file) if args.file else device.factory_yaml
    require_file(path, "factory build YAML")
    text = path.read_text()
    replacement = f'  firmware_version: "{args.version}"'
    if FIRMWARE_VERSION_PLACEHOLDER not in text:
        raise FirmwareReleaseError(f"Expected placeholder not found in {path}")
    path.write_text(text.replace(FIRMWARE_VERSION_PLACEHOLDER, replacement, 1))


def cmd_manifest(args: argparse.Namespace) -> None:
    assert_version(args.version)
    device = DEVICE_BY_SLUG.get(args.slug)
    chip = args.chip or (device.chip if device else None)
    if chip is None:
        raise FirmwareReleaseError("--chip is required for unknown slugs")
    write_manifest(
        args.slug,
        chip,
        args.version,
        Path(args.factory),
        Path(args.ota),
        Path(args.out),
        summary=args.summary or "",
        expected_release_url=args.release_url,
    )


def cmd_prepare_pages(args: argparse.Namespace) -> None:
    assert_version(args.version)
    prepare_pages(Path(args.release_dir), Path(args.out), args.version, args.slugs, summary=args.summary or "")


def cmd_verify_files(args: argparse.Namespace) -> None:
    verify_files(args.slug, args.version, Path(args.manifest), Path(args.factory), Path(args.ota), args.release_url)


def cmd_verify_directory(args: argparse.Namespace) -> None:
    verify_directory(Path(args.dir), args.slugs, args.version, args.release_url)


def cmd_verify_pages(args: argparse.Namespace) -> None:
    verify_pages(args.base_url, args.slugs, args.version, args.retries, args.delay)


def cmd_list_slugs(args: argparse.Namespace) -> None:
    values = DEFAULT_ASSET_SLUGS if args.kind == "asset" else [device.web_slug for device in DEVICES]
    print(" ".join(values))


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(description=__doc__)
    sub = parser.add_subparsers(dest="command", required=True)

    inject = sub.add_parser("inject", help="Inject a firmware version into a factory YAML")
    inject.add_argument("--slug", required=True)
    inject.add_argument("--version", required=True)
    inject.add_argument("--file", help=argparse.SUPPRESS)
    inject.set_defaults(func=cmd_inject)

    manifest = sub.add_parser("manifest", help="Generate a firmware manifest")
    manifest.add_argument("--slug", required=True)
    manifest.add_argument("--chip")
    manifest.add_argument("--version", required=True)
    manifest.add_argument("--factory", required=True)
    manifest.add_argument("--ota", required=True)
    manifest.add_argument("--out", required=True)
    manifest.add_argument("--summary", default="")
    manifest.add_argument("--release-url")
    manifest.set_defaults(func=cmd_manifest)

    prepare_pages_cmd = sub.add_parser("prepare-pages", help="Prepare public Pages firmware directories")
    prepare_pages_cmd.add_argument("--version", required=True)
    prepare_pages_cmd.add_argument("--release-dir", required=True)
    prepare_pages_cmd.add_argument("--out", required=True)
    prepare_pages_cmd.add_argument("--summary", default="")
    prepare_pages_cmd.add_argument("--slugs", nargs="+", default=DEFAULT_ASSET_SLUGS)
    prepare_pages_cmd.set_defaults(func=cmd_prepare_pages)

    verify_files_cmd = sub.add_parser("verify-files", help="Verify one slug's firmware files")
    verify_files_cmd.add_argument("--slug", required=True)
    verify_files_cmd.add_argument("--version", required=True)
    verify_files_cmd.add_argument("--manifest", required=True)
    verify_files_cmd.add_argument("--factory", required=True)
    verify_files_cmd.add_argument("--ota", required=True)
    verify_files_cmd.add_argument("--release-url")
    verify_files_cmd.set_defaults(func=cmd_verify_files)

    verify_directory_cmd = sub.add_parser("verify-directory", help="Verify firmware files for multiple slugs")
    verify_directory_cmd.add_argument("--version", required=True)
    verify_directory_cmd.add_argument("--dir", required=True)
    verify_directory_cmd.add_argument("--slugs", nargs="+", default=DEFAULT_ASSET_SLUGS)
    verify_directory_cmd.add_argument("--release-url")
    verify_directory_cmd.set_defaults(func=cmd_verify_directory)

    verify_pages_cmd = sub.add_parser("verify-pages", help="Verify public GitHub Pages firmware")
    verify_pages_cmd.add_argument("--version", required=True)
    verify_pages_cmd.add_argument("--base-url", required=True)
    verify_pages_cmd.add_argument("--slugs", nargs="+", default=DEFAULT_ASSET_SLUGS)
    verify_pages_cmd.add_argument("--retries", type=int, default=1)
    verify_pages_cmd.add_argument("--delay", type=float, default=15)
    verify_pages_cmd.set_defaults(func=cmd_verify_pages)

    list_slugs_cmd = sub.add_parser("list-slugs", help="Print configured device slugs")
    list_slugs_cmd.add_argument("--kind", choices=("asset", "web"), default="asset")
    list_slugs_cmd.set_defaults(func=cmd_list_slugs)

    return parser


def main(argv: list[str] | None = None) -> int:
    parser = build_parser()
    args = parser.parse_args(argv)
    try:
        args.func(args)
    except FirmwareReleaseError as exc:
        print(f"::error::{exc}", file=sys.stderr)
        return 1
    return 0


if __name__ == "__main__":
    sys.exit(main())
