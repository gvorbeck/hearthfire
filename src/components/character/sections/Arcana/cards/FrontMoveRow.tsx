import { memo, useCallback } from "react";
import { Text } from "@/components/ui";
import { parseMarkdown } from "@/lib/parseMarkdown";
import type { ArcanaMove, MoveDefinition } from "@/types";
import { Move } from "../../../Move";
import { ArcanaTrackerRow } from "../ArcanaTrackerRow";
import { isMoveDefinition } from "../arcanaParsing";
import styles from "../arcanaCard.module.css";

interface FrontMoveRowProps {
  move: ArcanaMove | MoveDefinition;
  trackerValue: number;
  onTrackerChange: (moveId: string, value: number) => void;
}

export const FrontMoveRow = memo(
  ({ move, trackerValue, onTrackerChange }: FrontMoveRowProps) => {
    // A MoveDefinition front move (e.g. the Codex's "Cast a Codex Spell") renders through the shared
    // Move component as an always-on granted move so its dot controls stay live; its tracker persists
    // under move.id, like mystery moves.
    const handleMoveTracker = useCallback(
      (v: number) =>
        onTrackerChange(isMoveDefinition(move) ? move.id : move.name, v),
      [move, onTrackerChange],
    );
    if (isMoveDefinition(move)) {
      return (
        <Move
          title={move.name}
          move={move}
          defaultChecked
          rightControlState={move.rightControl?.map(() => ({
            checked: trackerValue,
            onChange: handleMoveTracker,
          }))}
        />
      );
    }
    // The rulebook prints terse moves as one inline sentence whose bold trigger opens the body
    // ("When you **draw the Sword**, it leaps…"). When `text` already carries that bold trigger we
    // skip the standalone name header so the sentence reads as one line, as printed.
    const hasInlineTrigger = move.text.startsWith("When you **");
    return (
      <div className={styles.frontMove}>
        {(!hasInlineTrigger || move.subtitle) && (
          <div className={styles.moveHeader}>
            {!hasInlineTrigger && (
              <Text font="serif" weight="bold">
                {move.name}
              </Text>
            )}
            {move.subtitle && (
              <Text font="serif" italic color="muted">
                {move.subtitle}
              </Text>
            )}
          </div>
        )}
        {move.tracker && (
          <ArcanaTrackerRow
            label={move.tracker.label}
            total={move.tracker.max}
            checked={trackerValue}
            onChange={handleMoveTracker}
          />
        )}
        <div className={styles.moveText}>{parseMarkdown(move.text)}</div>
      </div>
    );
  },
);
