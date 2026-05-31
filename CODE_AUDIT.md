# Code Audit — Stonetop Party Tracker

**Date:** 2026-05-22
**Grade: B−**

The fundamentals are solid. TypeScript coverage is strong, CSS Modules discipline is tight, and style rules are followed consistently across the board. The accessibility effort is genuine. But there are real correctness and data safety issues that would bite in production.

---

# Round 2 Audit — 2026-05-25

**Grade: A−**

Every item from the B− audit is resolved. The remaining gap to A+ is three real issues plus one refactor opportunity. Nothing here is cosmetic — each one is a concrete correctness or accessibility problem.

---

## High — Address Soon

### ~~1. `Input` has no keyboard focus indicator~~

~~**File:** `src/components/primitives/Input/Input.module.css:17,28`~~

~~`outline: none` removes the browser's default focus ring unconditionally. The `:focus` rule fires on mouse clicks as well as keyboard, so it isn't a replacement — it's just a border tint. A keyboard user tabbing into a text field gets no visible indicator that it's focused.~~

~~Every other interactive primitive in the codebase (`Checkbox`, `Radio`, `Toggle`, `Tabs`, `UseDots`) uses `:focus-visible` correctly. `Input` is the exception.~~

**Resolved:** `outline: none` moved into `:focus` (suppresses browser default only when focused), and a `:focus-visible` rule added with `outline: 2px solid var(--color-gold-400); outline-offset: 2px` — matching every other primitive.

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

### ~~2. `Button` has no keyboard focus indicator~~

~~**File:** `src/components/primitives/Button/Button.module.css`~~

~~No `:focus` or `:focus-visible` rule exists anywhere in the file. The browser default outline is not suppressed here, so most browsers will show _something_, but it will be inconsistent (browser-default blue ring on a dark themed UI) and not match the design system. More importantly, it's an accident — if `outline: none` is ever added globally or to a parent, `Button` becomes inaccessible silently.~~

**Resolved:** Added `:focus-visible` to `.base` with `outline: 2px solid var(--color-gold-400); outline-offset: 2px`, matching every other primitive.

---

## Medium — Address Before Next Review

### ~~3. Save calls in `MarshalCrew` and `FollowersInsert` have no error handling~~

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

### ~~4. Instinct/Cost radio-with-custom is duplicated across Ranger and Marshal~~

~~**Files:** `src/components/CharacterSheet/playbooks/ranger/AnimalInstinct.tsx`, `src/components/CharacterSheet/playbooks/ranger/AnimalCost.tsx`, `src/components/CharacterSheet/playbooks/marshal/MarshalCrew.tsx:332–372`~~

**Resolved:** `AnimalInstinct.tsx` and `AnimalCost.tsx` deleted. The existing `Instinct` component (renamed `RadioSelect`) is now used directly by both `RangerAnimalCompanion` and `MarshalCrew` via adapter `onSave` callbacks. No duplication remains.

---

## Updated Priority Order

| Priority | Issue                                                                    | File                                                      |
| -------- | ------------------------------------------------------------------------ | --------------------------------------------------------- |
| ~~P0~~   | ~~Race condition — character updates can silently overwrite each other~~ | ~~`src/hooks/useGame.ts`~~                                |
| ~~P0~~   | ~~`as unknown as GameSession` — compiler is being lied to~~              | ~~`src/hooks/useGame.ts:38`~~                             |
| ~~P1~~   | ~~Save errors are invisible to users~~                                   | ~~Multiple~~                                              |
| ~~P1~~   | ~~No error boundary — app goes blank on route throw~~                    | ~~`src/App.tsx`~~                                         |
| ~~P2~~   | ~~RangerAnimalCompanion is 689 lines~~                                   | ~~`src/components/CharacterSheet/playbooks/ranger/`~~     |
| ~~P2~~   | ~~Three debouncing patterns — pick one~~                                 | ~~Multiple~~                                              |
| ~~P3~~   | ~~Unnecessary memo on leaf components~~                                  | ~~`Stats.tsx`, `Inventory.tsx`~~                          |
| ~~P3~~   | ~~aria-label uses question format~~                                      | ~~`RevenantInsert.tsx:330`~~                              |
| P1       | `Input` has no keyboard focus indicator                                  | `src/components/primitives/Input/Input.module.css`        |
| ~~P1~~   | ~~`Button` has no keyboard focus indicator~~                             | ~~`src/components/primitives/Button/Button.module.css`~~  |
| P2       | Marshal/Followers save calls have no error handling                      | `MarshalCrew.tsx`, `FollowersInsert.tsx`                  |
| ~~P3~~   | ~~Instinct/Cost radio-with-custom pattern is duplicated~~                | ~~`AnimalInstinct.tsx`, `AnimalCost.tsx`, `MarshalCrew.tsx`~~ |

