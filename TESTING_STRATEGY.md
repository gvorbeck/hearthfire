# Testing Strategy

Low-scrutiny app, low-overhead strategy. TypeScript strict mode covers most data-shape correctness; tests cover the paths where a silent runtime bug would hurt a user mid-session.

## Packages

Add to `devDependencies`:

| Package | Purpose |
|---|---|
| `vitest` | Test runner — native Vite integration, zero config |
| `@vitest/ui` | Local test UI (optional) |
| `@testing-library/react` | Component rendering |
| `@testing-library/user-event` | User interaction simulation |
| `@testing-library/jest-dom` | DOM matchers (`toBeInTheDocument`, etc.) |
| `jsdom` | Browser environment for Vitest |
| `msw` | Mock Firestore at the network level for integration tests |

No Playwright — the app is too simple and low-scrutiny to justify e2e overhead.

## File Organization

Co-locate tests with the code they cover in `__tests__/` subdirectories.

```
src/
  lib/
    __tests__/
      parseMarkdown.test.tsx
      resolvePlaybookFeatures.test.ts
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

## Tests (~12 total)

### `parseMarkdown.test.tsx` — 3 tests (pure logic, no mocks)

- `**bold**` renders a `<strong>` element
- `*italic*` renders an `<em>` element
- `on a 10+` auto-bolds without explicit markers

### `resolvePlaybookFeatures.test.ts` — 3 tests (pure logic)

- Returns `{}` when `data` is `undefined`
- Returns `{}` when `playbookFeatures` is a non-object (`null`, `"string"`, array) — the corrupt-doc guard
- Returns only valid scalar/object/array values, dropping `null`/`undefined` keys

### `CharacterPlaybook.test.tsx` — 3 tests (component integration, Firestore mocked via MSW)

- Renders the character name from Firestore data
- Navigating between tabs shows the correct section content
- Checking a move checkbox fires `updateDoc` with the correct field path

### `Home.test.tsx` — 2 tests

- "Create a game" button calls `createGame` and redirects to `/game/:id`
- Submitting a game ID in the join field navigates to `/game/:id`

### `CharacterSheet.test.tsx` — 1–2 tests

- A `blessed` character renders Blessed-specific section overrides, not generic sections
- Stat values render correctly from character data

## What this skips (intentionally)

- **Static move/stat data** — TypeScript catches shape errors; asserting array contents has low value and goes stale when content is added
- **CSS/visual rendering** — not testable at this layer
- **GM playbook** — read-only display, no user-writable state
- **Most playbook-specific UI variations** — too many permutations, too low value for a low-traffic app
