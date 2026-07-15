import type {
  ArcanaConsequence,
  CharacterData,
  ConsequenceAction,
  DebilityType,
  MajorArcanum,
} from "@/types";
import { MAJOR_ARCANA } from "@/lib/arcana/major";

// The central place where a consequence checkbox's side effects are applied. A consequence can carry
// `actions` (see ConsequenceAction); marking the box runs them and unmarking reverses them. Each action
// type maps to a CharacterData patch here, so adding a new cross-section effect is one union member
// (in types) plus one case below — no new wiring in the panel.

// The CharacterData keys these actions write are all boolean, narrowed here so a direct indexed
// assignment (dataPatch[marked] = checked) type-checks — a broad `keyof CharacterData` would widen the
// write target to `never`.
type BooleanKey = {
  [K in keyof CharacterData]-?: CharacterData[K] extends boolean | undefined
    ? K
    : never;
}[keyof CharacterData];

const DEBILITY_FIELDS: Record<
  DebilityType,
  { marked: BooleanKey; locked: BooleanKey }
> = {
  weakened: { marked: "debilityWeakened", locked: "debilityWeakenedLocked" },
  dazed: { marked: "debilityDazed", locked: "debilityDazedLocked" },
  miserable: { marked: "debilityMiserable", locked: "debilityMiserableLocked" },
};

// Locate a consequence (top-level or child) by id across the arcanum's back sections. The index is
// built once per arcanum and cached against the (stable) arcanum object, so repeated toggles are O(1)
// lookups instead of re-walking every section and consequence tree each time.
const indexCache = new WeakMap<MajorArcanum, Map<string, ArcanaConsequence>>();

const buildIndex = (arcanum: MajorArcanum): Map<string, ArcanaConsequence> => {
  const index = new Map<string, ArcanaConsequence>();

  const addTree = (consequences: ArcanaConsequence[]): void => {
    for (const c of consequences) {
      index.set(c.id, c);
      if (c.children) addTree(c.children);
    }
  };

  for (const section of arcanum.back?.sections ?? []) {
    addTree(
      section.content.filter(
        (entry): entry is ArcanaConsequence => "value" in entry,
      ),
    );
  }
  return index;
};

const findConsequence = (
  arcanum: MajorArcanum,
  consequenceId: string,
): ArcanaConsequence | undefined => {
  let index = indexCache.get(arcanum);
  if (!index) {
    index = buildIndex(arcanum);
    indexCache.set(arcanum, index);
  }
  return index.get(consequenceId);
};

// Signed adjustments to additive stats (Armor, HP), summed across every action in the pass. Positive
// on mark, negative on unmark. Kept as a delta — never resolved to an absolute here — so the caller can
// apply it against the freshest stored value inside a Firestore transaction, immune to a stale snapshot.
export interface StatDeltas {
  statArmor?: number;
  statHp?: number;
}

export interface ConsequenceActionResult {
  // Absolute fields to write to the character (debility flags). {} when nothing changes. Additive stats
  // are NOT here — they're in `statDeltas`, applied relative to the stored value.
  dataPatch: Partial<CharacterData>;
  // Signed Armor/HP adjustments to apply relative to the character's current stored values.
  statDeltas: StatDeltas;
  // Consequence ids that unchecking this one cascaded into and cleared (its descendants). The caller
  // unmarks these too. Empty when checking, or when the consequence has no children.
  clearedConsequenceIds: string[];
}

// Every descendant consequence id of the given consequence (children, recursively), excluding itself.
// Used to cascade an uncheck down the tree: a child can't stay marked once its parent is cleared.
const collectDescendantIds = (consequence: ArcanaConsequence): string[] =>
  (consequence.children ?? []).flatMap((child) => [
    child.id,
    ...collectDescendantIds(child),
  ]);

// True when toggling this consequence requires the action plumbing — either it carries actions itself,
// or (since unchecking cascades) it has descendants that might. Callers skip the rest otherwise.
export const hasConsequenceActions = (
  arcanum: MajorArcanum,
  consequenceId: string,
): boolean => {
  const consequence = findConsequence(arcanum, consequenceId);
  if (!consequence) return false;
  return (
    !!consequence.actions?.length ||
    collectDescendantIds(consequence).length > 0
  );
};

