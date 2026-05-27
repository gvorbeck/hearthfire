# Testing Strategy

Low-scrutiny app, low-overhead strategy. TypeScript strict mode covers most data-shape correctness; tests cover the paths where a silent runtime bug would hurt a user mid-session.

## Packages

Add to `devDependencies`:

| Package | Purpose |
|---|---|
| `vitest` | Test runner — native Vite integration, zero config |
| `@vitest/ui` | Local test UI (optional) |
| `@testing-library/react` | Component rendering and `renderHook` |
| `@testing-library/user-event` | User interaction simulation |
| `@testing-library/jest-dom` | DOM matchers (`toBeInTheDocument`, etc.) |
| `jsdom` | Browser environment for Vitest |

Use `vi.mock('firebase/firestore', ...)` to mock Firestore — MSW intercepts HTTP and won't cleanly intercept Firestore's WebSocket/gRPC transport.

No Playwright — the app is too simple and low-scrutiny to justify e2e overhead.

## File Organization

Co-locate tests with the code they cover in `__tests__/` subdirectories.

```
src/
  lib/
    __tests__/
      parseMarkdown.test.tsx
      resolvePlaybookFeatures.test.ts
      useGame.test.ts
  hooks/
    __tests__/
      useDebouncedSave.test.ts
  components/
    CharacterSheet/
      __tests__/
        CharacterSheet.test.tsx
  pages/
    Home/
      __tests__/
        Home.test.tsx
    CharacterPlaybook/
      __tests__/
        CharacterPlaybook.test.tsx
```

## Tests (~15 total)

### `parseMarkdown.test.tsx` — 3 tests (pure logic, no mocks)

- `**bold**` renders a `<strong>` element
- `*italic*` renders an `<em>` element
- `on a 10+` auto-bolds without explicit markers

### `resolvePlaybookFeatures.test.ts` — 3 tests (pure logic)

- Returns `{}` when `data` is `undefined`
- Returns `{}` when `playbookFeatures` is a non-object (`null`, `"string"`, array) — the corrupt-doc guard
- Returns only valid scalar/object/array values, dropping `null`/`undefined` keys

### `useGame.test.ts` — 3 tests (pure logic, Firestore mocked via `vi.mock`)

These target the exported parse helpers, which run on every snapshot and silently corrupt sessions if wrong.

- `parseCharacters` filters out null/undefined character entries
- `parseSteading` falls back to a valid default when the size enum value is unrecognized
- `parseContent` handles a missing field without throwing

### `useDebouncedSave.test.ts` — 2 tests (hook, fake timers via `vi.useFakeTimers`)

This hook is used by every character sheet input; a bug here silently drops user edits.

- Debounced save is not called until the delay elapses
- Rapid calls with the same value don't fire the callback twice (JSON.stringify de-dup)

### `CharacterPlaybook.test.tsx` — 1 test (component smoke test, Firestore mocked via `vi.mock`)

- Renders without crashing given a valid game document

### `Home.test.tsx` — 2 tests

- "Create a game" button calls `createGame` and redirects to `/game/:id`
- Submitting a game ID in the join field navigates to `/game/:id`

### `CharacterSheet.test.tsx` — 1 test

- A `blessed` character renders Blessed-specific section overrides, not generic sections

## What this skips (intentionally)

- **Static move/stat data** — TypeScript catches shape errors; asserting array contents has low value and goes stale when content is added
- **CSS/visual rendering** — not testable at this layer
- **GM playbook** — read-only display, no user-writable state
- **Most playbook-specific UI variations** — too many permutations, too low value for a low-traffic app
- **Tab navigation and checkbox→updateDoc wiring** — covered more cheaply by `useGame` unit tests; full component integration tests carry high setup cost for low additional signal
