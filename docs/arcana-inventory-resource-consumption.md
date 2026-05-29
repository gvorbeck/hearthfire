# Deferred Feature: Arcana Requirements — Inventory Resource Consumption

## Overview

Some minor (and future major) arcana have requirements that consume physical inventory resources —
supplies uses, specific consumable items, or Value-rated reagents. Today those requirements are
freeform checkboxes with no mechanical link to the Inventory tab. This document describes how to
make checking off such a requirement automatically decrement the matching inventory counter.

## Rules basis

From *Stonetop Book 1*: arcana requirements can include things like:

- "…you'll use up one of the aetherium ingots" (arcanum #1 — An old scroll case)
- "…acquire the reagents required for the recipe (Value 1)" (arcanum #37 — A fine ceramic urn)
- "…acquire a ◇ pouch of powdered cinnabar (1d4+8 uses, Value 2)" (arcanum #20)
- "…acquire the special ingredients for the clarified mammoth-butter to be burned in the lamp (Value 1)" (arcanum #40)

Spending supplies is covered by the "Have What You Need" and "Make Camp" moves, so a requirement
like "expend 1 use of Supplies" maps directly to the `inventoryUses` counter in `CharacterData`.

## Proposed data shape

Add an optional `consumesInventory` descriptor to each `ArcanaRequirement` in the library:

```ts
export interface ArcanaRequirementConsumption {
  type: 'supplies-uses';   // extend with 'possession' | 'value' as needed
  amount: number;           // number of uses / items to decrement
  inventoryItemId?: string; // specific MAIN_ITEMS id, e.g. 'supplies-1'; omit = any supplies
}

export interface ArcanaRequirement {
  text: string;
  consumesInventory?: ArcanaRequirementConsumption;
}
```

Currently `requirements: string[]` — this would expand to `requirements: ArcanaRequirement[]`
(breaking change, requires migration of all 50 arcana entries and the `MinorArcanaCard` renderer).

## UX flow

1. User checks off a requirement that has `consumesInventory` defined.
2. A confirmation micro-modal (or inline "This will spend 1 supplies use — confirm?") appears.
3. On confirm: the relevant `inventoryUses` key is decremented via `onSave`.
4. If the character has insufficient resources, show a warning but still allow the check (fictional
   positioning — the GM may have narrated the spend differently).

## Considerations before implementing

- **Requirements are keyed by index today** (`requirementsChecked: Record<string, boolean>` where key
  is the array index stringified). Expanding to `ArcanaRequirement` objects requires a stable `id`
  field per requirement so the key remains stable across future edits.
- **Major arcana** (not yet built) will likely have more structured requirement lists, so this is a
  good time to align the requirement shape across both arcana types.
- **Undo**: Firestore writes are immediate. Consider whether unchecking a consumed requirement should
  restore the resource (rules-wise it probably shouldn't, but players may uncheck by accident).
- **Cross-tab coupling**: This is the only place in the app where one tab's interaction side-effects
  another tab's persisted state. Document this clearly in both components' JSDoc or a CLAUDE.md note
  when implemented.

## Suggested implementation order

1. Stabilise `ArcanaRequirement` with an `id` field (no `consumesInventory` yet) — migrate all 50
   arcana entries and update `MinorArcanaCard`.
2. Add `consumesInventory` to the handful of arcana that clearly consume a supply/resource.
3. Implement the confirmation UX and cross-tab save in `ArcanaTab` / `MinorArcanaCard`.
