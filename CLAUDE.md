# Stonetop Party Tracker (Hearthfire)

A digital companion for the Stonetop TTRPG — game session management, GM playbook, and per-character sheets. Built with Vite + React + TypeScript, backed by Firebase Firestore. No auth; games are accessed by a shared ID stored in the URL.

## Tech Stack

- **Vite** — dev server (`npm run dev`) and build (`npm run build`)
- **React 18** with lazy-loaded page routes
- **TypeScript** — strict mode
- **Firebase Firestore** — real-time persistence; config via `.env` (see `.env.example`)
- **CSS Modules** — all component styles are co-located `.module.css` files
- **clsx** — conditional class merging; import and hoist at top of file
- **react-router-dom v6** — path-param routing (`/game/:id`, `/game/:id/gm`, `/game/:id/:playbook`)

## Project Structure

```
src/
  App.tsx                  # Route definitions
  types/index.ts           # All shared types (GameSession, Character, CharacterData, PlaybookType)
  lib/                     # Firebase client, game mutations, move definitions
    firebase.ts            # Firestore db export
    game.ts                # createGame and other Firestore writes
    constants.ts           # Collection names, etc.
    basicMoves.ts          # Basic move definitions
    playbookMoves.ts       # Per-playbook move definitions
    followerMoves.ts / homefrontMoves.ts / expeditionMoves.ts / specialMoves.ts / customMoves.ts
  hooks/
    useGame.ts             # Real-time Firestore subscription for a GameSession
    useDebouncedSave.ts    # Debounced Firestore writes
  pages/
    Home/                  # Landing page — create or join a game
    Game/                  # Party overview for a game session
    GmPlaybook/            # GM reference playbook
    CharacterPlaybook/     # Per-character sheet with tabbed sections
  components/
    primitives/            # Design-system atoms — ALWAYS check here before creating new UI
      Button, Checkbox, Collapse, Dropdown, Heading, Icon, Input, Modal, Radio,
      RuleDivider, ScrollToTop, Stack, Tabs, Text
    CharacterSheet/        # Character sheet sections and playbook-specific overrides
      Move/                # Move component (with body icons, citation, collapse)
      sections/            # Moves, CharacterStats, Appearance, Background, Instinct, etc.
      playbooks/blessed/   # Blessed-specific overrides for each section
    Playbook/              # GM playbook layout primitives (PlaybookCallout, PlaybookTable, etc.)
    PageHeader, Breadcrumb, AddCharacterModal, GameGuard, GameIdModal, PageMeta
```

## Code Style

- **Arrow functions only** — no `function` declarations
- **CSS Modules** — no inline styles, no global class names
- **clsx** — import at top of file; hoist className logic above JSX
- **No comments** unless the _why_ is non-obvious (hidden constraint, workaround, subtle invariant)
- **No invented game content** — never fabricate moves, stats, or TTRPG data; leave arrays empty for the user to fill
- **No premature abstractions** — three similar lines beats an early helper

## Playbook Types

`PlaybookType` in `src/types/index.ts`: `blessed`, `fox`, `heavy`, `judge`, `lightbearer`, `marshal`, `ranger`, `seeker`, `would-be-hero`

## Environment Variables

Firebase config is read from Vite env vars. Required keys:

```
VITE_FIREBASE_API_KEY
VITE_FIREBASE_AUTH_DOMAIN
VITE_FIREBASE_PROJECT_ID
VITE_FIREBASE_STORAGE_BUCKET
VITE_FIREBASE_MESSAGING_SENDER_ID
VITE_FIREBASE_APP_ID
```

# CLAUDE.md — 11-rule template

These rules apply to every task in this project unless explicitly overridden.
Bias: caution over speed on non-trivial work.

## Rule 1 — Think Before Coding

State assumptions explicitly. Ask rather than guess.
Push back when a simpler approach exists. Stop when confused.

## Rule 2 — Simplicity First

Minimum code that solves the problem. Nothing speculative.
No abstractions for single-use code.

## Rule 3 — Surgical Changes

Touch only what you must. Don't improve adjacent code.
Match existing style. Don't refactor what isn't broken.

## Rule 4 — Goal-Driven Execution

Define success criteria. Loop until verified.
Strong success criteria let Claude loop independently.

## Rule 5 — Use the model only for judgment calls

Use for: classification, drafting, summarization, extraction.
Do NOT use for: routing, retries, deterministic transforms.
If code can answer, code answers.

## Rule 6 — Surface conflicts, don't average them

If two patterns contradict, pick one (more recent / more tested).
Explain why. Flag the other for cleanup.

## Rule 7 — Read before you write

Before adding code, read exports, immediate callers, shared utilities.
If unsure why existing code is structured a certain way, ask.

## Rule 8 — Tests verify intent, not just behavior

Tests must encode WHY behavior matters, not just WHAT it does.
A test that can't fail when business logic changes is wrong.

## Rule 9 — Checkpoint after every significant step

Summarize what was done, what's verified, what's left.
Don't continue from a state you can't describe back.

## Rule 10 — Match the codebase's conventions, even if you disagree

Conformance > taste inside the codebase.
If you think a convention is harmful, surface it. Don't fork silently.

## Rule 11 — Fail loud

"Completed" is wrong if anything was skipped silently.
"Tests pass" is wrong if any were skipped.
Default to surfacing uncertainty, not hiding it.
