# Code Review

**Read-only review — do not edit any files.** Identify and report findings only.

Perform an in-depth code review of all currently modified files (staged + unstaged) against this project's coding standards.

## Steps

1. Run `npm run lint`, `npx tsc --noEmit`, and `npm run build` to confirm the branch has no existing lint, type, or build errors. (`npm run build` chains all three — `eslint . && tsc && vite build` — but run the first two separately as well so a lint or type failure is reported distinctly from a bundler failure.) Report any failures at the top of the review under a **Build & Type Check** heading, quoting the failing file, line, and message. These are must-fix and take precedence over any style findings below.
2. Run `git diff HEAD --name-only` and `git diff --cached --name-only` to get the list of modified files.
3. Read each modified file in full.
4. Review each file against every category below. For each finding, note the file path and line number.

## Project Context

Stack: Vite + React 18 + TypeScript (strict), React Router v6, Firebase v10 (Firestore), CSS Modules, clsx.  
Architecture: flat `games/{id}` Firestore doc, `characters[]` nested array, full real-time sync via `onSnapshot`, no auth.  
Design system: atoms in `src/components/ui/` (Button, Checkbox, Heading, Icon, Input, List, Modal, Stack, Tabs, Text, Toggle, UseDots, etc.) — always check there before flagging a missing component.

## Review Categories

### Code Style (Project Conventions — Non-Negotiable)

- `function` declarations used instead of arrow functions — every function must be an arrow function, including exports, components, and utilities
- `clsx(...)` inlined inside JSX instead of hoisted above the return as `const cx = clsx(...)`
- Styling done outside CSS Modules (inline styles, Tailwind, styled-components, etc.)
- CSS class names accessed as `styles.foo` instead of importing `styles` from the module
- TypeScript `any` usage — strict mode is required throughout
- Comments that describe _what_ instead of _why_ (naming, visible logic); only add comments when the WHY is genuinely non-obvious
- Hardcoded `rem` values for `font-size` instead of type scale tokens — all font sizes must use `--text-xs` through `--text-3xl` from the Major Third scale defined in `src/index.css`; raw `rem` values are only acceptable for layout dimensions (widths, heights, spacing) and responsive `clamp()` display sizes
- Raw palette tokens used for text `color:` instead of theme-aware semantic tokens — any `color:` declaration must use `--text-primary`, `--text-secondary`, `--text-tertiary`, `--text-accent`, or `--text-heading`, never a raw `--color-stone-*` / `--color-gold-*` / `--color-navy-*` value. Raw palette tokens do not flip between dark and light mode, so text set with them becomes near-invisible in the wrong theme. (Raw palette tokens remain correct for `background`, `border`, `outline`, etc. — this rule is `color:` only.) Treat as a [Standards Violation] or higher, since it breaks light-mode legibility.
- Game text written as JSX fragments instead of plain strings — all move/possession text with bold, italic, or inline icons must be written as a plain string and rendered through `parseInlineMarkdown` in `src/lib/parseMarkdown.tsx`
- `◊` or `◈` rendered as raw Unicode characters instead of icons — `◊` maps to `empty-provisions` (diamond outline), `◈` maps to `filled-provisions` (diamond with checkmark); both are handled automatically by `parseInlineMarkdown`

### Correctness & Bugs

- Logic errors, off-by-one mistakes, incorrect conditionals
- Async/await misuse (missing await, unhandled promise rejections, race conditions)
- Stale closure bugs in hooks — missing or incorrect dependency arrays
- State mutations (modifying arrays/objects directly instead of spreading/replacing)
- Optimistic UI updates not rolled back on Firestore write failure
- Interactive controls that write to Firestore reading their value directly from props instead of local optimistic state with a pending ref (the project pattern — see `useCharacterField`); prop-driven controls flicker when the snapshot echoes back
- Swallowed errors — empty `catch {}`, or a Firestore write whose rejection is never surfaced to the user. With no backend validation, a silent write failure means the user's edit vanishes with no warning
- Debounced or timeout-based writes not cancelled on unmount (`useDebouncedSave`, `setTimeout`) — a pending save can fire after the component is gone or against a since-changed character
- Debounced write capturing a stale value or the wrong character — the payload must reflect the value at flush time, not at the moment the timer was scheduled
- Non-exhaustive `switch` / map over a union (especially `PlaybookType`, 9 members) with no `never`-typed default — a missed case slips through TypeScript-strict silently

