import { memo, useCallback } from "react";
import { Checkbox, Text } from "@/components/ui";
import { parseMarkdown } from "@/lib/parseMarkdown";
import type {
  MajorArcanaMysteryMove,
  MoveDefinition,
  RightControlSpec,
} from "@/types";
import { Move } from "../../../Move";
import { ArcanaTrackerRow } from "../ArcanaTrackerRow";
import { ArcanaFollowerBlock } from "../ArcanaFollowerBlock";
import { isMoveDefinition } from "../arcanaParsing";
import styles from "../arcanaCard.module.css";

interface MysteryMoveBlockProps {
  move: MajorArcanaMysteryMove | MoveDefinition;
  checked: boolean;
  trackerValue?: number;
  followerHp?: number[];
  bodyChecks?: Record<string, boolean>;
  // Lock reasons shown under a Move-shaped entry when its prerequisites aren't met; empty when unlocked.
  requirement?: string[];
  // Overrides the move's own rightControl specs — used to widen Mindwalking's Power dots dynamically.
  rightControlOverride?: RightControlSpec[];
  onToggle: (id: string, checked: boolean) => void;
  onTrackerChange: (id: string, value: number) => void;
  onFollowerHpChange: (id: string, index: number, value: number) => void;
  onBodyCheckChange: (moveId: string, itemId: string, checked: boolean) => void;
}

export const MysteryMoveBlock = memo(
  ({
    move,
    checked,
    trackerValue,
    followerHp,
    bodyChecks,
    requirement,
    rightControlOverride,
    onToggle,
    onTrackerChange,
    onFollowerHpChange,
    onBodyCheckChange,
  }: MysteryMoveBlockProps) => {
    const handleToggle = useCallback(
      (e: React.ChangeEvent<HTMLInputElement>) =>
        onToggle(move.id, e.target.checked),
      [move.id, onToggle],
    );
    const handleTracker = useCallback(
      (value: number) => onTrackerChange(move.id, value),
      [move.id, onTrackerChange],
    );
    const handleFollowerHp = useCallback(
      (index: number, value: number) =>
        onFollowerHpChange(move.id, index, value),
      [move.id, onFollowerHpChange],
    );
    const handleBodyCheck = useCallback(
      (itemId: string, value: boolean) =>
        onBodyCheckChange(move.id, itemId, value),
      [move.id, onBodyCheckChange],
    );

    // A move shows a select box when it's one the player activates by choice: either it's one of a
    // budgeted set (has `requires`), or a back move explicitly flagged `selectable`. Every other move is
    // granted outright once the arcanum unlocks — it is already activated, so it shows no checkbox.
    const isSelectable =
      ("requires" in move && !!move.requires?.length) ||
      ("selectable" in move && !!move.selectable);
    // A granted move gated on a Consequence threshold stays display-only (inactive, no box) until the
    // threshold is met; only then is it `defaultChecked` (always-on). `requirement` carries the reason.
    const isLockedGrant = !isSelectable && (requirement?.length ?? 0) > 0;

    // Move-shaped entries render through the shared Move component: a selectable move's select box maps
    // to the mystery-move checked state; a granted move is `defaultChecked` (always-on, no box). Either
    // way rightControl dots persist via the same tracker path.
    if (isMoveDefinition(move)) {
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
    }

    const titleBlock = (
      <div className={styles.mysteryMoveTitle}>
        <Text as="span" font="serif" weight="bold">
          {move.name}
        </Text>
        {move.subtitle && (
          <Text as="span" font="serif" italic color="muted">
            {move.subtitle}
          </Text>
        )}
      </div>
    );

    return (
      <div>
        {isSelectable ? (
          <label className={styles.mysteryMoveHeader}>
            <Checkbox checked={checked} onChange={handleToggle} />
            {titleBlock}
          </label>
        ) : (
          <div className={styles.mysteryMoveHeader}>{titleBlock}</div>
        )}

        {move.tracker && (
          <ArcanaTrackerRow
            label={move.tracker.label}
            total={move.tracker.max}
            checked={trackerValue ?? 0}
            onChange={handleTracker}
          />
        )}

        <div className={styles.moveText}>{parseMarkdown(move.text)}</div>

        {move.follower && (
          <ArcanaFollowerBlock
            arcanaId={move.id}
            follower={move.follower}
            followerHp={followerHp}
            onFollowerHpChange={handleFollowerHp}
          />
        )}
      </div>
    );
  },
);
