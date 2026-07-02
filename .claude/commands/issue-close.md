---
description: Comment the completed work on a GitHub issue and close it
argument-hint: <issue URL>
---

# Issue Close

Update a GitHub issue with the work completed in this conversation and close it.

Usage: `/issue-close <github-issue-url>`

## Steps

### 1. Parse the issue URL

Extract `owner`, `repo`, and `issue-number` from the URL.

### 2. Fetch the current issue state

Run `gh issue view <issue-number> --repo <owner>/<repo> --json title,body,state,labels,comments` and confirm the issue is still open. If it is already closed, report that and stop.

### 3. Summarize the work done

Review the current conversation to produce a concise comment body covering:

- **What was done** — a short description of the fix or implementation (1–3 sentences).
- **Files changed** — list each file that was modified, added, or deleted.
- **How to verify** — one sentence describing how to confirm the change works (e.g., the route to visit, the action to perform, or the test to run).

Keep the tone factual and brief. Do not pad with filler phrases.

### 4. Post the comment

Run:

```
gh issue comment <issue-number> --repo <owner>/<repo> --body "<summary>"
```

Use a heredoc or quoted multiline string so formatting is preserved.

### 5. Close the issue

Run:

```
gh issue close <issue-number> --repo <owner>/<repo> --reason completed
```

Use `--reason "not planned"` instead if the conversation shows the work was abandoned or the issue was rejected rather than done.

### 6. Confirm

Report back:

- **Issue closed:** title and URL
- **Comment posted:** first line of the comment for quick confirmation
