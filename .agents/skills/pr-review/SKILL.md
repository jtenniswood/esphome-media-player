---
name: pr-review
description: >-
  Address GitHub pull request feedback for this repository. Use when the user
  says "/pr-review" and wants review comments, requested changes, or unresolved
  feedback on an open PR inspected, incorporated into the branch, pushed, and
  marked resolved after the fix is made.
---

# /pr-review

## Goal

Turn actionable PR feedback into a tested branch update. Find unresolved review
comments, understand what they are asking for, make the matching code or docs
changes, push the branch, and resolve only the feedback threads that were truly
addressed.

This is different from `/pr`, which reviews a PR and recommends whether to
merge. Use `/pr-review` when feedback already exists and needs action.

## Workflow

### 1. Identify the PR

Use the PR number or URL if the user provides one. Otherwise inspect open PRs
and choose the current branch's PR if one exists; if not, choose the most
recent open PR and state that assumption.

Prefer GitHub connector tools when available. Otherwise use `gh`:

```bash
gh pr status
gh pr list --state open --limit 10 \
  --json number,title,author,headRefName,baseRefName,reviewDecision,updatedAt,url
gh pr view <number> \
  --json number,title,body,headRefName,baseRefName,reviewDecision,statusCheckRollup,url
```

### 2. Work in the PR Branch

Protect `main`. Use the PR branch in a separate worktree when possible. First
inspect whether the PR comes from this repository or a fork:

```bash
gh pr view <number> \
  --json headRefName,headRepositoryOwner,headRepository,isCrossRepository,maintainerCanModify
```

For a same-repository PR, fetch the branch and create a worktree from its
remote-tracking branch:

```bash
git fetch origin <head-branch>
git worktree add ../esphome-media-player-<short-topic> \
  -b <local-pr-branch> origin/<head-branch>
```

For a forked PR, do not assume the head branch exists on `origin`. Check out
the PR ref in the new worktree, or fetch from the reported fork when pushing
back to it is allowed:

```bash
git worktree add ../esphome-media-player-pr-<number> --detach
cd ../esphome-media-player-pr-<number>
gh pr checkout <number>
```

Before editing, check for local changes:

```bash
git status --short --branch
```

Do not overwrite or revert unrelated user changes.

### 3. Collect Unresolved Feedback

Collect unresolved review threads, requested changes, and ordinary PR comments.
Use thread-level data whenever possible so resolved feedback is not repeated.

With `gh`, use GraphQL for review threads:

```bash
gh api graphql -f owner='{owner}' -f name='{repo}' -F number=<pr-number> -f query='
query($owner:String!, $name:String!, $number:Int!) {
  repository(owner:$owner, name:$name) {
    pullRequest(number:$number) {
      reviewDecision
      reviewThreads(first:100) {
        nodes {
          id
          isResolved
          path
          line
          startLine
          comments(first:20) {
            nodes {
              author { login }
              body
              createdAt
              url
            }
          }
        }
      }
      comments(first:50) {
        nodes {
          author { login }
          body
          createdAt
          url
        }
      }
    }
  }
}'
```

Summarize each actionable item in plain language before editing. Ignore already
resolved threads unless later comments clearly reopen the same issue.

### 4. Make the Requested Changes

For each actionable item:

- Read the relevant file and surrounding code before editing.
- Make the smallest change that fully addresses the feedback.
- Preserve existing project patterns and user-facing behavior unless the
  feedback explicitly asks for a behavior change.
- If feedback is unclear, infer cautiously from the code and comment context.
  Ask the user only when the requested change could go in materially different
  directions.
- Do not make unrelated cleanups while addressing review feedback.

If a comment is not actionable or should not be implemented, leave it
unresolved and explain why in the final update.

### 5. Check the Change

Run focused checks based on the touched files. For changes to docs, scripts,
generated webserver output, release checks, or package dependencies, run:

```bash
npm run check:all
```

For firmware changes, compile the affected device config in `builds/`. For
shared changes under `common/`, `components/`, or release tooling, use the
`compile` skill to compile all supported device configs when practical. State
exactly what was not verified if hardware or full compilation is unavailable.

### 6. Commit and Push

This repository expects branch changes to be committed and pushed.

```bash
git status --short
git add <changed-files>
git commit -m "<short, human branch update summary>"
git push
```

Do not include "Codex" in branch names, commit subjects, or PR titles.

### 7. Resolve Addressed Feedback

After the fix is committed and pushed, resolve only the review thread IDs that
were actually addressed. Do not resolve broad comments, unresolved decisions,
or feedback you intentionally did not implement.

With `gh` GraphQL:

```bash
gh api graphql -f threadId='<review-thread-id>' -f query='
mutation($threadId:ID!) {
  resolveReviewThread(input:{threadId:$threadId}) {
    thread { id isResolved }
  }
}'
```

If a thread cannot be resolved because of permissions or API limits, say so and
include the comment URL so the user can resolve it manually.

### 8. Final Update

Keep the final message approachable and concise:

```text
Addressed PR #<number>: <title>

Changed:
- <plain-English summary>

Resolved feedback:
- <comment/topic>

Left open:
- <only if any, with reason>

Checks:
- <command>: <pass/fail/skipped and why>

Pushed branch: <branch>
PR: <url>
```
