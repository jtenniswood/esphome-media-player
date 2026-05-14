#!/usr/bin/env python3
"""Smoke tests for scripts/release_changelog.py."""

from __future__ import annotations

from contextlib import redirect_stderr
import io
import subprocess
from pathlib import Path
from tempfile import TemporaryDirectory

import release_changelog


def git(repo: Path, *args: str) -> str:
    result = subprocess.run(
        ["git", *args],
        cwd=repo,
        check=True,
        text=True,
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
    )
    return result.stdout.strip()


def write(repo: Path, path: str, text: str) -> None:
    target = repo / path
    target.parent.mkdir(parents=True, exist_ok=True)
    target.write_text(text)


def commit(repo: Path, subject: str) -> str:
    git(repo, "add", ".")
    git(repo, "commit", "-m", subject)
    return git(repo, "rev-parse", "--short", "HEAD")


def with_temp_repo() -> tuple[TemporaryDirectory[str], Path]:
    tmp = TemporaryDirectory()
    repo = Path(tmp.name)
    git(repo, "init", "-b", "main")
    git(repo, "config", "user.email", "test@example.com")
    git(repo, "config", "user.name", "Test User")
    git(repo, "remote", "add", "origin", "https://github.com/example/esphome-media-player.git")
    write(repo, "README.md", "# Demo\n")
    commit(repo, "Initial release")
    git(repo, "tag", "v1.0.0")
    return tmp, repo


def test_future_release_uses_latest_stable_tag() -> None:
    tmp, repo = with_temp_repo()
    original_root = release_changelog.ROOT
    try:
        release_changelog.ROOT = repo
        write(repo, "common/addon/firmware_update.yaml", "update: {}\n")
        commit(repo, "Prepare beta firmware release")
        git(repo, "tag", "v1.1.0-beta.1")
        write(repo, "docs/webserver/src/app.template.js", "export const type = 'settings';\n")
        short_hash = commit(repo, "Add web settings control (#12)")
        full_hash = git(repo, "rev-parse", "HEAD")
        text = release_changelog.build_changelog(
            "v1.1.0",
            release_changelog.default_from_ref("v1.1.0", "HEAD"),
            "HEAD",
            release_changelog.remote_url(),
        )
    finally:
        release_changelog.ROOT = original_root
        tmp.cleanup()

    assert "Changes since `v1.0.0`." in text
    assert "v1.1.0-beta.1" not in text
    assert "### Music dashboard UI and settings" in text
    assert "Add web settings control" in text
    assert f"[{short_hash}]" in text
    assert "[#12](https://github.com/example/esphome-media-player/pull/12)" in text
    assert f"Release range: `v1.0.0` to `{short_hash} (HEAD)`." in text
    assert f"[Full comparison](https://github.com/example/esphome-media-player/compare/v1.0.0...{full_hash})" in text


def test_existing_tag_uses_previous_stable_tag() -> None:
    tmp, repo = with_temp_repo()
    original_root = release_changelog.ROOT
    try:
        release_changelog.ROOT = repo
        write(repo, "components/artwork_image/image_decoder.cpp", "// firmware\n")
        commit(repo, "Fix artwork decoder behavior")
        git(repo, "tag", "v1.1.0")
        write(repo, "docs/installation.md", "# Install\n")
        commit(repo, "Update installation notes")
        git(repo, "tag", "v1.2.0")
        text = release_changelog.build_changelog(
            "v1.2.0",
            release_changelog.default_from_ref("v1.2.0", "v1.2.0"),
            "v1.2.0",
            None,
        )
    finally:
        release_changelog.ROOT = original_root
        tmp.cleanup()

    assert "Changes since `v1.1.0`." in text
    assert "Release range: `v1.1.0` to `v1.2.0`." in text
    assert "### Supported devices and installation" in text
    assert "Update installation notes" in text
    assert "Fix artwork decoder behavior" not in text


def test_bad_version_and_bad_range_fail() -> None:
    tmp, repo = with_temp_repo()
    original_root = release_changelog.ROOT
    try:
        release_changelog.ROOT = repo
        with redirect_stderr(io.StringIO()):
            assert release_changelog.main(["v1.2", "--no-links"]) != 0
            assert release_changelog.main(["v1.1.0", "--from", "does-not-exist", "--no-links"]) != 0
    finally:
        release_changelog.ROOT = original_root
        tmp.cleanup()


def main() -> int:
    test_future_release_uses_latest_stable_tag()
    test_existing_tag_uses_previous_stable_tag()
    test_bad_version_and_bad_range_fail()
    print("Release changelog tests passed.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
