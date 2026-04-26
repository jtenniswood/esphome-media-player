#!/usr/bin/env python3
"""Build the custom ESPHome web server JavaScript bundle."""

from __future__ import annotations

import argparse
import difflib
import json
from pathlib import Path
import sys


ROOT = Path(__file__).resolve().parents[1]
SRC_DIR = ROOT / "docs" / "webserver" / "src"
STYLE_PATH = SRC_DIR / "style.css"
TEMPLATE_PATH = SRC_DIR / "app.template.js"
OUT_PATH = ROOT / "docs" / "public" / "webserver" / "app.js"


def build_bundle() -> str:
    css = STYLE_PATH.read_text().rstrip("\n")
    template = TEMPLATE_PATH.read_text()
    return template.replace("__MEDIA_PLAYER_CSS__", json.dumps(css, separators=(",", ":")))


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
    parser.add_argument("--check", action="store_true", help="Fail if generated bundle is stale")
    args = parser.parse_args()

    changed = write_or_check(OUT_PATH, build_bundle(), args.check)
    if args.check and changed:
        print("Generated web server bundle is stale. Run `npm run webserver:build`.", file=sys.stderr)
        return 1
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