### Firestore Efficiency & Cost

- Reads triggered inside loops or per-item (should batch or denormalize)
- `onSnapshot` listeners not cleaned up on component unmount (leaked listeners = ongoing billing)
- Overly broad reads (fetching full collection when a single doc suffices)
- Writing entire document when only one field changed — use `updateDoc` with targeted field paths
- Dot-notation field path used to write a single array element (e.g. `updateDoc(ref, { 'characters.0.hp': x })`) — Firestore reads `characters.0` as a literal field name, silently corrupting the doc; array elements must be updated by rewriting the array. Treat as a [Standards Violation] or higher, since it destroys user data
- Whole-`characters[]` read-modify-write races — two clients editing different characters each rewrite the full array under `onSnapshot` and clobber each other's changes; guard the write scope
- Redundant writes (writing data that hasn't changed)
- Missing or unnecessary Firestore indexes that would cause extra reads or rejected queries
- `collection().where()` chains that download more documents than needed client-side filtering would produce
- Re-subscribing to `onSnapshot` on every render instead of once in a stable `useEffect`

### React Performance & Fine-Tuning

- Object literals, arrays, arrow functions, or JSX elements created inline in props passed to a `React.memo` component — a new reference every render defeats the memo. Inline expressions that produce primitives (e.g. a ternary yielding a string, number, or boolean) do NOT defeat memo and must not be flagged.
- `useMemo` / `useCallback` added without a measurable need — premature optimization counts as a finding
- `useMemo` / `useCallback` missing where they are clearly warranted (expensive computation or stable reference required for `React.memo` child)
- Components doing too much — rendering, data-fetching, and business logic all in one place
- `key` props using a bare array index — never allowed, even on static lists; the key must encode a stable identifier (a real ID, or index combined with distinguishing data)
- `useEffect` with side effects that should be event handlers instead
- State that could be derived from props or other state (unnecessary `useState`)
- Missing `React.memo` on components rendered in long lists, where one item's change re-renders every sibling — do not flag memo as "missing" on components that render once or rarely

### Architecture & Separation of Responsibilities

- Firestore calls made directly inside JSX components — data access should live in custom hooks or a data layer
- Business logic embedded in render functions or event handlers that could be extracted to pure utilities
- Shared logic copy-pasted across components (DRY violation — extract to hook or utility)
- Flat document shape assumptions violated — components reaching into nested arrays without going through a consistent accessor
- Route-level concerns (path params, navigation) leaking into presentational components

### DRY Violations

- Duplicated logic that should be extracted into a shared utility or custom hook
- Inline constants (Firestore collection names, field paths, magic strings/numbers) that should be named constants
- Repeated JSX structures that should be a shared component
- Copy-pasted type definitions that should be a shared interface

### Naming & Readability

- Nested or chained ternaries inline in a JSX prop — hoist to a named `const`. A single, simple ternary inline in a prop is fine and must not be flagged; do not enforce a "variables only in props" style.
- Hoisted variables that merely restate a trivial expression (`const isSelected = selected`) — inline it instead; a name must add meaning the expression lacks
- Variables, functions, components, or files that don't clearly describe their intent
- Unnecessary abbreviations that reduce clarity
- Boolean variables or props not prefixed with `is`, `has`, `can`, `should`
- Event handlers not prefixed with `handle` or `on`
- Component files that don't match the component name they export

### Security

- `dangerouslySetInnerHTML` usage
- User-supplied input rendered as HTML without sanitization
- Firestore security rules bypassed client-side (reminder: no-auth model requires careful rule design)
- Secrets, API keys, or tokens referenced in frontend code
- Missing input validation on user-facing fields before writing to Firestore

### Accessibility (Non-Negotiable — treat violations as [Standards Violation] or higher, never [Suggestion])

- Non-semantic HTML (`<div onClick>` instead of `<button>` or `<a>`)
- Missing `aria-label` on icon-only interactive elements
- Elements hidden visually (`opacity: 0`, `visibility: hidden`) but still reachable via keyboard — must also have `tabIndex={-1}` and `aria-hidden`
- Missing `:focus-visible` styles on interactive elements — keyboard users must have a visible focus indicator
- Interactive elements not reachable via keyboard (missing `tabIndex`, no focus styles)
- `aria-hidden` or `tabIndex` not toggled when an element's visibility changes at runtime
- Color as the only visual differentiator (no text or icon backup)
- Form inputs missing associated `<label>` or `aria-labelledby`
- Images missing `alt` attributes

### SEO & Web Performance

**Only check this category when the diff touches relevant code** (head/meta tags, images, fonts, routes, bundle entry points). Never report repo-wide gaps (missing robots.txt, sitemap, code splitting) in a diff review — those are not introduced by this change.

- `<title>` / `<meta name="description">` / Open Graph tags broken or omitted by a change to routes or page head
- Images added without `width` and `height` attributes — causes layout shift
- Images added below the fold without `loading="lazy"`
- New web fonts loaded without `font-display: swap`
- New routes added eagerly when sibling routes are lazy-loaded

### Code Quality & Leanness

- Dead code, commented-out blocks, `console.log` / `console.error` left in
- Functions longer than ~40 lines with more than one responsibility
- Over-engineered abstractions for a single use case — three similar lines beats a premature abstraction
- Error handling or validation added for scenarios that cannot actually happen
- Backwards-compatibility shims, re-exports, or renamed `_unused` variables for removed code — delete cleanly
- Features, fallbacks, or flags not required by the current task
- New non-trivial logic (utilities, hooks, reducers) shipped without a test, when a sibling test file already exists for that area — flag as a [Suggestion]

## Confidence Bar

Only report findings you would defend in person. If you are not sure a finding is real, read the surrounding code to confirm — if still unsure, drop it. A short review of real problems beats a long review padded with maybes.

## Output Format

No emojis. The reader wants to scan this in under a minute.

Write dead simple, not technical. Every finding must pass this test: someone who has never programmed could read it and know what goes wrong for the person using the app. Use everyday words ("the page freezes", "the user's typing gets erased", "screen-reader users can't find this button"). Technical terms are allowed only in the Fix, and only the minimum needed to act (a hook name, a prop name).

Example of the level wanted:
- Bad: "Unstable lambda reference in onChange prop invalidates memoization of child component."
- Good: "This list redraws every item on every keystroke, so typing feels slow. Fix: wrap `handleChange` in `useCallback`."

Start with the verdict — one line. If lint, type check, or build failed, the verdict is at least Needs Work (Major Issues if the build is broken):

```
Verdict: Ready | Needs Work | Major Issues — N must-fix, N should-fix, N suggestions
```

If lint, type check, or build failed, list those first:

```
### Build & Type Check
1. `file-path:line` — the error message in plain words. Fix: the concrete change.
```

If all three passed, note it in one line (`Build, lint, and type check pass.`) and continue to the findings.

Then findings grouped by severity (worst first), numbered sequentially. **One line each:**

```
### Must fix
1. `file-path:line` — what breaks, in plain words. Fix: the concrete change.

### Should fix
2. ...

### Suggestions
3. ...
```

Hard rules:

- One line per finding: what's wrong + the fix. No elaboration, no second paragraph.
- At most 5 suggestions — pick the most valuable, silently drop the rest.
- Skip empty severity groups entirely.
- Never list categories checked, never write "no issues found in X", no preamble, no closing commentary after the last finding.
- Lead with what the problem does ("this loses the user's edit"), not what rule it breaks ("violates the optimistic-state pattern").
- Active voice only ("this will cause", not "this could potentially cause").
