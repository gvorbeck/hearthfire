# Code Audit — Stonetop Party Tracker

**Date:** 2026-05-22
**Grade: B−**

The fundamentals are solid. TypeScript coverage is strong, CSS Modules discipline is tight, and style rules are followed consistently across the board. The accessibility effort is genuine. But there are real correctness and data safety issues that would bite in production.

---

## Critical — Fix Before Real Users

### ~~1. Race condition in character updates~~

~~**File:** `src/hooks/useGame.ts`~~

~~Every character mutation — `removeCharacter`, `updateCharacterName`, `updateCharacterData` — reads `gameRef.current` and rewrites the full characters array. Two concurrent writes in the same tick means last write wins and the other change is silently discarded.~~

~~This is a **known bug**. The code comments acknowledge it. It hasn't been fixed.~~

~~**Fix:** Move to per-character Firestore writes using dot-notation paths (`characters.0.name`) or restructure characters as a sub-collection so writes don't collide.~~

**Resolved:** All three mutations now use `runTransaction` — they read live Firestore state inside the transaction before writing, so concurrent saves can never clobber each other.

---

### ~~2. Unsafe type cast bypasses the compiler~~

~~**File:** `src/hooks/useGame.ts:38`~~

~~`as unknown as T` is a full escape hatch — it tells TypeScript to trust you unconditionally. This exists because the Firestore data shape doesn't actually match `GameSession`. If a document is malformed or a field type has drifted, you won't find out until a runtime crash in a user session.~~

**Resolved:** `parseGameSession` and `parseContent` now validate every field before constructing the typed object. Bad data throws with a clear message, caught by a `try/catch` that routes the error to the UI. No casts remain except the honest `snapshot.data() as Record<string, unknown>`.

---

### ~~3. Save failures are invisible to users~~

~~**File:** Multiple — `src/components/CharacterSheet/sections/Moves.tsx` and others~~

~~`.catch()` blocks silently roll back local state. The user's input reverts with no explanation. The `error` state in `useGame.ts` is set but never surfaced anywhere in the UI.~~

~~This is a multi-player tool where data matters. Users need to know when a save fails.~~

~~**Fix:** At minimum, `console.error` on failure. Better: a dismissible error banner or toast that tells the user their change didn't save and to try again.~~

**Resolved:** `ToastProvider` is wired into `App.tsx` and all save `.catch()` blocks now call `addToast(...)` with a user-visible error message.

---

## High — Address Soon

### ~~4. No error boundary in App.tsx~~

~~**File:** `src/App.tsx`~~

~~`<Suspense fallback={null}>` wraps all lazy routes. If any route throws, the app goes blank with no recovery path and no message to the user.~~

~~**Fix:** Wrap lazy routes in an `<ErrorBoundary>` with a fallback UI.~~

**Resolved:** `ErrorBoundary` added as a primitive (`src/components/primitives/ErrorBoundary/`) and wraps `<Suspense>` in `App.tsx`. Uses `Stack` + `Text` primitives, arrow-function class methods, and a `role="alert"` live region.

---

### ~~5. RangerAnimalCompanion.tsx is 689 lines~~

~~**File:** `src/components/CharacterSheet/playbooks/ranger/RangerAnimalCompanion.tsx`~~

~~Type selection, HP/armor display, instinct, cost, loyalty, and beast of legend are all in one file. This isn't a premature abstraction problem — it's the opposite. It's too big to reason about safely and too large to modify without risk of breakage.~~

~~**Fix:** Extract distinct concerns into sub-components: `AnimalTypeSelector`, `AnimalStats`, `AnimalInstinct`, etc. Each should be independently readable.~~

**Resolved:** Split into `AnimalStats`, `AnimalType`, `AnimalInstinct`, `AnimalCost`, and `BeastOfLegend` sub-components. `RangerAnimalCompanion` is now a thin composer holding all state and handlers.

---

### ~~6. Three different debouncing patterns~~

~~The codebase has:~~

~~- `useDebouncedSave` — simple, stateless, single string~~
~~- `useDebouncedAnswers` — uses `useLayoutEffect` for ref sync (unusual, suggests timing concerns)~~
~~- Inline debounce logic in individual components (`Stats`, `Background`)~~

