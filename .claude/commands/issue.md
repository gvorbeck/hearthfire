# Issue Fixer

Fix a GitHub issue end-to-end: fetch it, validate it, implement a fix, then run a code review.

Usage: `/issue <github-issue-url>`

## Steps

### 1. Fetch the issue

Use `gh issue view <issue-number> --repo <owner>/<repo> --json title,body,state,labels,comments` to read the issue. Parse the URL to extract `owner`, `repo`, and `issue-number`.

### 2. Validate the issue

Reject with a clear explanation and stop if any of the following are true:

- The issue is already closed (`state` is not `open`).
- The issue body is empty or too vague to act on (no reproduction steps, no clear expected vs actual behavior, no acceptance criteria).
- The issue describes a feature request with no concrete spec — label includes `enhancement` or `feature` and the body contains no implementation detail.
- The issue is out of scope for this codebase (e.g., it references files, routes, or systems that do not exist in this repo).

If valid, briefly summarize the issue in one sentence: what is broken and where.

### 3. Investigate

Read the relevant source files. Trace the bug or requirement to the specific lines responsible. Do not guess — if you cannot locate the cause after reading the obvious files, say so and stop.

### 4. Fix

Apply the minimal change that resolves the issue. Follow all project conventions from CLAUDE.md. Do not refactor surrounding code, add features, or make speculative improvements.

### 5. Verify

After editing, confirm the fix addresses the exact failure described. If the project has tests covering the affected area, run them with `npm test -- --run` and confirm they pass.

### 6. Run code review

Run the `/code-review` command to surface any issues introduced by the fix.

### 7. Report

Output a short summary:

- **Issue:** one-sentence description
- **Root cause:** one sentence
- **Fix:** what was changed and in which file(s)
- **Code review:** findings count by severity, or "No findings"
