import { useMemo } from "react";
import { projectCreature } from "@/lib/creatureMutations";
import type {
  Creature,
  MajorArcanum,
  ArcanaMajorEntry,
  RightControlSpec,
} from "@/types";
import { markIdsFor } from "./arcanaParsing";

type MysteryMove = MajorArcanum["mystery"]["moves"][number];

// The gated state of one mystery move: its lock reasons (empty when available) and any dot-control
// widening. Computed together so each move's pair of props comes from one stable object.
interface MoveGating {
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
  // The checked state of each mark box of a consequence, in box order, for ConsequenceRow.
  getConsequenceCheckedMarks: (id: string, text: string) => boolean[];
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
  const { marks, mystery } = arcanum;
  const unlocked = entry.marksValue >= (marks.unlockAt ?? marks.max);

  const getConsequenceCheckedMarks = (id: string, text: string): boolean[] =>
    markIdsFor(id, text).map((markId) => !!entry.consequencesMarked[markId]);

  // The lock reasons and dot override for every mystery move, computed once per relevant state change
  // into a map. Memoizing here keeps each move's arrays referentially stable across re-renders that
  // don't touch this card's gated state (a keystroke elsewhere, a snapshot echo), so MysteryMoveBlock's
  // memo holds. The map only rebuilds when marks or the checked maps actually change.
  const moveGatingById = useMemo(() => {
    // Budget gate for sub-moves that require a parent move (e.g. Noruba's Ice Sphere): the book grants
    // one such move "for every 2 Consequences you mark", so the number of selectable sub-moves is
    // floor(markedConsequences / 2), and a sub-move is locked while its parent is unselected or once
    // the grant budget is spent. Each box of a multi-mark consequence is its own markable id, so a
    // 3-box consequence contributes up to 3 toward that budget.
    const consequenceIds = mystery.consequences.flatMap((c) => [
      ...markIdsFor(c.id, c.text),
      ...(c.children?.flatMap((child) => markIdsFor(child.id, child.text)) ?? []),
    ]);
    const markedConsequenceCount = consequenceIds.filter(
      (id) => entry.consequencesMarked[id],
    ).length;
    const consequenceGrants = Math.floor(markedConsequenceCount / 2);
    const selectedSubMoves = mystery.moves.filter(
      (m) =>
        "requires" in m && m.requires?.length && entry.mysteryMovesChecked[m.id],
    ).length;

    const requirementFor = (move: MysteryMove): string[] => {
      // A move granted at a marks threshold (e.g. the Codex's Darksome Vessel at all 4) stays locked
      // until that many marks are filled on the arcanum's marks track.
      if ("requiresMarks" in move && move.requiresMarks) {
        if (entry.marksValue < move.requiresMarks) {
          return [
            `Make ${move.requiresMarks === marks.max ? "the last mark" : `${move.requiresMarks} marks`}`,
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
        .filter((id) => !entry.mysteryMovesChecked[id])
        .map((id) => mystery.moves.find((m) => m.id === id)?.name ?? id);
      if (unmetParents.length > 0) return [`Requires ${unmetParents.join(", ")}`];
      if (selectedSubMoves >= consequenceGrants) return ["Mark 2 more Consequences"];
      return [];
    };

    // A sub-move listed in mystery.dotBonuses widens its target's dot control by 1 once selected
    // (e.g. A Mighty Will → Mindwalking's Power). Undefined when no active bonus applies.
    const dotOverrideFor = (
      move: MysteryMove,
    ): RightControlSpec[] | undefined => {
      const base = "rightControl" in move ? move.rightControl : undefined;
      if (!base) return undefined;
      const hasBonus = (mystery.dotBonuses ?? []).some(
        (b) => b.targetId === move.id && entry.mysteryMovesChecked[b.sourceId],
      );
      if (!hasBonus) return undefined;
      return base.map((spec) => ({ ...spec, number: (spec.number ?? 1) + 1 }));
    };

    return new Map<string, MoveGating>(
      mystery.moves.map((move) => [
        move.id,
        { requirement: requirementFor(move), dotOverride: dotOverrideFor(move) },
      ]),
    );
  }, [
    mystery.moves,
    mystery.consequences,
    mystery.dotBonuses,
    entry.marksValue,
    entry.consequencesMarked,
    entry.mysteryMovesChecked,
    marks.max,
  ]);

  const getMoveGating = (move: MysteryMove): MoveGating =>
    moveGatingById.get(move.id) ?? EMPTY_GATING;

  // The creature's book data is a projection of the seed plus every marked consequence; recompute it
  // only when the seed or marked state changes so the memo on MysteryCreatureCard holds.
  const projectedCreature = useMemo(
    () =>
      mystery.mysteryCreature
        ? projectCreature(
            mystery.mysteryCreature,
            entry.mysteryCreature,
            mystery.consequences,
            entry.consequencesMarked,
            entry.consequenceTableChoice ?? {},
          )
        : undefined,
    [
      mystery.mysteryCreature,
      mystery.consequences,
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
