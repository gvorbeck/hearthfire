# Sample Prompt

Let's looks at all nine of the playbooks: Blessed, Fox, Heavy, Lightbearer, Judge, Marshal, Ranger, Would-be Hero. These all have been developed and exist in our application.

Now that they all exist, I want to see if there are any major refactor opportunities, DRY violations, strategy improvements, best practices missed, accessibility improvements, SEO improvements, bugs, etc.

There should also be quality of life improvements looked at. Design improvements. Little touches and flourishes.

Look up any and all game concepts in the game rulebook: /Users/garrett.vorbeck/Sites/stonetop/docs/Stonetop (Book 1).txt

Make use of any primitive components in /Users/garrett.vorbeck/Sites/stonetop/src/components/primitives

Develop this with an eye towards establish patterns, react best practices, accessibility, a conservative firestore read/write process, DRY policies, current coding standards, lean elegant code. Ask questions, don't make assumptions.

---

# Refactor Opportunities — 2026-05-31

## 1. Collapse/selection logic duplicated across RadioSelect, Background, and Appearance

All three re-implement the same "collapse on select, expand on deselect" pattern with nearly identical ref + state structures. A `useCollapsibleSection` hook would cut ~30 lines from RadioSelect alone and lock in consistency. Low risk, high payoff.

**Files:** `src/components/CharacterSheet/sections/RadioSelect.tsx`, `Background.tsx`, `Appearance.tsx`

---

## 2. Insert components reinventing state management

ThrallInsert and FollowersInsert both manage checkbox state, consequence tracking, and save handlers locally instead of using shared patterns. FollowersInsert at 514 lines is the worst offender — it's essentially a hand-rolled collection manager. Extracting the tracked-field and consequence-checkbox logic already present in the codebase would shrink both by ~35%.

**Files:** `src/components/CharacterSheet/playbooks/thrall/ThrallInsert.tsx`, `src/components/CharacterSheet/playbooks/followers/FollowersInsert.tsx`

---

## 3. Move definitions have no single source of truth

Core moves like "Defy Danger" appear in both `basicMoves.ts` and individual playbook files. A lookup-by-ID registry or a `buildPlaybookMoves(base, specific)` factory would eliminate ~200 LOC of duplication and make it safe to modify a shared move without hunting across 12 files.

**Files:** `src/lib/basicMoves.ts`, `src/lib/specialMoves.ts`, `src/lib/followerMoves.ts`, and per-playbook move files