~~Having three patterns means three places to find bugs and three behaviors to keep in sync.~~

~~**Fix:** Pick one pattern and consolidate. The `useLayoutEffect` in `useDebouncedAnswers` warrants a comment explaining why it's not `useEffect`.~~

**Resolved:** `useDebouncedSave` generalized to `<T>` and is now the single debouncing pattern. `useDebouncedAnswers` deleted. Inline debounce removed from `Stats.tsx` and `Background.tsx`.

---

## Low — Polish

### ~~7. Unnecessary memo/useCallback on leaf components~~

~~**Files:** `src/components/CharacterSheet/sections/Stats.tsx`, `Inventory.tsx`~~

~~Small presentational components (`StatBox`, `InfoBox`, `DebilityRow`) are all wrapped in `memo()` with `useCallback` for every handler. Without profiling data showing these re-renders are a problem, this adds noise without benefit. React 18's auto-batching makes this even less necessary.~~

~~**Fix:** Remove unless you have profiling evidence. Re-add if you do.~~

**Resolved:** `memo()` removed from all leaf sub-components in both files. `useCallback` removed from sub-component handlers and from all parent-level handlers in `Inventory.tsx` (none had `memo` children to serve). Parent `useCallback`s in `Stats.tsx` retained — `savePayload` provides the stable reference `useDebouncedSave` needs on mount.

---

### ~~8. aria-label uses a question instead of a label~~

~~**File:** `src/components/CharacterSheet/playbooks/revenant/RevenantInsert.tsx:330`~~

```tsx
aria-label={opt.namePrompt}  // "Name the person or persons…"
```

~~Screen readers announce `aria-label` as the field's name. A question reads strangely in that context.~~

~~**Fix:** Use a short, descriptive label ("Purpose name") and move the prompt text to `aria-describedby` if it needs to be associated.~~

**Resolved:** The `namePrompt` pattern no longer exists in `RevenantInsert.tsx` — the file was refactored and the offending `aria-label` usage is gone.

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
| ~~P0~~   | ~~Race condition — character updates can silently overwrite each other~~ | ~~`src/hooks/useGame.ts`~~                    |
| ~~P0~~   | ~~`as unknown as GameSession` — compiler is being lied to~~          | ~~`src/hooks/useGame.ts:38`~~                     |
| ~~P1~~   | ~~Save errors are invisible to users~~                               | ~~Multiple~~                                      |
| ~~P1~~   | ~~No error boundary — app goes blank on route throw~~                | ~~`src/App.tsx`~~                                 |
| ~~P2~~   | ~~RangerAnimalCompanion is 689 lines~~                               | ~~`src/components/CharacterSheet/playbooks/ranger/`~~ |
| ~~P2~~   | ~~Three debouncing patterns — pick one~~                             | ~~Multiple~~                                      |
| ~~P3~~   | ~~Unnecessary memo on leaf components~~                              | ~~`Stats.tsx`, `Inventory.tsx`~~                  |
| ~~P3~~   | ~~aria-label uses question format~~                                  | ~~`RevenantInsert.tsx:330`~~                      |

---

# Round 2 Audit — 2026-05-25

**Grade: A−**

Every item from the B− audit is resolved. The remaining gap to A+ is three real issues plus one refactor opportunity. Nothing here is cosmetic — each one is a concrete correctness or accessibility problem.

---

## High — Address Soon

### 1. `Input` has no keyboard focus indicator

**File:** `src/components/primitives/Input/Input.module.css:17,28`

```css
outline: none;       /* line 17 — kills the browser default */

.input:focus {       /* line 28 — fires on mouse clicks too */
  border-color: var(--color-gold-500);
  background-color: var(--surface-overlay);
}
```

`outline: none` removes the browser's default focus ring unconditionally. The `:focus` rule fires on mouse clicks as well as keyboard, so it isn't a replacement — it's just a border tint. A keyboard user tabbing into a text field gets no visible indicator that it's focused.

Every other interactive primitive in the codebase (`Checkbox`, `Radio`, `Toggle`, `Tabs`, `UseDots`) uses `:focus-visible` correctly. `Input` is the exception.

