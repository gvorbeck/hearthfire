# Code Audit — Stonetop Party Tracker

**Date:** 2026-05-22
**Grade: B−**

The fundamentals are solid. TypeScript coverage is strong, CSS Modules discipline is tight, and style rules are followed consistently across the board. The accessibility effort is genuine. But there are real correctness and data safety issues that would bite in production.

---

## Critical — Fix Before Real Users

### 1. Race condition in character updates

**File:** `src/hooks/useGame.ts`

Every character mutation — `removeCharacter`, `updateCharacterName`, `updateCharacterData` — reads `gameRef.current` and rewrites the full characters array. Two concurrent writes in the same tick means last write wins and the other change is silently discarded.

This is a **known bug**. The code comments acknowledge it. It hasn't been fixed.

**Fix:** Move to per-character Firestore writes using dot-notation paths (`characters.0.name`) or restructure characters as a sub-collection so writes don't collide.

---

### 2. Unsafe type cast bypasses the compiler

**File:** `src/hooks/useGame.ts:38`

```ts
setGame({ ...raw, characters, id: snapshot.id } as unknown as GameSession);
```

`as unknown as T` is a full escape hatch — it tells TypeScript to trust you unconditionally. This exists because the Firestore data shape doesn't actually match `GameSession`. If a document is malformed or a field type has drifted, you won't find out until a runtime crash in a user session.

**Fix:** Validate the Firestore response shape before casting. Use a runtime validator (Zod, io-ts, or a hand-rolled guard) and fail explicitly on bad data rather than silently coercing it.

---

### 3. Save failures are invisible to users

**File:** Multiple — `src/components/CharacterSheet/sections/Moves.tsx` and others

`.catch()` blocks silently roll back local state. The user's input reverts with no explanation. The `error` state in `useGame.ts` is set but never surfaced anywhere in the UI.

This is a multi-player tool where data matters. Users need to know when a save fails.

**Fix:** At minimum, `console.error` on failure. Better: a dismissible error banner or toast that tells the user their change didn't save and to try again.

---

## High — Address Soon

### 4. No error boundary in App.tsx

**File:** `src/App.tsx`

`<Suspense fallback={null}>` wraps all lazy routes. If any route throws, the app goes blank with no recovery path and no message to the user.

**Fix:** Wrap lazy routes in an `<ErrorBoundary>` with a fallback UI.

---

### 5. RangerAnimalCompanion.tsx is 689 lines

**File:** `src/components/CharacterSheet/playbooks/ranger/RangerAnimalCompanion.tsx`

Type selection, HP/armor display, instinct, cost, loyalty, and beast of legend are all in one file. This isn't a premature abstraction problem — it's the opposite. It's too big to reason about safely and too large to modify without risk of breakage.

**Fix:** Extract distinct concerns into sub-components: `AnimalTypeSelector`, `AnimalStats`, `AnimalInstinct`, etc. Each should be independently readable.

---

### 6. Three different debouncing patterns

The codebase has:

- `useDebouncedSave` — simple, stateless, single string
- `useDebouncedAnswers` — uses `useLayoutEffect` for ref sync (unusual, suggests timing concerns)
- Inline debounce logic in individual components (`Stats`, `Background`)

Having three patterns means three places to find bugs and three behaviors to keep in sync.

**Fix:** Pick one pattern and consolidate. The `useLayoutEffect` in `useDebouncedAnswers` warrants a comment explaining why it's not `useEffect`.

---

## Low — Polish

### 7. Unnecessary memo/useCallback on leaf components

**Files:** `src/components/CharacterSheet/sections/Stats.tsx`, `Inventory.tsx`

Small presentational components (`StatBox`, `InfoBox`, `DebilityRow`) are all wrapped in `memo()` with `useCallback` for every handler. Without profiling data showing these re-renders are a problem, this adds noise without benefit. React 18's auto-batching makes this even less necessary.

**Fix:** Remove unless you have profiling evidence. Re-add if you do.

---

### 8. aria-label uses a question instead of a label

**File:** `src/components/CharacterSheet/playbooks/revenant/RevenantInsert.tsx:330`

```tsx
aria-label={opt.namePrompt}  // "Name the person or persons…"
```

Screen readers announce `aria-label` as the field's name. A question reads strangely in that context.

**Fix:** Use a short, descriptive label ("Purpose name") and move the prompt text to `aria-describedby` if it needs to be associated.

---

## What's Working Well

- TypeScript coverage is strong with minimal `any` usage
- CSS token discipline (`--text-xs` through `--text-3xl`) is consistent across all components
- `resolvePlaybookFeatures()` validates untrusted Firestore data defensively
- Accessibility has genuine effort — `aria-label`, role attributes, modal focus trapping are all present
- Arrow functions, clsx hoisting, and stated style rules are followed across the board
- Separation of concerns is clean: game state in hooks, UI in components, data in lib

---

## Priority Order

| Priority | Issue                                                                | File                                              |
| -------- | -------------------------------------------------------------------- | ------------------------------------------------- |
| P0       | Race condition — character updates can silently overwrite each other | `src/hooks/useGame.ts`                            |
| P0       | `as unknown as GameSession` — compiler is being lied to              | `src/hooks/useGame.ts:38`                         |
| P1       | Save errors are invisible to users                                   | Multiple                                          |
| P1       | No error boundary — app goes blank on route throw                    | `src/App.tsx`                                     |
| P2       | RangerAnimalCompanion is 689 lines                                   | `src/components/CharacterSheet/playbooks/ranger/` |
| P2       | Three debouncing patterns — pick one                                 | Multiple                                          |
| P3       | Unnecessary memo on leaf components                                  | `Stats.tsx`, `Inventory.tsx`                      |
| P3       | aria-label uses question format                                      | `RevenantInsert.tsx:330`                          |

---

# Sample Prompt

Let's looks at all nine of the playbooks: Blessed, Fox, Heavy, Lightbearer, Judge, Marshal, Ranger, Would-be Hero. These all have been developed and exist in our application.

Now that they all exist, I want to see if there are any major refactor opportunities, DRY violations, strategy improvements, best practices missed, accessibility improvements, SEO improvements, bugs, etc.

There should also be quality of life improvements looked at. Design improvements. Little touches and flourishes.

Look up any and all game concepts in the game rulebook: /Users/garrett.vorbeck/Sites/stonetop/docs/Stonetop (Book 1).txt

Make use of any primitive components in /Users/garrett.vorbeck/Sites/stonetop/src/components/primitives

Develop this with an eye towards establish patterns, react best practices, accessibility, a conservative firestore read/write process, DRY policies, current coding standards, lean elegant code. Ask questions, don't make assumptions.