// Compute the character patch, stat deltas, entry bookkeeping, and cascade for marking/unmarking a
// consequence. Marking runs the consequence's own actions. Unchecking also reverses its descendants'
// actions and reports their ids, since a child can't remain marked once its parent is cleared — but
// ONLY for descendants whose box is actually marked (in `markedConsequences`), so unchecking a parent
// never reverses an effect a never-marked child never applied. `markedConsequences` is the entry's
// pre-toggle marked map.
export const applyConsequenceActions = (
  arcanum: MajorArcanum,
  consequenceId: string,
  checked: boolean,
  markedConsequences: Record<string, boolean>,
): ConsequenceActionResult => {
  const consequence = findConsequence(arcanum, consequenceId);
  if (!consequence)
    return { dataPatch: {}, statDeltas: {}, clearedConsequenceIds: [] };

  // The toggled consequence is always processed (it's the one being flipped). On uncheck we also reverse
  // each descendant — but only those actually marked, so a never-marked child's action isn't "undone".
  const descendantIds = collectDescendantIds(consequence);
  const targetIds = checked
    ? [consequenceId]
    : [consequenceId, ...descendantIds.filter((id) => markedConsequences[id])];

  const dataPatch: Partial<CharacterData> = {};
  const statDeltas: StatDeltas = {};

  for (const id of targetIds) {
    for (const action of findConsequence(arcanum, id)?.actions ?? []) {
      applyOne(action, checked, dataPatch, statDeltas);
    }
  }

  // Only the descendants are reported as cleared — the toggled consequence's own mark is set by the
  // caller from `checked`. All descendants clear (the tree collapses); the actually-marked subset
  // above governs only which effects get reversed.
  return {
    dataPatch,
    statDeltas,
    clearedConsequenceIds: checked ? [] : descendantIds,
  };
};

// Applies a single action, mutating the accumulating `dataPatch` (absolute fields) and `statDeltas`
// (signed additive stats). The cascade across a consequence's descendants is handled by
// applyConsequenceActions, not here.
const applyOne = (
  action: ConsequenceAction,
  checked: boolean,
  dataPatch: Partial<CharacterData>,
  statDeltas: StatDeltas,
): void => {
  switch (action.type) {
    case "permanentDebility": {
      const { marked, locked } = DEBILITY_FIELDS[action.debility];
      // Marking checks and locks the box; unmarking clears both so the player regains control.
      dataPatch[marked] = checked;
      dataPatch[locked] = checked;
      return;
    }
    case "setInstinct":
      // No write: a replaced instinct is derived read-only from marked state (see
      // getMarkedInstinctOverride) and shown as an override note in the Instinct section, so there's
      // nothing to persist or restore. The PC's own instinct fields are left untouched.
      return;
    case "setFollowerCost":
      // No write: like setInstinct, a replaced follower Cost is derived read-only from marked state
      // (see getMarkedFollowerCost) and applied to the follower card at render, so nothing persists.
      return;
    case "widenDots":
      // No write: the dot-control widening is derived read-only from marked state by useArcanumGating's
      // dotBonusFor (which reads this action alongside a move's grantsDotBonus), so nothing persists.
      return;
    case "armor":
    case "maxHp": {
      // Additive stat deltas (Armor, HP): add the amount on mark, subtract it on unmark. Accumulated as
      // a signed delta and applied by the caller against the stored value inside a transaction, so
      // rapid toggles or a stale snapshot can't land the stat on the wrong number.
      const field = action.type === "armor" ? "statArmor" : "statHp";
      const delta = checked ? action.amount : -action.amount;
      statDeltas[field] = (statDeltas[field] ?? 0) + delta;
      return;
    }
    default:
      // Creature-side actions (addTag, replaceQuality, …) touch the arcanum's creature, not the PC
      // sheet, so they write nothing here — the projection in lib/creatureMutations.ts applies them.
      return;
  }
};

// The replacement Instinct imposed by a currently-marked consequence, if any (e.g. the Lidless Orb's
// "Disgust"). Derived read-only from marked state rather than written to the PC's instinct fields, so
// the Instinct section can show it as an override note and the player's own instinct is never clobbered.
// Returns the first such text found, or undefined when no instinct-replacing consequence is marked.
export const getMarkedInstinctOverride = (
  data: CharacterData | undefined,
): string | undefined => {
  for (const entry of data?.arcanaMajor ?? []) {
    const arcanum = MAJOR_ARCANA.find((m) => m.id === entry.id);
    if (!arcanum) continue;
    for (const [consequenceId, marked] of Object.entries(
      entry.consequencesMarked ?? {},
    )) {
      if (!marked) continue;
      const action = findConsequence(arcanum, consequenceId)?.actions?.find(
        (a) => a.type === "setInstinct",
      );
      if (action?.type === "setInstinct") return action.text;
    }
  }
  return undefined;
};

// The replacement Cost imposed on a back follower by a currently-marked consequence, if any (e.g. the
// Ring of Daagon's `daagon-c4`). Derived read-only from marked state rather than persisted — the
// follower card shows it in place of the seed cost. Returns undefined when no such consequence is marked.
export const getMarkedFollowerCost = (
  arcanum: MajorArcanum,
  markedConsequences: Record<string, boolean>,
  followerId: string,
): string | undefined => {
  for (const [consequenceId, marked] of Object.entries(
    markedConsequences ?? {},
  )) {
    if (!marked) continue;
    const action = findConsequence(arcanum, consequenceId)?.actions?.find(
      (a) => a.type === "setFollowerCost" && a.followerId === followerId,
    );
    if (action?.type === "setFollowerCost") return action.text;
  }
  return undefined;
};