**Fix:** Replace `:focus` with `:focus-visible` and restore an outline:

```css
.input:focus-visible {
  outline: 2px solid var(--color-gold-400);
  outline-offset: 2px;
  border-color: var(--color-gold-500);
  background-color: var(--surface-overlay);
}
```

---

### 2. `Button` has no keyboard focus indicator

**File:** `src/components/primitives/Button/Button.module.css`

No `:focus` or `:focus-visible` rule exists anywhere in the file. The browser default outline is not suppressed here, so most browsers will show *something*, but it will be inconsistent (browser-default blue ring on a dark themed UI) and not match the design system. More importantly, it's an accident — if `outline: none` is ever added globally or to a parent, `Button` becomes inaccessible silently.

**Fix:** Add an explicit `:focus-visible` rule consistent with the rest of the primitives:

```css
.base:focus-visible {
  outline: 2px solid var(--color-gold-400);
  outline-offset: 2px;
}
```

---

## Medium — Address Before Next Review

### 3. Save calls in `MarshalCrew` and `FollowersInsert` have no error handling

**Files:** `src/components/CharacterSheet/playbooks/marshal/MarshalCrew.tsx`, `src/components/CharacterSheet/playbooks/followers/FollowersInsert.tsx`

Every `saveImmediate` and `saveDebounced` call in these two files is fire-and-forget. Representative examples:

```ts
// MarshalCrew.tsx — 20+ instances like this:
saveImmediate({ crewTags: next });
saveDebounced({ crewHp: val });

// FollowersInsert.tsx:
saveImmediate({ followers: next });
saveDebounced({ followers: next });
```

All other sections that were fixed in round 1 (`Moves`, `Background`, `Appearance`, `Introductions`, `PlaceOfOrigin`, `useConsequenceCheckboxes`) use the pattern:

```ts
saveImmediate({ ... }).catch(() => { setPrev(prev); addToast('Failed to save.'); });
```

Marshal Crew and Followers are two of the most data-heavy sheets. A silent save failure here means a player loses crew HP, loyalty, or follower state with no indication.

**Fix:** Add `.catch()` with state rollback and `addToast` to every `saveImmediate`/`saveDebounced` call in both files. The pattern is already established — it just hasn't been applied here.

---

## Low — Polish

### 4. Instinct/Cost radio-with-custom is duplicated across Ranger and Marshal

**Files:** `src/components/CharacterSheet/playbooks/ranger/AnimalInstinct.tsx`, `src/components/CharacterSheet/playbooks/ranger/AnimalCost.tsx`, `src/components/CharacterSheet/playbooks/marshal/MarshalCrew.tsx:332–372`

The pattern — preset radio options plus a "custom" radio that reveals a freetext input, collapsing on selection — is implemented identically in both playbooks. The handler logic in `RangerAnimalCompanion.tsx` and `MarshalCrew.tsx` is also structurally identical: `handleXChange`, `handleXCustomFocus`, `handleXCustomChange`, `handleXCustomBlur`, and a collapse effect triggered when the value is first set.

This isn't a premature abstraction candidate — the pattern is already duplicated, fully realized, across two production components. A bug in the collapse logic or the custom-input focus behavior requires two fixes.

**Fix:** Extract to a shared `RadioWithCustomInput` presentational component (taking `options`, `value`, `customValue`, and the four handlers as props) and a `useRadioWithCustom` hook (encapsulating the state and handlers). The Ranger and Marshal components become thin consumers. The `AnimalInstinct` and `AnimalCost` sub-components already have the right shape — the hook just needs to be pulled out of each parent.

---

## Updated Priority Order

