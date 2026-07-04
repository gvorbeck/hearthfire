import type {
  ArcanaConsequence,
  CharacterData,
  ConsequenceAction,
  DebilityType,
  MajorArcanum,
} from "@/types";
import { MAJOR_ARCANA } from "@/lib/arcanaMajor";

// The central place where a consequence checkbox's side effects are applied. A consequence can carry
// `actions` (see ConsequenceAction); marking the box runs them and unmarking reverses them. Each action
// type maps to a CharacterData patch here, so adding a new cross-section effect is one union member
// (in types) plus one case below — no new wiring in the panel.

const DEBILITY_FIELDS: Record<
  DebilityType,
  { marked: keyof CharacterData; locked: keyof CharacterData }
> = {
  weakened: { marked: "debilityWeakened", locked: "debilityWeakenedLocked" },
  dazed: { marked: "debilityDazed", locked: "debilityDazedLocked" },
  miserable: { marked: "debilityMiserable", locked: "debilityMiserableLocked" },
};

// Locate a consequence (top-level or child) by id across the arcanum's back sections and its legacy
// mystery consequences, so a toggle is resolved the same way regardless of which shape authored it.
// The index is built once per arcanum and cached against the (stable) arcanum object, so repeated
// toggles are O(1) lookups instead of re-walking every section and consequence tree each time.
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
    addTree(section.content.filter((entry): entry is ArcanaConsequence => "value" in entry));
  }

  // Legacy mystery consequences use `text` rather than `value`; normalize to the back shape so the
  // same action plumbing works while arcana are mid-migration. An arcanum mid-migration may carry both
  // shapes with shared ids; `back` is authoritative (it's what renders), so never let a mystery entry
  // overwrite an id already indexed from `back`.
  const addIfAbsent = (consequence: ArcanaConsequence): void => {
    if (!index.has(consequence.id)) index.set(consequence.id, consequence);
  };
  for (const c of arcanum.mystery?.consequences ?? []) {
    addIfAbsent({ id: c.id, value: c.text });
    for (const child of c.children ?? []) {
      addIfAbsent({
        id: child.id,
        value: child.text,
        actions: child.setsInstinct
          ? [{ type: "setInstinct", text: child.setsInstinct }]
          : undefined,
      });
    }
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

export interface ConsequenceActionResult {
  // Fields to write to the character (debility flags, Armor), or {} when nothing changes.
  dataPatch: Partial<CharacterData>;
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
  return !!consequence.actions?.length || collectDescendantIds(consequence).length > 0;
};

// The live character fields an action may read to compute its patch (e.g. the current Instinct to
// stash, the current Armor to add to). Passed once; the dispatcher threads running values through a
// multi-action pass so additive effects stack instead of clobbering each other.
export interface ConsequenceActionContext {
  // The current Armor stat, so an armor action can add/subtract relative to it.
  armor: string;
}

// Compute the character patch, entry bookkeeping, and cascade for marking/unmarking a consequence.
// Marking runs the consequence's own actions. Unchecking also reverses every descendant's actions and
// reports their ids, since a child can't remain marked once its parent is cleared. `ctx` carries the
// live character fields actions read (Instinct, Armor); pass current values.
export const applyConsequenceActions = (
  arcanum: MajorArcanum,
  consequenceId: string,
  checked: boolean,
  ctx: ConsequenceActionContext,
): ConsequenceActionResult => {
  const consequence = findConsequence(arcanum, consequenceId);
  if (!consequence) return { dataPatch: {}, clearedConsequenceIds: [] };

  // On uncheck, the toggled consequence plus all its descendants are reversed; on check, only itself.
  const targetIds = checked
    ? [consequenceId]
    : [consequenceId, ...collectDescendantIds(consequence)];

  let dataPatch: Partial<CharacterData> = {};

  for (const id of targetIds) {
    for (const action of findConsequence(arcanum, id)?.actions ?? []) {
      // Read the running value an action depends on: a field already patched this pass (so additive
      // armor stacks), falling back to the live value from ctx.
      const runningArmor = (dataPatch.statArmor as string | undefined) ?? ctx.armor;
      dataPatch = { ...dataPatch, ...applyOne(action, checked, { armor: runningArmor }) };
    }
  }

  // Only the descendants are reported as cleared — the toggled consequence's own mark is set by the
  // caller from `checked`.
  return {
    dataPatch,
    clearedConsequenceIds: checked ? [] : collectDescendantIds(consequence),
  };
};

// Applies a single action, returning just its character-field patch. The cascade across a
// consequence's descendants is handled by applyConsequenceActions, not here.
const applyOne = (
  action: ConsequenceAction,
  checked: boolean,
  ctx: ConsequenceActionContext,
): Partial<CharacterData> => {
  switch (action.type) {
    case "permanentDebility": {
      const { marked, locked } = DEBILITY_FIELDS[action.debility];
      // Marking checks and locks the box; unmarking clears both so the player regains control.
      return { [marked]: checked, [locked]: checked };
    }
    case "setInstinct":
      // No write: a replaced instinct is derived read-only from marked state (see
      // getMarkedInstinctOverride) and shown as an override note in the Instinct section, so there's
      // nothing to persist or restore. The PC's own instinct fields are left untouched.
      return {};
    case "armor": {
      // Additive: add the amount on mark, subtract it on unmark, relative to the running armor value.
      // No stash/lock — the box stays editable and the delta composes with manual edits and other grants.
      const current = Number(ctx.armor) || 0;
      const delta = checked ? action.amount : -action.amount;
      return { statArmor: String(current + delta) };
    }
    default:
      // Creature-side actions (addTag, replaceQuality, …) touch the arcanum's creature, not the PC
      // sheet, so they write nothing here — the projection in lib/creatureMutations.ts applies them.
      return {};
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
    for (const [consequenceId, marked] of Object.entries(entry.consequencesMarked)) {
      if (!marked) continue;
      const action = findConsequence(arcanum, consequenceId)?.actions?.find(
        (a) => a.type === "setInstinct",
      );
      if (action?.type === "setInstinct") return action.text;
    }
  }
  return undefined;
};
