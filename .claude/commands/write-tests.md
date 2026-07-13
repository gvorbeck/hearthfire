---
description: Write vitest tests using the project's test helpers, avoiding the known fake-timer hangs
argument-hint: <file, hook, or area to test — omit to cover the pending changes>
---

# Write Tests

Write vitest tests for `$ARGUMENTS`. If no argument was given, find the untested non-trivial logic in the pending changes (`git diff HEAD --name-only` plus untracked files) and cover that.

## Infrastructure

- Runner: `npm test` (one-shot `vitest run`); filter to a path with `npm test -- <path>`. jsdom environment.
- Global setup in `src/test/setup.ts` already stubs `VITE_FIREBASE_*` env vars, `IntersectionObserver`, and `matchMedia` — never re-stub these in a test file.
- Placement: `__tests__/` directory beside the source, named `<name>.test.ts` / `.test.tsx`. Read a sibling test file first and match its style.
- Helpers in `src/test/`:
  - `firestoreMock.ts` — in-memory Map backing all of `firebase/firestore` (doc/getDoc/updateDoc/runTransaction/onSnapshot/addDoc/collection/arrayUnion). At the top of the test file, before importing the code under test: `vi.mock('firebase/firestore', () => firestoreMockModule());` then seed and inspect docs via `firestoreStore`.
  - `toastMock.ts` — mock `'@/components/app'` and `'@/components/app/Toast/ToastContext'` with `toastModuleMock()`; assert error-toast paths on `addToastSpy`.
  - `renderWithProviders.tsx` — `renderWithProviders(el)` wraps Helmet + Toast + MemoryRouter; `renderRoute(el, path, route)` for components that read path params.

## Known hangs — these deadlock the suite, not just fail it

1. **Never mount the real `ToastProvider` under fake timers.** Its auto-dismiss `setTimeout` never fires, so teardown hangs forever. Use `toastModuleMock()` instead.
2. **Never use `waitFor` under fake timers.** `waitFor` polls on real time while timers are frozen — deadlock. Advance explicitly (`vi.advanceTimersByTime`, inside `act(...)` where needed) and assert synchronously after.
3. **Pass stable references to `renderHook`.** Hoist objects/arrays used as hook args or `initialProps` to consts outside the render callback — a fresh literal on every render retriggers effects and can loop the test.

## Rules

- Test behavior through the public API (rendered output, returned values, Firestore doc contents in `firestoreStore`) — don't reach into implementation internals.
- No invented game content in fixtures — moves, stats, and playbook data in test fixtures must be minimal placeholders, never plausible-looking fabrications.
- Never leave `.only` or `.skip` in a committed test.
- Run the new tests first (`npm test -- <path>`), then the full suite (`npm test`). Report the real results — a failing or skipped test is something to surface, never to hide.