---

# Round 3 Audit — 2026-05-25 — Primitives Accessibility

**Scope:** `src/components/primitives/` only — accessibility audit against WCAG 2.1 AA.

---

## High — Fix Before Real Users

### ~~1. Button has no `:focus-visible` rule~~

~~**File:** `src/components/primitives/Button/Button.module.css`~~

~~No `:focus-visible` rule exists on `.base`. The browser default outline is not explicitly suppressed here, but it will be inconsistent on a dark-themed UI and will silently break if a parent ever adds `outline: none`.~~

**Resolved:** Added `:focus-visible` to `.base` with `outline: 2px solid var(--color-gold-400); outline-offset: 2px`.

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

**Resolved:** Added `:focus-visible` to `.trigger` with `outline: 2px solid var(--color-gold-400); outline-offset: 2px`.

---

### 3. CheckboxGroup uses no group semantics

**File:** `src/components/primitives/CheckboxGroup/CheckboxGroup.tsx:53`

The container is a plain `<div>` with no `role="group"` and the label `<p>` is not programmatically associated with the checkboxes. Screen readers announce each checkbox without grouping context.

**Fix:** Replace the outer `<div>` with `<fieldset>` and the label `<p>` with `<legend>`.

**Resolved:** Outer `<div>` replaced with `<fieldset>`, label wrapped in `<legend>`. Added fieldset reset (`border: none; padding: 0; margin: 0; min-inline-size: 0`) to `.root` in the CSS module.

---

### 4. Radio has no group semantics

**File:** `src/components/primitives/Radio/Radio.tsx`

`Radio` renders standalone `<label>/<input>` pairs with no `<fieldset>`/`<legend>` grouping API. Screen reader users hear each option in isolation without knowing what question the group answers.

**Fix:** Create a `RadioGroup` wrapper that renders `<fieldset>`/`<legend>`, mirroring how `CheckboxGroup` wraps `Checkbox`.

**Resolved:** Created `src/components/primitives/RadioGroup/RadioGroup.tsx` — `<fieldset>`/`<legend>` wrapper with optional `legendHidden` prop (visually hidden but announced by screen readers). Exported from primitives index. Wired into `RadioSelect` with `legendHidden` since the section heading is already visible. `SteadingStats` uses `role="group" aria-label` which is valid for that pattern — left untouched.

---

### 5. Modal background content is not inert

**File:** `src/components/primitives/Modal/Modal.tsx:80`

The focus trap catches Tab key events, but nothing prevents assistive technology from navigating to background content. Screen reader users can escape the modal without closing it.

**Fix:** Set `aria-hidden="true"` on the app root (or use the `inert` attribute) while the modal is open.

**Resolved:** `Modal.tsx` now sets `inert` on `#root` when the modal opens and removes it on close. The portal renders as a sibling of `#root` in `document.body`, so it is unaffected. Guard added so the effect bails early if `#root` is not found, preventing a stuck-inert page.

---

### ~~6. Modal has no required accessible name~~ ✅ Fixed

**File:** `src/components/primitives/Modal/Modal.tsx:23`

`aria-labelledby` is now required in `ModalProps`. All existing call sites already supplied it.

---

### ~~7. Icon-only Button has no enforced accessible name~~ ✅ Fixed

**File:** `src/components/primitives/Button/Button.tsx:12`

`ButtonWithIconOnly` discriminated union enforces `'aria-label': string` when `icon` is set and `children?: never`.

---

### ~~8. Toggle `label` is optional — toggle can be unnamed~~ ✅ Fixed

**File:** `src/components/primitives/Toggle/Toggle.tsx`

Discriminated union now requires either `label: ReactNode` or `aria-label: string` — a Toggle with neither is a type error.

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

