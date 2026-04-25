---
name: updates
description: >-
  Summarize user-facing project updates from the last 7 days. Use when the user
  says "/updates", asks what changed recently, or wants a concise list of recent
  features, device support, fixes that users will notice, or other product value.
---

# Recent User-Facing Updates

Summarize changes made to this project in the last 7 days, focused on what a
user would care about.

## Workflow

### 1. Gather Recent Changes

Use git history from the last 7 days, including commit messages and changed
files:

```bash
git log --since="7 days ago" --date=short --pretty=format:'%h %ad %s'
git log --since="7 days ago" --name-status --date=short --pretty=format:'%h %ad %s'
```

If the local branch may be stale, fetch first:

```bash
git fetch origin --prune
```

When commit messages are too vague, inspect the relevant diffs:

```bash
git show --stat <commit>
git show <commit> -- <path>
```

### 2. Filter For User Value

Include changes that add or improve something users can notice, such as:

- New device support or hardware variants
- New features or visible behavior changes
- Setup, install, update, dashboard, documentation, or release improvements
- Bug fixes with clear user impact
- Firmware, display, audio, touch, Wi-Fi, Bluetooth, or Home Assistant behavior
  that changes the user experience

Ignore changes that are mostly internal:

- Refactoring, cleanup, renames, formatting, dependency chores, or build plumbing
- Minor code tweaks without clear user impact
- Test-only changes unless they explain a shipped behavior fix
- CI-only changes unless they directly affect release availability for users

### 3. Write The Summary

Be concise. Return a short list in this format:

```text
- Title: One plain-language sentence explaining what it does for users.
```

Group related commits into one item. Prefer 3-6 bullets, and use fewer if there
were only a few meaningful user-facing updates. Do not include commit hashes
unless the user asks for them.

If there were no meaningful user-facing updates in the last 7 days, say that
plainly and mention that you ignored internal maintenance changes.
