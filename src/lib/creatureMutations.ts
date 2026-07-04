import type {
  Creature,
  CreatureEffect,
  CreatureQuality,
  ConsequenceAction,
  ConsequenceTable,
} from "@/types";

// The projection reads only the creature-mutating parts of a consequence (never its prose), so it works
// on either consequence shape without per-shape branching:
//   • legacy mystery consequences (`text`) carry creature effects on `effects`;
//   • back consequences (`value`) carry them among their `actions` (a superset that also holds PC ops).
// A back consequence's creature ops are extracted from `actions`; PC ops are ignored here (they're
// applied by lib/consequenceActions.ts, not the projection).
interface ProjectableConsequence {
  id: string;
  effects?: CreatureEffect[];
  actions?: ConsequenceAction[];
  table?: ConsequenceTable;
  children?: { id: string; effects?: CreatureEffect[]; actions?: ConsequenceAction[] }[];
}

// The `type`s that mutate the creature (as opposed to the PC). A ConsequenceAction of one of these is
// structurally a CreatureEffect, so the projection can apply it directly.
const CREATURE_OPS = new Set<ConsequenceAction["type"]>([
  "addTag",
  "removeTag",
  "replaceTag",
  "addMove",
  "replaceQuality",
]);

// The creature effects a consequence contributes, from whichever field carries them: a mystery
// consequence's `effects`, plus the creature-op subset of a back consequence's `actions`.
// A type guard (not a bare filter) so the compiler verifies a kept action really is a CreatureEffect,
// rather than trusting a cast — a renamed op then fails to compile instead of silently slipping through.
const isCreatureEffect = (a: ConsequenceAction): a is CreatureEffect =>
  CREATURE_OPS.has(a.type);

const creatureEffectsOf = (c: {
  effects?: CreatureEffect[];
  actions?: ConsequenceAction[];
}): CreatureEffect[] => [
  ...(c.effects ?? []),
  ...(c.actions ?? []).filter(isCreatureEffect),
];

// Creature tags are stored as a single comma-separated string (e.g. "large, construct, meek").
// These helpers parse to a list and rejoin so callers work with individual tags.
const splitTags = (tags: string | undefined): string[] =>
  (tags ?? "")
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean);

const joinTags = (tags: string[]): string => tags.join(", ");

export const addTag = (creature: Creature, tag: string): Creature => {
  const tags = splitTags(creature.tags);
  if (tags.includes(tag)) return creature;
  return { ...creature, tags: joinTags([...tags, tag]) };
};

export const removeTag = (creature: Creature, tag: string): Creature => ({
  ...creature,
  tags: joinTags(splitTags(creature.tags).filter((t) => t !== tag)),
});

export const replaceTag = (
  creature: Creature,
  from: string,
  to: string,
): Creature => {
  const tags = splitTags(creature.tags);
  if (!tags.includes(from)) return creature;
  return {
    ...creature,
    tags: joinTags(tags.map((t) => (t === from ? to : t))),
  };
};

export const addMove = (creature: Creature, move: string): Creature => {
  const moves = creature.moves ?? [];
  if (moves.includes(move)) return creature;
  return { ...creature, moves: [...moves, move] };
};

export const replaceQuality = (
  creature: Creature,
  label: string,
  value: string,
): Creature => {
  const qualities: CreatureQuality[] = (creature.qualities ?? []).map((q) =>
    q.label === label ? { ...q, value } : q,
  );
  return { ...creature, qualities };
};

const applyEffect = (creature: Creature, effect: CreatureEffect): Creature => {
  switch (effect.type) {
    case "addTag":
      return addTag(creature, effect.tag);
    case "removeTag":
      return removeTag(creature, effect.tag);
    case "replaceTag":
      return replaceTag(creature, effect.from, effect.to);
    case "addMove":
      return addMove(creature, effect.move);
    case "replaceQuality":
      return replaceQuality(creature, effect.label, effect.value);
  }
};

// Fold a list of effects onto a creature in order. Because book-data fields are always rebuilt from
// the seed plus every currently-marked consequence, applying is the only operation needed — there is
// no separate revert; unchecking a box just drops its effects from the next rebuild.
export const applyEffects = (
  creature: Creature,
  effects: CreatureEffect[],
): Creature => effects.reduce(applyEffect, creature);

// Gather the effects of every marked consequence (and marked child), plus the effect of any picked
// roll-table row, in document order.
const collectEffects = (
  consequences: ProjectableConsequence[],
  marked: Record<string, boolean>,
  tableChoice: Record<string, string>,
): CreatureEffect[] => {
  const effects: CreatureEffect[] = [];
  for (const c of consequences) {
    if (marked[c.id]) {
      effects.push(...creatureEffectsOf(c));
      // A roll-table pick only applies while its consequence is marked; unmarking reverts it.
      if (c.table) {
        const row = c.table.rows.find((r) => r.id === tableChoice[c.id]);
        if (row) effects.push(row.effect);
      }
    }
    for (const child of c.children ?? []) {
      if (marked[child.id]) effects.push(...creatureEffectsOf(child));
    }
  }
  return effects;
};

// Rebuild a creature's book-data fields (tags, moves, qualities) from the seed plus the effects of
// every currently-marked consequence, while preserving the player's own inputs (HP, armor, loyalty).
// This is the single source of truth: toggling any consequence recomputes from scratch, so effects
// are reversible without tracking prior values.
export const projectCreature = (
  seed: Creature,
  saved: Creature | undefined,
  consequences: ProjectableConsequence[],
  marked: Record<string, boolean>,
  tableChoice: Record<string, string>,
): Creature => {
  const projected = applyEffects(
    seed,
    collectEffects(consequences, marked, tableChoice),
  );
  // Carry the player's editable fields over the freshly projected book data, defaulting HP to full
  // until the player has set a value of their own.
  return {
    ...projected,
    hp: saved?.hp ?? projected.hpMax,
    armor: saved?.armor ?? projected.armor,
    loyalty: saved?.loyalty ?? projected.loyalty,
  };
};
