---
description: Repo-wide sweep for type-scale, semantic-color, and inline-style violations
allowed-tools: Read, Grep, Glob, Bash(grep:*), Bash(git ls-files:*)
---

# CSS Audit

**Read-only — report findings, do not edit.** Sweep the whole repo, not just the diff — this catches legacy violations that `/code-review` can't see because they predate the current change.

## Checks

Run each check over `src/**/*.module.css` (check 3 over `src/**/*.tsx`), then read the surrounding rule to confirm every hit before reporting it.

### 1. Raw font sizes

Every `font-size` must use a type-scale token from `src/index.css`: `--text-2xs`, `--text-xs`, `--text-sm`, `--text-md`, `--text-lg`, `--text-xl`, `--text-2xl`, `--text-3xl`, or the one-offs `--text-display` / `--text-hero`.

- Find: `font-size` declarations whose value is not `var(--text-…)`.
- Allowed exception: responsive `clamp()` display sizes. Raw `rem`/`px`/`em` font sizes are violations. (Raw values for layout — width, height, spacing — are fine and out of scope.)
- Suggest the closest token by pixel value; if no token is close, say so explicitly so the scale gap is a conscious decision rather than a silent drift.

### 2. Raw palette tokens or literals in `color:`

Every `color:` declaration must use a theme-aware semantic token: `--text-primary`, `--text-secondary`, `--text-tertiary`, `--text-accent`, `--text-accent-strong`, or `--text-heading`. Raw `--color-stone-*` / `--color-gold-*` / `--color-navy-*` values, hex literals, and named colors don't flip between dark and light mode, so the text becomes unreadable in one theme.

- This rule is `color:` only — raw palette tokens on `background`, `background-color`, `border`, `outline`, `fill`, etc. are correct. Watch that a grep for `color:` doesn't sweep in `background-color:` hits.
- `src/index.css` is exempt — it's where the semantic tokens are defined from palette tokens.

### 3. Inline styles in components

`style={` props in `.tsx` files — all styling belongs in CSS Modules.

- Allowed exception: a genuinely dynamic value CSS can't express (e.g. a width computed from data), which should set a single CSS custom property (`style={{ '--x': value }}`) consumed by the module, not full declarations.

## Output

```
Verdict: Clean | N violations across M files

### Raw font sizes
1. `file.module.css:12` — `font-size: 0.875rem` → `var(--text-sm)` (0.8125rem, closest)

### Raw color values
2. ...

### Inline styles
3. ...
```

One line per finding with the concrete replacement. Number sequentially across groups, skip empty groups, no preamble or closing commentary. If everything is clean, the verdict line is the entire output.
