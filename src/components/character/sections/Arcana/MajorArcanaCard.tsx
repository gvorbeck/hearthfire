import { Fragment } from "react";
import clsx from "clsx";
import { Divider, Text } from "@/components/ui";
import { UseDots } from "@/components/ui/UseDots/UseDots";
import { parseMarkdown } from "@/lib/parseMarkdown";
import type { MajorArcanum, ArcanaMajorEntry, Creature } from "@/types";
import { ArcanaCardHeader } from "./ArcanaCardHeader";
import { isMoveDefinition } from "./arcanaParsing";
import { useArcanumGating } from "./useArcanumGating";
import {
  ConsequenceRow,
  ConsequenceTableBlock,
  FrontMoveRow,
  MysteryCreatureCard,
  MysteryMoveBlock,
  TaskRow,
} from "./cards";
import styles from "./arcanaCard.module.css";

interface MajorArcanaCardProps {
  arcanum: MajorArcanum;
  entry: ArcanaMajorEntry;
  onMarksChange: (value: number) => void;
  onMysteryMoveToggle: (moveId: string, checked: boolean) => void;
  onConsequenceToggle: (consequenceId: string, checked: boolean) => void;
  onConsequenceTableChoice: (consequenceId: string, rowId: string) => void;
  onTrackerChange: (moveId: string, value: number) => void;
  onFollowerHpChange: (moveId: string, index: number, value: number) => void;
  onBodyCheckChange: (moveId: string, itemId: string, checked: boolean) => void;
  onMysteryCreatureSave: (creature: Creature) => void;
  onRemove: () => void;
}

export const MajorArcanaCard = ({
  arcanum,
  entry,
  onMarksChange,
  onMysteryMoveToggle,
  onConsequenceToggle,
  onConsequenceTableChoice,
  onTrackerChange,
  onFollowerHpChange,
  onBodyCheckChange,
  onMysteryCreatureSave,
  onRemove,
}: MajorArcanaCardProps) => {
  const { marks, mystery } = arcanum;
  const {
    unlocked,
    projectedCreature,
    getConsequenceCheckedMarks,
    getMoveGating,
  } = useArcanumGating(arcanum, entry);

  const cx = clsx(styles.card, unlocked && styles.cardUnlocked);

  return (
    <div className={cx}>
      <ArcanaCardHeader
        id={arcanum.id}
        name={arcanum.name}
        tags={arcanum.tags}
        onRemove={onRemove}
      />

      {arcanum.description && (
        <div className={styles.description}>
          {parseMarkdown(arcanum.description)}
        </div>
      )}

      {arcanum.description && arcanum.frontMoves.length > 0 && <Divider />}

      {arcanum.frontMoves.length > 0 && (
        <div className={styles.frontMoves}>
          {arcanum.frontMoves.map((move, i) => {
            const trackerKey = isMoveDefinition(move) ? move.id : move.name;
            return (
              <Fragment key={move.name}>
                {/* The rulebook rules off each front-side section from the next; mirror that with a
                    divider before every entry after the first. */}
                {i > 0 && <Divider />}
                <FrontMoveRow
                  move={move}
                  trackerValue={entry.trackerValues?.[trackerKey] ?? 0}
                  onTrackerChange={onTrackerChange}
                />
              </Fragment>
            );
          })}
        </div>
      )}

      {marks.tasks ? (
        <div className={styles.taskList}>
          {marks.tasks.map((task, i) => {
            const key = `task-${i}`;
            return (
              <TaskRow
                key={key}
                taskKey={key}
                task={task}
                checked={!!entry.consequencesMarked[key]}
                onToggle={onConsequenceToggle}
              />
            );
          })}
          <Text
            as="span"
            font="serif"
            size="xs"
            color="muted"
            className={styles.taskCount}
          >
            {entry.marksValue} / {marks.max} tasks completed
          </Text>
        </div>
      ) : (
        <div className={styles.marksRow}>
          <UseDots
            total={marks.max}
            checked={entry.marksValue}
            onChange={onMarksChange}
            aria-label={`${arcanum.name} marks`}
          />
          <Text as="span" font="serif" size="xs" color="muted">
            {entry.marksValue} / {marks.max} marks
          </Text>
        </div>
      )}

      {unlocked &&
        (mystery.moves.length > 0 ||
          mystery.mysteryCreature !== undefined ||
          mystery.consequences.length > 0) && (
          <div className={styles.mysteries}>
            <Text
              font="serif"
              size="xs"
              weight="bold"
              className={styles.mysteriesLabel}
            >
              {mystery.sectionLabel ?? "Mysteries"}
            </Text>

            {projectedCreature && (
              <MysteryCreatureCard
                creature={projectedCreature}
                onSave={onMysteryCreatureSave}
              />
            )}

            {mystery.moves.length > 0 && (
              <div className={styles.mysteryMoves}>
                {mystery.moves.map((move) => {
                  const gating = getMoveGating(move);
                  return (
                    <MysteryMoveBlock
                      key={move.id}
                      move={move}
                      checked={!!entry.mysteryMovesChecked[move.id]}
                      trackerValue={entry.trackerValues?.[move.id]}
                      followerHp={entry.followerHp?.[move.id]}
                      bodyChecks={entry.bodyChecks?.[move.id]}
                      requirement={gating.requirement}
                      rightControlOverride={gating.dotOverride}
                      onToggle={onMysteryMoveToggle}
                      onTrackerChange={onTrackerChange}
                      onFollowerHpChange={onFollowerHpChange}
                      onBodyCheckChange={onBodyCheckChange}
                    />
                  );
                })}
              </div>
            )}

            {mystery.consequences.length > 0 && (
              <div className={styles.consequences}>
                <Text
                  font="serif"
                  size="xs"
                  weight="bold"
                  className={styles.consequencesLabel}
                >
                  Consequences
                </Text>
                {mystery.consequences.map((c) => (
                  <div key={c.id} className={styles.consequenceGroup}>
                    <ConsequenceRow
                      id={c.id}
                      text={c.text}
                      checkedMarks={getConsequenceCheckedMarks(c.id, c.text)}
                      onToggle={onConsequenceToggle}
                      tracker={c.tracker}
                      trackerValue={entry.trackerValues?.[c.id]}
                      onTrackerChange={onTrackerChange}
                    />
                    {c.table && (
                      <ConsequenceTableBlock
                        consequenceId={c.id}
                        table={c.table}
                        selectedRowId={entry.consequenceTableChoice?.[c.id]}
                        disabled={!entry.consequencesMarked[c.id]}
                        onChoose={onConsequenceTableChoice}
                      />
                    )}
                    {c.children && c.children.length > 0 && (
                      <div className={styles.consequenceChildren}>
                        {c.children.map((child) => (
                          <ConsequenceRow
                            key={child.id}
                            id={child.id}
                            text={child.text}
                            checkedMarks={getConsequenceCheckedMarks(
                              child.id,
                              child.text,
                            )}
                            onToggle={onConsequenceToggle}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
    </div>
  );
};