| Priority | Issue                                                                    | File                                                      |
| -------- | ------------------------------------------------------------------------ | --------------------------------------------------------- |
| ~~P0~~   | ~~Race condition — character updates can silently overwrite each other~~ | ~~`src/hooks/useGame.ts`~~                                |
| ~~P0~~   | ~~`as unknown as GameSession` — compiler is being lied to~~              | ~~`src/hooks/useGame.ts:38`~~                             |
| ~~P1~~   | ~~Save errors are invisible to users~~                                   | ~~Multiple~~                                              |
| ~~P1~~   | ~~No error boundary — app goes blank on route throw~~                    | ~~`src/App.tsx`~~                                         |
| ~~P2~~   | ~~RangerAnimalCompanion is 689 lines~~                                   | ~~`src/components/CharacterSheet/playbooks/ranger/`~~     |
| ~~P2~~   | ~~Three debouncing patterns — pick one~~                                 | ~~Multiple~~                                              |
| ~~P3~~   | ~~Unnecessary memo on leaf components~~                                  | ~~`Stats.tsx`, `Inventory.tsx`~~                          |
| ~~P3~~   | ~~aria-label uses question format~~                                      | ~~`RevenantInsert.tsx:330`~~                              |
| ~~P1~~   | ~~`Input` has no keyboard focus indicator~~                              | ~~`src/components/primitives/Input/Input.module.css`~~    |
| ~~P1~~   | ~~`Button` has no keyboard focus indicator~~                             | ~~`src/components/primitives/Button/Button.module.css`~~  |
| ~~P2~~   | ~~Marshal/Followers save calls have no error handling~~                  | ~~`MarshalCrew.tsx`, `FollowersInsert.tsx`~~               |
| P3       | Instinct/Cost radio-with-custom pattern is duplicated                    | `AnimalInstinct.tsx`, `AnimalCost.tsx`, `MarshalCrew.tsx` |
| ~~P1~~   | ~~Button has no `:focus-visible` rule~~                                  | ~~`Button/Button.module.css`~~                            |
| P1       | Collapse trigger has no `:focus-visible` rule                            | `Collapse/Collapse.module.css`                            |
| P1       | CheckboxGroup uses no group semantics                                    | `CheckboxGroup/CheckboxGroup.tsx`                         |
| P1       | Radio has no group semantics                                             | `Radio/Radio.tsx`                                         |
| P1       | Modal background content is not inert                                    | `Modal/Modal.tsx`                                         |
| P1       | Modal has no required accessible name                                    | `Modal/Modal.tsx`                                         |
| P1       | Icon-only Button has no enforced accessible name                         | `Button/Button.tsx`                                       |
| P1       | Toggle `label` is optional — toggle can be unnamed                       | `Toggle/Toggle.tsx`                                       |
| P2       | Input error not linked via `aria-describedby`                            | `Input/Input.tsx`                                         |
| P2       | Input without label generates no `id`                                    | `Input/Input.tsx`                                         |
| P2       | Tooltip wrapper `<span>` is focusable but has no role                    | `Tooltip/Tooltip.tsx`                                     |
| P2       | Tooltip `aria-describedby` lost when `noTabStop` is true                 | `Tooltip/Tooltip.tsx`                                     |
| P2       | Tabs missing `Home`/`End` keyboard navigation                            | `Tabs/Tabs.tsx`                                           |
| P2       | Tabs add button is outside the tablist landmark                          | `Tabs/Tabs.tsx`                                           |
| P3       | Toast region missing `role="region"`                                     | `Toast/Toast.tsx`                                         |
| P3       | Toast redundant `aria-live`/`aria-atomic` on `role="alert"`              | `Toast/Toast.tsx`                                         |
| P3       | Tab remove button uses `×` Unicode character                             | `Tabs/Tabs.tsx`                                           |

---

# Sample Prompt

Let's looks at all nine of the playbooks: Blessed, Fox, Heavy, Lightbearer, Judge, Marshal, Ranger, Would-be Hero. These all have been developed and exist in our application.

Now that they all exist, I want to see if there are any major refactor opportunities, DRY violations, strategy improvements, best practices missed, accessibility improvements, SEO improvements, bugs, etc.

There should also be quality of life improvements looked at. Design improvements. Little touches and flourishes.

Look up any and all game concepts in the game rulebook: /Users/garrett.vorbeck/Sites/stonetop/docs/Stonetop (Book 1).txt

Make use of any primitive components in /Users/garrett.vorbeck/Sites/stonetop/src/components/primitives

Develop this with an eye towards establish patterns, react best practices, accessibility, a conservative firestore read/write process, DRY policies, current coding standards, lean elegant code. Ask questions, don't make assumptions.