| Priority | Issue | File |
| -------- | ----- | ---- |
| ~~P0~~   | ~~Race condition — character updates can silently overwrite each other~~ | ~~`src/hooks/useGame.ts`~~ |
| ~~P0~~   | ~~`as unknown as GameSession` — compiler is being lied to~~ | ~~`src/hooks/useGame.ts:38`~~ |
| ~~P1~~   | ~~Save errors are invisible to users~~ | ~~Multiple~~ |
| ~~P1~~   | ~~No error boundary — app goes blank on route throw~~ | ~~`src/App.tsx`~~ |
| ~~P2~~   | ~~RangerAnimalCompanion is 689 lines~~ | ~~`src/components/CharacterSheet/playbooks/ranger/`~~ |
| ~~P2~~   | ~~Three debouncing patterns — pick one~~ | ~~Multiple~~ |
| ~~P3~~   | ~~Unnecessary memo on leaf components~~ | ~~`Stats.tsx`, `Inventory.tsx`~~ |
| ~~P3~~   | ~~aria-label uses question format~~ | ~~`RevenantInsert.tsx:330`~~ |
| P1 | `Input` has no keyboard focus indicator | `src/components/primitives/Input/Input.module.css` |
| P1 | `Button` has no keyboard focus indicator | `src/components/primitives/Button/Button.module.css` |
| P2 | Marshal/Followers save calls have no error handling | `MarshalCrew.tsx`, `FollowersInsert.tsx` |
| P3 | Instinct/Cost radio-with-custom pattern is duplicated | `AnimalInstinct.tsx`, `AnimalCost.tsx`, `MarshalCrew.tsx` |

---

# Round 3 Audit — 2026-05-25 — Primitives Accessibility

**Scope:** `src/components/primitives/` only — accessibility audit against WCAG 2.1 AA.

---

## High — Fix Before Real Users

### 1. Button has no `:focus-visible` rule

**File:** `src/components/primitives/Button/Button.module.css`

No `:focus-visible` rule exists on `.base`. The browser default outline is not explicitly suppressed here, but it will be inconsistent on a dark-themed UI and will silently break if a parent ever adds `outline: none`.

**Fix:**
```css
.base:focus-visible {
  outline: 2px solid var(--color-gold-400);
  outline-offset: 2px;
}
```

---

### 2. Collapse trigger has no `:focus-visible` rule

**File:** `src/components/primitives/Collapse/Collapse.module.css`

The `.trigger` button has no `:focus-visible` rule. Keyboard users tabbing to a Collapse header get no visible indicator.

**Fix:**
```css
.trigger:focus-visible {
  outline: 2px solid var(--color-gold-400);
  outline-offset: 2px;
}
```

---

### 3. CheckboxGroup uses no group semantics

**File:** `src/components/primitives/CheckboxGroup/CheckboxGroup.tsx:53`

The container is a plain `<div>` with no `role="group"` and the label `<p>` is not programmatically associated with the checkboxes. Screen readers announce each checkbox without grouping context.

**Fix:** Replace the outer `<div>` with `<fieldset>` and the label `<p>` with `<legend>`.

---

### 4. Radio has no group semantics

**File:** `src/components/primitives/Radio/Radio.tsx`

`Radio` renders standalone `<label>/<input>` pairs with no `<fieldset>`/`<legend>` grouping API. Screen reader users hear each option in isolation without knowing what question the group answers.

**Fix:** Create a `RadioGroup` wrapper that renders `<fieldset>`/`<legend>`, mirroring how `CheckboxGroup` wraps `Checkbox`.

---

### 5. Modal background content is not inert

**File:** `src/components/primitives/Modal/Modal.tsx:80`

The focus trap catches Tab key events, but nothing prevents assistive technology from navigating to background content. Screen reader users can escape the modal without closing it.

**Fix:** Set `aria-hidden="true"` on the app root (or use the `inert` attribute) while the modal is open.

---

### 6. Modal has no required accessible name

**File:** `src/components/primitives/Modal/Modal.tsx:23`

`aria-labelledby` is optional in `ModalProps`. When omitted, the dialog has no accessible name and screen readers announce it as an unlabeled dialog.

**Fix:** Make `aria-labelledby` required, or add a required `aria-label` fallback so every modal instance has a name.

---

### 7. Icon-only Button has no enforced accessible name

**File:** `src/components/primitives/Button/Button.tsx:33`

An icon-only button (no `children`) has no accessible name unless the caller passes `aria-label` via spread. There is no enforcement — callers can omit it silently.

**Fix:** Add a TypeScript overload requiring `aria-label` when `icon` is set and `children` is absent.

---

### 8. Toggle `label` is optional — toggle can be unnamed

