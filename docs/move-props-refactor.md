# Move Component Props Refactor

## Problem

`Move` currently has 18 props. Most are logically grouped but arrive as flat, independent
optionals, which makes callsites verbose, hides intent, and allows invalid combinations
(e.g. `onCheckListChange` + `onCheckListLevelChange` both passed at once).

## Target Interface

```typescript
// Each cluster is an object or omitted entirely.
interface MoveProps {
  move: MoveDefinition;

  // Cluster: selection + lock state
  selection?: {
    selected: boolean;
    onChange: (checked: boolean) => void;
    disabled?: boolean;
    lockReason?: string;
  };

  // Cluster: primary uses dots
  uses?: {
    checked: number;
    onChange: (count: number) => void;
  };

  // Cluster: secondary uses dots (e.g. Up With People — two players' hold on same move)
  uses2?: {
    checked: number;
    onChange: (count: number) => void;
  };

  // Cluster: takes (bitmasked checkboxes alongside selection)
  takes?: {
    checked: number;
    onChange: (count: number) => void;
  };

  // Cluster: checklist — discriminated union enforces mutual exclusivity of modes
  checklist?:
    | {
        mode: 'boolean';
        checked: Record<string, boolean>;
        forcedIds?: string[];
        onChange: (id: string, checked: boolean) => void;
      }
    | {
        mode: 'leveled';
        levels: Record<string, number>;
        currentLevel: number;
        onChange: (id: string, level: number | null) => void;
      };

  // Escape hatch: arbitrary node in the move header (Thrall marks cross-off button)
  headerAction?: React.ReactNode;
}
```

**Result: 7 props** (down from 18). Each cluster is self-describing and self-contained.

---

## Callsite Comparison

### Display-only (no change in verbosity)
```tsx
// Before
<Move move={move} />

// After
<Move move={move} />
```

### Selection-only (Lightbearer invocations)
```tsx
// Before
<Move move={inv} selected={isChecked} onSelectChange={handleChange} />

// After
<Move move={inv} selection={{ selected: isChecked, onChange: handleChange }} />
```

### Uses-only (Ghost Poltergeist Fury)
```tsx
// Before
<Move move={POLTERGEIST_MOVE} usesChecked={furyChecked} onUsesChange={handleFuryChange} />

// After
<Move move={POLTERGEIST_MOVE} uses={{ checked: furyChecked, onChange: handleFuryChange }} />
```

### Selection + disabled + headerAction (Thrall marks)
```tsx
// Before
<Move
  move={mark}
  selected={gained}
  onSelectChange={(val) => handleMarkGainedChange(mark.id, val)}
  disabled={crossedOff}
  headerAction={<Button ... />}
/>

// After
<Move
  move={mark}
  selection={{ selected: gained, onChange: (val) => handleMarkGainedChange(mark.id, val), disabled: crossedOff }}
  headerAction={<Button ... />}
/>
```

### Full interactive (Moves.tsx — primary playbook moves)
```tsx
// Before (17 individual props)
<Move
  key={move.id}
  move={move}
  selected={isDisabled ? true : (selected[move.id] ?? false)}
  onSelectChange={selectHandlers[move.id]}
  usesChecked={uses[move.id] ?? 0}
  onUsesChange={move.uses !== undefined ? usesHandlers[move.id] : undefined}
  usesChecked2={uses2[move.id] ?? 0}
  onUsesChange2={move.uses2 !== undefined ? uses2Handlers[move.id] : undefined}
  checkListChecked={checkLists[move.id] ?? {}}
  checkListForcedIds={forcedCheckList[move.id]}
  onCheckListChange={move.checkList !== undefined && !move.checkListLeveled ? checkListHandlers[move.id] : undefined}
  checkListLevels={checkListLevels[move.id] ?? {}}
  onCheckListLevelChange={move.checkListLeveled ? checkListLevelHandlers[move.id] : undefined}
  currentLevel={level}
  takesChecked={takes[move.id] ?? 0}
  onTakesChange={move.takes !== undefined ? takesHandlers[move.id] : undefined}
  disabled={isDisabled}
  lockReason={lockReason}
/>

// After (6 grouped props)
<Move
  key={move.id}
  move={move}
  selection={{
    selected: isDisabled ? true : (selected[move.id] ?? false),
    onChange: selectHandlers[move.id],
    disabled: isDisabled,
    lockReason,
  }}
  uses={move.uses !== undefined ? { checked: uses[move.id] ?? 0, onChange: usesHandlers[move.id] } : undefined}
  uses2={move.uses2 !== undefined ? { checked: uses2[move.id] ?? 0, onChange: uses2Handlers[move.id] } : undefined}
  takes={move.takes !== undefined ? { checked: takes[move.id] ?? 0, onChange: takesHandlers[move.id] } : undefined}
  checklist={
    move.checkListLeveled
      ? { mode: 'leveled', levels: checkListLevels[move.id] ?? {}, currentLevel: level, onChange: checkListLevelHandlers[move.id] }
      : move.checkList
        ? { mode: 'boolean', checked: checkLists[move.id] ?? {}, forcedIds: forcedCheckList[move.id], onChange: checkListHandlers[move.id] }
        : undefined
  }
/>
```

---

## Internal Changes to Move.tsx

The component body changes very little — mostly destructuring the new shape instead of
individual props. Key mechanical changes:

- Destructure `selection?.selected`, `selection?.onChange`, `selection?.disabled`,
  `selection?.lockReason` instead of flat props.
- `locked` derives from `!!selection?.lockReason` (same logic, new source).
- `disabled` comes from `selection?.disabled`.
- `checklist` mode branch replaces the current `checkedLevel !== null` conditional —
  the discriminated union makes the mode explicit instead of inferred.
- `uses`, `uses2`, `takes` destructure naturally; the `hasUses` / `hasUses2` / `hasTakes`
  booleans simplify to `!!uses`, `!!uses2`, `!!takes`.

No changes to `MoveDefinition`. No changes to CSS.

---

## Files to Touch

| File | Change |
|------|--------|
| `src/components/CharacterSheet/Move/Move.tsx` | New `MoveProps` interface + destructuring updates |
| `src/components/CharacterSheet/sections/Moves.tsx` | Update full-interactive callsite |
| `src/components/CharacterSheet/playbooks/lightbearer/LightbearerInvocations.tsx` | Update selection-only callsite |
| `src/components/CharacterSheet/playbooks/ghost/GhostInsert.tsx` | Update uses-only callsite |
| `src/components/CharacterSheet/playbooks/thrall/ThrallInsert.tsx` | Update two callsites (uses-only + selection+headerAction) |

5 files total. No new files. No CSS changes. No type changes outside `MoveProps`.

---

## Implementation Order

1. **Update `MoveProps` and `Move.tsx` internals** — change the interface and destructuring;
   TypeScript will immediately flag all callsites as broken, acting as a checklist.
2. **Fix `Moves.tsx`** — largest callsite, most props.
3. **Fix remaining callsites** — Lightbearer, Ghost, Thrall (two sites). Each is small.
4. **Verify** — `npm run build` (type-check), then smoke-test in the browser that all
   interactive move features still work (select, uses, checklist, takes, lock reason).

---

## Non-goals

- No changes to `MoveDefinition`.
- No splitting `Move` into multiple components.
- No changes to state management in `Moves.tsx` — only the JSX callsite changes.
- No CSS changes.
