# Code Review

**Read-only review — do not edit any files.** Identify and report findings only.

Perform an in-depth code review of all currently modified files (staged + unstaged) against this project's coding standards.

## Steps

1. Run `git diff HEAD --name-only` and `git diff --cached --name-only` to get the list of modified files.
2. Read each modified file in full.
3. Review each file against every category below. For each finding, note the file path and line number.

## Project Context

Stack: Vite + React 18 + TypeScript (strict), React Router v6, Firebase v10 (Firestore), CSS Modules, clsx.  
Architecture: flat `games/{id}` Firestore doc, `characters[]` nested array, full real-time sync via `onSnapshot`, no auth.  
Design system: primitives in `src/components/primitives/` (Button, Text, Heading, Input, Stack, Icon, Modal).

## Review Categories

### Code Style (Project Conventions — Non-Negotiable)
- `function` declarations used instead of arrow functions — every function must be an arrow function, including exports, components, and utilities
- `clsx(...)` inlined inside JSX instead of hoisted above the return as `const cx = clsx(...)`
- Styling done outside CSS Modules (inline styles, Tailwind, styled-components, etc.)
- CSS class names accessed as `styles.foo` instead of importing `styles` from the module
- TypeScript `any` usage — strict mode is required throughout
- Comments that describe *what* instead of *why* (naming, visible logic); only add comments when the WHY is genuinely non-obvious

### Correctness & Bugs
- Logic errors, off-by-one mistakes, incorrect conditionals
- Async/await misuse (missing await, unhandled promise rejections, race conditions)
- Stale closure bugs in hooks — missing or incorrect dependency arrays
- State mutations (modifying arrays/objects directly instead of spreading/replacing)
- Optimistic UI updates not rolled back on Firestore write failure

### Firestore Efficiency & Cost
- Reads triggered inside loops or per-item (should batch or denormalize)
- `onSnapshot` listeners not cleaned up on component unmount (leaked listeners = ongoing billing)
- Overly broad reads (fetching full collection when a single doc suffices)
- Writing entire document when only one field changed — use `updateDoc` with targeted field paths
- Redundant writes (writing data that hasn't changed)
- Missing or unnecessary Firestore indexes that would cause extra reads or rejected queries
- `collection().where()` chains that download more documents than needed client-side filtering would produce
- Re-subscribing to `onSnapshot` on every render instead of once in a stable `useEffect`

### React Performance & Fine-Tuning
- Anonymous functions or object literals created inline in JSX props on components that re-render frequently (causes unnecessary re-renders of children)
- `useMemo` / `useCallback` added without a measurable need — premature optimization counts as a finding
- `useMemo` / `useCallback` missing where they are clearly warranted (expensive computation or stable reference required for `React.memo` child)
- Components doing too much — rendering, data-fetching, and business logic all in one place
- `key` props using array indexes on reorderable or mutable lists
- `useEffect` with side effects that should be event handlers instead
- State that could be derived from props or other state (unnecessary `useState`)
- Missing `React.memo` on pure presentational components that receive stable props

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

### Accessibility
- Non-semantic HTML (`<div onClick>` instead of `<button>` or `<a>`)
- Missing `aria-label` on icon-only interactive elements
- Interactive elements not reachable via keyboard (missing `tabIndex`, no focus styles)
- Color as the only visual differentiator (no text or icon backup)
- Form inputs missing associated `<label>` or `aria-labelledby`
- Images missing `alt` attributes

### SEO & Web Performance
- `<title>` and `<meta name="description">` not updated per route — every page shares the same static head
- Open Graph tags (`og:title`, `og:description`, `og:image`, `og:url`) missing or incomplete
- `<meta name="twitter:card">` and related tags absent
- No canonical `<link rel="canonical">` on routes that could be reached via multiple URLs
- Images missing `alt` text, `width`, and `height` attributes — causes layout shift and skips crawler context
- Images not lazy-loaded (`loading="lazy"`) when below the fold
- No `robots.txt` in `public/` — crawlers have no explicit crawl directives
- No `sitemap.xml` — discoverable routes not registered for indexing
- Web fonts loaded without `font-display: swap` — invisible text during font load hurts Core Web Vitals
- No `<link rel="preconnect">` or `<link rel="dns-prefetch">` for third-party origins (Firebase, Google Fonts)
- Route-level code splitting absent — entire bundle shipped on first load instead of splitting by page
- Large JS chunks not deferred or dynamically imported where the feature is not needed on initial paint
- Structured data (JSON-LD) absent where page content is well-defined enough to warrant it (e.g., application landing page)

### Code Quality & Leanness
- Dead code, commented-out blocks, `console.log` / `console.error` left in
- Functions longer than ~40 lines with more than one responsibility
- Over-engineered abstractions for a single use case — three similar lines beats a premature abstraction
- Error handling or validation added for scenarios that cannot actually happen
- Backwards-compatibility shims, re-exports, or renamed `_unused` variables for removed code — delete cleanly
- Features, fallbacks, or flags not required by the current task

## Output Format

No emojis. Plain language throughout — write as if explaining to a junior developer who is learning, not a senior engineer who needs technical depth.

Group findings by file, then by severity:

**[Bug / Security]** — must fix before merge  
**[Standards Violation]** — should fix  
**[Suggestion]** — worth considering  

Number each finding sequentially across all files (1, 2, 3, ...) so findings can be referenced by number.

For each finding:
```
N. [SEVERITY] file-path:line — what the problem is, in plain English (one sentence, no jargon)
   Fix: what to do instead (one sentence, concrete and specific)
```

Rules for writing findings:
- Lead with what the problem *does wrong*, not what pattern it violates
- No acronyms or framework jargon unless unavoidable — if you must use a term like `useEffect`, briefly say what it does
- No passive voice ("this could cause" → "this will cause")
- No academic phrasing ("it is worth noting", "one may observe")
- Keep each finding to two sentences total

End with a summary: total findings by severity, and an overall assessment (Ready / Needs Work / Major Issues).