**File:** `src/components/primitives/Toggle/Toggle.tsx:15`

`role="switch"` is correct but `label` is optional. A Toggle with no label has no accessible name for screen readers.

**Fix:** Make `label` required in `ToggleProps`, or add a required `aria-label` alternative.

---

## Medium — Address Before Next Review

### 9. Input error message not linked to input via `aria-describedby`

**File:** `src/components/primitives/Input/Input.tsx:47`

The error `<span>` exists but is not associated with the input via `aria-describedby`. Screen reader users filling in the field will not hear the error message when the field is focused.

**Fix:** Add `aria-describedby={error ? \`${resolvedId}-error\` : undefined}` to the input element and `id={\`${resolvedId}-error\`}` to the error span.

---

### 10. Input without `label` prop generates no `id`, breaking external label associations

**File:** `src/components/primitives/Input/Input.tsx:20`

When `label` is omitted, `resolvedId` is `undefined`. Callers providing an external `<label htmlFor="...">` must also pass `id` manually or the association silently breaks. The error element is also dropped on the labelless path.

**Fix:** Always generate an `id` regardless of whether `label` is provided.

---

### 11. Tooltip wrapper `<span>` is focusable but has no semantic role

**File:** `src/components/primitives/Tooltip/Tooltip.tsx:26`

When `noTabStop` is false (the default), the wrapper `<span>` gets `tabIndex={0}`, making it keyboard-focusable. But `<span>` has no implicit role — screen readers announce it as a generic element with no meaning.

**Fix:** Ensure `noTabStop={true}` is always used when wrapping an already-focusable child, or add a lint/runtime warning for the default case.

---

### 12. Tooltip `aria-describedby` is lost when `noTabStop` is true

**File:** `src/components/primitives/Tooltip/Tooltip.tsx:29`

When `noTabStop` is true, `aria-describedby` is set to `undefined` on the wrapper — meaning the focusable child never receives the tooltip description.

**Fix:** Always pass `tooltipId` to the child via `aria-describedby` regardless of `noTabStop`; the tab stop and the description are independent concerns.

---

### 13. Tabs keyboard navigation missing `Home`/`End` keys

**File:** `src/components/primitives/Tabs/Tabs.tsx:138`

The ARIA tab pattern requires `Home` (jump to first tab) and `End` (jump to last tab). Only `ArrowLeft`/`ArrowRight` are handled.

**Fix:** Add `Home` and `End` cases to `handleKeyDown`.

---

### 14. Tabs "add" button is outside the tablist landmark

**File:** `src/components/primitives/Tabs/Tabs.tsx:153`

The add button is rendered before `role="tablist"` in DOM order, so it appears at an unexpected point in tab order for keyboard users.

**Fix:** Move the add button after the `<div role="tablist">`, or give it `role="presentation"` if position must stay.

---

## Low — Polish

### 15. Toast region missing `role="region"`

**File:** `src/components/primitives/Toast/Toast.tsx:92`

The container has `aria-label="Notifications"` but no `role="region"`, so it is not a landmark. Assistive technology users cannot navigate to it directly via landmark navigation.

**Fix:** Add `role="region"` to the `.region` div.

---

### 16. Toast `role="alert"` combined with redundant `aria-live`/`aria-atomic`

**File:** `src/components/primitives/Toast/Toast.tsx:39`

`role="alert"` implicitly sets `aria-live="assertive"` and `aria-atomic="true"`. The explicit attributes are redundant and some screen readers double-announce the toast.

**Fix:** Remove `aria-live="assertive"` and `aria-atomic="true"` — keep only `role="alert"`.

---

### 17. Tab remove button uses `×` Unicode character

**File:** `src/components/primitives/Tabs/Tabs.tsx:49`

The `×` multiplication sign has no semantic meaning and some screen readers announce it as "times" or "multiplication sign" even when `aria-label` is present.

**Fix:** Replace `×` with `<Icon name="close" />` (already `aria-hidden`) so the button label comes entirely from `aria-label`.

---

## Updated Priority Order

