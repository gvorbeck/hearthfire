import { useMemo } from "react";
import { projectCreature } from "@/lib/creatureMutations";
import type {
  ArcanaConsequence,
  ArcanaSection,
  Creature,
  MajorArcanum,
  MajorArcanaMystery,
  ArcanaMajorEntry,
  MoveDefinition,
  RightControlSpec,
} from "@/types";
import { consequenceMarkId, markIdsFor } from "./arcanaParsing";

type MysteryMove = MajorArcanaMystery["moves"][number];

// A consequence flattened to what the gating math needs: an id and its mark-box ids. Mystery
// consequences derive box ids from the ◻-glyph prefix in their text; back consequences from `checkboxes`.
interface FlatConsequence {
  id: string;
  markIds: string[];
}

// Back sections mix MoveDefinitions, ArcanaConsequences, and follower entries; these split a section's
// content by kind so back moves can be gated and back consequences counted alongside the legacy mystery
// ones. Followers carry `follower`, moves carry `body`, consequences carry `value`.
type BackEntry = ArcanaSection["content"][number];
const isBackConsequence = (entry: BackEntry): entry is ArcanaConsequence =>
  "value" in entry;
const isBackMove = (entry: BackEntry): entry is MoveDefinition =>
  "body" in entry;

// Every back consequence (and its nested children, recursively), each with its mark-box ids derived
// from its `checkboxes` count (default 1).
const flattenBackConsequences = (
  consequences: ArcanaConsequence[],
): FlatConsequence[] =>
  consequences.flatMap((c) => [
    {
      id: c.id,
      markIds: Array.from({ length: c.checkboxes ?? 1 }, (_, i) =>
        consequenceMarkId(c.id, i),
      ),
    },
    ...flattenBackConsequences(c.children ?? []),
  ]);

// The gated state of one mystery move: its lock reasons (empty when available) and any dot-control
// widening. Computed together so each move's pair of props comes from one stable object.
export interface MoveGating {
  requirement: string[];
  dotOverride: RightControlSpec[] | undefined;
}

// Stable singleton for moves not present in the gating map; sharing one reference keeps the consumer's
// memo from breaking on a fresh empty object each render.
const EMPTY_GATING: MoveGating = { requirement: [], dotOverride: undefined };

export interface ArcanumGating {
  unlocked: boolean;
  // The creature's book data projected from its seed plus every marked consequence, with the
  // player's saved HP/armor/loyalty merged in. Undefined when the arcanum has no mystery creature.
  projectedCreature: Creature | undefined;
  // The checked state of each mark box of a consequence, in box order, for ConsequenceRow. `count`
  // overrides the box count (back consequences); omitted falls back to the text's ◻-glyph prefix.
  getConsequenceCheckedMarks: (id: string, text: string, count?: number) => boolean[];
  // The lock reasons and dot override for a mystery move, looked up by id from a memoized map so the
  // arrays stay referentially stable across unrelated re-renders (keeping MysteryMoveBlock's memo).
  getMoveGating: (move: MysteryMove) => MoveGating;
}

