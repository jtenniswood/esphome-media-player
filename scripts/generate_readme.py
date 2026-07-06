#!/usr/bin/env python3
"""Generate catalog-backed sections in README.md."""

from __future__ import annotations

import argparse
import sys

from product_model import ROOT, devices_by_docs_order, display_dimensions


README_PATH = ROOT / "README.md"
DOCS_BASE_URL = "https://jtenniswood.github.io/esphome-media-player"
START = "<!-- generated:supported-screens:start -->"
END = "<!-- generated:supported-screens:end -->"


def supported_screens_table() -> str:
    rows = [
        "| Device | Size | Buy |",
        "|--------|------|-----|",
    ]
    for device in devices_by_docs_order():
        width, height = display_dimensions(device)
        docs_url = f"{DOCS_BASE_URL}{device.docs_path}"
        device_link = f"[{device.display['name']}]({docs_url})"
        purchase = device.purchase
        buy_link = f"[{purchase['label']}]({purchase['url']})"
        rows.append(f"| {device_link} | {device.display['size']} ({width} x {height}) | {buy_link} |")
    return "\n".join(rows)


def replace_generated_block(text: str) -> str:
    start_index = text.find(START)
    end_index = text.find(END)
    if start_index == -1 or end_index == -1 or end_index < start_index:
        raise RuntimeError(f"{README_PATH.relative_to(ROOT)} is missing the supported screens generated markers")

    block_start = start_index + len(START)
    generated = f"\n{supported_screens_table()}\n"
    return f"{text[:block_start]}{generated}{text[end_index:]}"


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--check", action="store_true", help="fail if README.md is not up to date")
    args = parser.parse_args()

    original = README_PATH.read_text()
    generated = replace_generated_block(original)
    if args.check:
        if generated != original:
            print("README.md supported screens table is not generated from product/devices.json", file=sys.stderr)
            return 1
        return 0

    README_PATH.write_text(generated)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