| Priority | Issue | File |
| -------- | ----- | ---- |
| ~~P0~~   | ~~Race condition — character updates can silently overwrite each other~~ | ~~`src/hooks/useGame.ts`~~ |
| ~~P0~~   | ~~`as unknown as GameSession` — compiler is being lied to~~ | ~~`src/hooks/useGame.ts:38`~~ |
| ~~P1~~   | ~~Save errors are invisible to users~~ | ~~Multiple~~ |
| ~~P1~~   | ~~No error boundary — app goes blank on route throw~~ | ~~`src/App.tsx`~~ |
| ~~P2~~   | ~~RangerAnimalCompanion is 689 lines~~ | ~~`src/components/CharacterSheet/playbooks/ranger/`~~ |
| ~~P2~~   | ~~Three debouncing patterns — pick one~~ | ~~Multiple~~ |
| ~~P3~~   | ~~Unnecessary memo on leaf components~~ | ~~`Stats.tsx`, `Inventory.tsx`~~ |
| ~~P3~~   | ~~aria-label uses question format~~ | ~~`RevenantInsert.tsx:330`~~ |
| ~~P1~~   | ~~`Input` has no keyboard focus indicator~~ | ~~`src/components/primitives/Input/Input.module.css`~~ |
| ~~P1~~   | ~~`Button` has no keyboard focus indicator~~ | ~~`src/components/primitives/Button/Button.module.css`~~ |
| P2 | Marshal/Followers save calls have no error handling | `MarshalCrew.tsx`, `FollowersInsert.tsx` |
| P3 | Instinct/Cost radio-with-custom pattern is duplicated | `AnimalInstinct.tsx`, `AnimalCost.tsx`, `MarshalCrew.tsx` |
| P1 | Button has no `:focus-visible` rule | `Button/Button.module.css` |
| P1 | Collapse trigger has no `:focus-visible` rule | `Collapse/Collapse.module.css` |
| P1 | CheckboxGroup uses no group semantics | `CheckboxGroup/CheckboxGroup.tsx` |
| P1 | Radio has no group semantics | `Radio/Radio.tsx` |
| P1 | Modal background content is not inert | `Modal/Modal.tsx` |
| P1 | Modal has no required accessible name | `Modal/Modal.tsx` |
| P1 | Icon-only Button has no enforced accessible name | `Button/Button.tsx` |
| P1 | Toggle `label` is optional — toggle can be unnamed | `Toggle/Toggle.tsx` |
| P2 | Input error not linked via `aria-describedby` | `Input/Input.tsx` |
| P2 | Input without label generates no `id` | `Input/Input.tsx` |
| P2 | Tooltip wrapper `<span>` is focusable but has no role | `Tooltip/Tooltip.tsx` |
| P2 | Tooltip `aria-describedby` lost when `noTabStop` is true | `Tooltip/Tooltip.tsx` |
| P2 | Tabs missing `Home`/`End` keyboard navigation | `Tabs/Tabs.tsx` |
| P2 | Tabs add button is outside the tablist landmark | `Tabs/Tabs.tsx` |
| P3 | Toast region missing `role="region"` | `Toast/Toast.tsx` |
| P3 | Toast redundant `aria-live`/`aria-atomic` on `role="alert"` | `Toast/Toast.tsx` |
| P3 | Tab remove button uses `×` Unicode character | `Tabs/Tabs.tsx` |

---

# Sample Prompt

Let's looks at all nine of the playbooks: Blessed, Fox, Heavy, Lightbearer, Judge, Marshal, Ranger, Would-be Hero. These all have been developed and exist in our application.

Now that they all exist, I want to see if there are any major refactor opportunities, DRY violations, strategy improvements, best practices missed, accessibility improvements, SEO improvements, bugs, etc.

There should also be quality of life improvements looked at. Design improvements. Little touches and flourishes.

Look up any and all game concepts in the game rulebook: /Users/garrett.vorbeck/Sites/stonetop/docs/Stonetop (Book 1).txt

Make use of any primitive components in /Users/garrett.vorbeck/Sites/stonetop/src/components/primitives

Develop this with an eye towards establish patterns, react best practices, accessibility, a conservative firestore read/write process, DRY policies, current coding standards, lean elegant code. Ask questions, don't make assumptions.