// Derives every gated/computed value the card's mystery section needs from the arcanum's book data
// (`arcanum`) and the player's saved state (`entry`): unlock state, the projected creature, per-box
// checked state, per-move lock reasons, and dot-control bonuses. Keeping this rules engine out of the
// render body lets the card stay a thin presenter and lets these rules be reasoned about on their own.
export const useArcanumGating = (
  arcanum: MajorArcanum,
  entry: ArcanaMajorEntry,
): ArcanumGating => {
  const { frontTrackers, mystery, back } = arcanum;
  // The unlock track is the front tracker with role "marks"; its value lives on entry.marksValue.
  const marksTracker = frontTrackers.find((t) => t.role === "marks");
  const marksMax = marksTracker?.max ?? 0;
  const unlocked = entry.marksValue >= (marksTracker?.unlockAt ?? marksMax);

  // Gating runs over both shapes during the migration: a move or consequence is subject to the same
  // lock rules whether it was authored under `mystery` or in a `back` section.
  const allMoves: MysteryMove[] = useMemo(() => {
    const backMoves = (back?.sections ?? []).flatMap((s) =>
      s.content.filter(isBackMove),
    );
    return [...(mystery?.moves ?? []), ...backMoves];
  }, [mystery?.moves, back]);

  const allConsequences: FlatConsequence[] = useMemo(() => {
    const mysteryFlat = (mystery?.consequences ?? []).flatMap((c) => [
      { id: c.id, markIds: markIdsFor(c.id, c.text) },
      ...(c.children?.map((child) => ({
        id: child.id,
        markIds: markIdsFor(child.id, child.text),
      })) ?? []),
    ]);
    const backFlat = (back?.sections ?? []).flatMap((s) =>
      flattenBackConsequences(
        s.content.filter(isBackConsequence),
      ),
    );
    return [...mysteryFlat, ...backFlat];
  }, [mystery?.consequences, back]);

  // The checked state of each mark box, in order. Box count comes from `count` when given (back
  // consequences, via their `checkboxes`), else from the legacy ◻-glyph prefix in the text (mystery).
  const getConsequenceCheckedMarks = (
    id: string,
    text: string,
    count?: number,
  ): boolean[] => {
    const markIds =
      count !== undefined
        ? Array.from({ length: count }, (_, i) => consequenceMarkId(id, i))
        : markIdsFor(id, text);
    return markIds.map((markId) => !!entry.consequencesMarked[markId]);
  };

  // The lock reasons and dot override for every mystery move, computed once per relevant state change
  // into a map. Memoizing here keeps each move's arrays referentially stable across re-renders that
  // don't touch this card's gated state (a keystroke elsewhere, a snapshot echo), so MysteryMoveBlock's
  // memo holds. The map only rebuilds when marks or the checked maps actually change.
  const moveGatingById = useMemo(() => {
    // Budget gate for sub-moves that require a parent move (e.g. Noruba's Ice Sphere): the book grants
    // one such move "for every N Consequences you mark", where N is the parent's `grantsPerConsequences`.
    // The number of selectable sub-moves is floor(markedConsequences / N), and a sub-move is locked while
    // its parent is inactive or once the grant budget is spent. Each box of a multi-mark consequence is
    // its own markable id, so a 3-box consequence contributes up to 3 toward that budget.
    const consequenceIds = allConsequences.flatMap((c) => c.markIds);
    const markedConsequenceCount = consequenceIds.filter(
      (id) => entry.consequencesMarked[id],
    ).length;
    const grantEvery = allMoves.reduce<number | undefined>(
      (found, m) =>
        found ?? ("grantsPerConsequences" in m ? m.grantsPerConsequences : undefined),
      undefined,
    );
    const consequenceGrants = grantEvery
      ? Math.floor(markedConsequenceCount / grantEvery)
      : 0;
    const selectedSubMoves = allMoves.filter(
      (m) =>
        "requires" in m && m.requires?.length && entry.mysteryMovesChecked[m.id],
    ).length;

    // A parent named in a child's `requires` counts as met when the player has checked it, or when it's
    // a base move flagged `autoActivateOnUnlock` and the arcanum is unlocked (it's already active and
    // shows no checkbox, so it would otherwise block its children forever).
    const isParentMet = (parentId: string): boolean => {
      if (entry.mysteryMovesChecked[parentId]) return true;
      const parent = allMoves.find((m) => m.id === parentId);
      return !!(parent && "autoActivateOnUnlock" in parent && parent.autoActivateOnUnlock && unlocked);
    };

    const requirementFor = (move: MysteryMove): string[] => {
      // A move granted at a marks threshold (e.g. the Codex's Darksome Vessel at all 4) stays locked
      // until that many marks are filled on the arcanum's marks track.
      if ("requiresMarks" in move && move.requiresMarks) {
        if (entry.marksValue < move.requiresMarks) {
          return [
            `Make ${move.requiresMarks === marksMax ? "the last mark" : `${move.requiresMarks} marks`}`,
          ];
        }
        return [];
      }
      // A move granted at a Consequence threshold (e.g. A Flickering Flame at 3) stays locked until
      // that many Consequences are marked.
      if ("requiresConsequences" in move && move.requiresConsequences) {
        if (markedConsequenceCount < move.requiresConsequences) {
          return [`Mark ${move.requiresConsequences} Consequences`];
        }
        return [];
      }
      if (!("requires" in move) || !move.requires?.length) return [];
      if (entry.mysteryMovesChecked[move.id]) return [];
      const unmetParents = move.requires
        .filter((id) => !isParentMet(id))
        .map((id) => allMoves.find((m) => m.id === id)?.name ?? id);
      if (unmetParents.length > 0) return [`Requires ${unmetParents.join(", ")}`];
      if (selectedSubMoves >= consequenceGrants) {
        // The next grant unlocks once the marked count reaches the next multiple of the ratio, so name
        // the exact remaining count (1..grantEvery), not the full ratio.
        const needed = (selectedSubMoves + 1) * (grantEvery ?? 2) - markedConsequenceCount;
        return [`Mark ${needed} more ${needed === 1 ? "Consequence" : "Consequences"}`];
      }
      return [];
    };

    // A move declaring `grantsDotBonus` widens its target's dot control while it's selected (e.g. A
    // Mighty Will → Mindwalking's Power +1). Sum the amount across every selected granting move, so a
    // target with two active bonuses widens by both. Undefined when no active bonus applies.
    const dotBonusFor = (targetId: string): number =>
      allMoves.reduce((sum, m) => {
        if (!("grantsDotBonus" in m) || !m.grantsDotBonus) return sum;
        if (m.grantsDotBonus.targetId !== targetId) return sum;
        return entry.mysteryMovesChecked[m.id] ? sum + m.grantsDotBonus.amount : sum;
      }, 0);

    const dotOverrideFor = (
      move: MysteryMove,
    ): RightControlSpec[] | undefined => {
      const base = "rightControl" in move ? move.rightControl : undefined;
      if (!base) return undefined;
      const bonus = dotBonusFor(move.id);
      if (bonus === 0) return undefined;
      return base.map((spec) => ({ ...spec, number: (spec.number ?? 1) + bonus }));
    };

    return new Map<string, MoveGating>(
      allMoves.map((move) => [
        move.id,
        { requirement: requirementFor(move), dotOverride: dotOverrideFor(move) },
      ]),
    );
  }, [
    allMoves,
    allConsequences,
    entry.marksValue,
    entry.consequencesMarked,
    entry.mysteryMovesChecked,
    marksMax,
    unlocked,
  ]);

  const getMoveGating = (move: MysteryMove): MoveGating =>
    moveGatingById.get(move.id) ?? EMPTY_GATING;

  // The creature's book data is a projection of the seed plus every marked consequence; recompute it
  // only when the seed or marked state changes so the memo on MysteryCreatureCard holds.
  // Sub-paths hoisted into consts so the memo deps match what the React Compiler
  // infers (bare bindings, not two `mystery?.x` optional-chains it collapses to
  // `mystery`), letting it optimize this component instead of skipping it.
  const mysteryCreature = mystery?.mysteryCreature;
  const mysteryConsequences = mystery?.consequences;
  const projectedCreature = useMemo(
    () =>
      mysteryCreature
        ? projectCreature(
            mysteryCreature,
            entry.mysteryCreature,
            mysteryConsequences ?? [],
            entry.consequencesMarked,
            entry.consequenceTableChoice ?? {},
          )
        : undefined,
    [
      mysteryCreature,
      mysteryConsequences,
      entry.mysteryCreature,
      entry.consequencesMarked,
      entry.consequenceTableChoice,
    ],
  );

  return {
    unlocked,
    projectedCreature,
    getConsequenceCheckedMarks,
    getMoveGating,
  };
};
