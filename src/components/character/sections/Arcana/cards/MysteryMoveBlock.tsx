import { memo, useCallback } from "react";
import type { MoveDefinition, RightControlSpec } from "@/types";
import { Move } from "../../../Move";

interface MysteryMoveBlockProps {
  move: MoveDefinition;
  checked: boolean;
  trackerValue?: number;
  bodyChecks?: Record<string, boolean>;
  // Lock reasons shown under a Move-shaped entry when its prerequisites aren't met; empty when unlocked.
  requirement?: string[];
  // Overrides the move's own rightControl specs — used to widen Mindwalking's Power dots dynamically.
  rightControlOverride?: RightControlSpec[];
  onToggle: (id: string, checked: boolean) => void;
  onTrackerChange: (id: string, value: number) => void;
  onBodyCheckChange: (moveId: string, itemId: string, checked: boolean) => void;
}

// Renders a MoveDefinition-shaped arcana move through the shared Move component: a selectable move's
// select box maps to the mystery-move checked state; a granted move is `defaultChecked` (always-on, no
// box). rightControl dots persist via the same tracker path either way.
export const MysteryMoveBlock = memo(
  ({
    move,
    checked,
    trackerValue,
    bodyChecks,
    requirement,
    rightControlOverride,
    onToggle,
    onTrackerChange,
    onBodyCheckChange,
  }: MysteryMoveBlockProps) => {
    const handleTracker = useCallback(
      (value: number) => onTrackerChange(move.id, value),
      [move.id, onTrackerChange],
    );
    const handleBodyCheck = useCallback(
      (itemId: string, value: boolean) =>
        onBodyCheckChange(move.id, itemId, value),
      [move.id, onBodyCheckChange],
    );

    // A move shows a select box when it's one the player activates by choice: either it's one of a
    // budgeted set (has `requires`), or a back move explicitly flagged `selectable`. Every other move is
    // granted outright once the arcanum unlocks — it is already activated, so it shows no checkbox.
    const isSelectable = !!move.requires?.length || !!move.selectable;
    // A granted move gated on a Consequence threshold stays display-only (inactive, no box) until the
    // threshold is met; only then is it `defaultChecked` (always-on). `requirement` carries the reason.
    const isLockedGrant = !isSelectable && (requirement?.length ?? 0) > 0;

    const rightSpecs = rightControlOverride ?? move.rightControl;
    return (
      <Move
        title={move.name}
        move={move}
        requirement={requirement}
        defaultChecked={!isSelectable && !isLockedGrant}
        selection={
          isSelectable
            ? {
                selected: checked,
                onSelectChange: (next) => onToggle(move.id, next),
                takesChecked: 0,
                onTakesChange: () => {},
              }
            : undefined
        }
        rightControl={rightControlOverride}
        rightControlState={rightSpecs?.map(() => ({
          checked: trackerValue ?? 0,
          onChange: handleTracker,
        }))}
        bodyCheck={{ checked: bodyChecks ?? {}, onChange: handleBodyCheck }}
      />
    );
  },
);
