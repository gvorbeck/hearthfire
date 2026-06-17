import { useCallback, memo } from "react";
import clsx from "clsx";
import { Button, Checkbox, Text } from "@/components/ui";
import { UseDots } from "@/components/ui/UseDots/UseDots";
import { parseMarkdown } from "@/lib/parseMarkdown";
import { Move } from "../../Move";
import type {
  MajorArcanum,
  MajorArcanaMysteryMove,
  MoveDefinition,
  ArcanaMove,
} from "@/types";
import type { ArcanaMajorEntry } from "@/types";
import { ArcanaFollowerBlock } from "./ArcanaFollowerBlock";
import styles from "./MajorArcanaCard.module.css";

interface MajorArcanaCardProps {
  arcanum: MajorArcanum;
  entry: ArcanaMajorEntry;
  onMarksChange: (value: number) => void;
  onMysteryMoveToggle: (moveId: string, checked: boolean) => void;
  onConsequenceToggle: (consequenceId: string, checked: boolean) => void;
  onTrackerChange: (moveId: string, value: number) => void;
  onFollowerHpChange: (moveId: string, index: number, value: number) => void;
  onRemove: () => void;
}

interface FrontMoveRowProps {
  move: ArcanaMove;
  trackerValue: number;
  onTrackerChange: (moveId: string, value: number) => void;
}

const FrontMoveRow = memo(
  ({ move, trackerValue, onTrackerChange }: FrontMoveRowProps) => {
    const handleTracker = useCallback(
      (v: number) => onTrackerChange(move.name, v),
      [move.name, onTrackerChange],
    );
    return (
      <div className={styles.frontMove}>
        <div className={styles.moveHeader}>
          <Text font="serif" weight="bold">
            {move.name}
          </Text>
          {move.subtitle && (
            <Text font="serif" italic color="muted">
              {move.subtitle}
            </Text>
          )}
        </div>
        {move.tracker && (
          <div className={styles.tracker}>
            <Text
              as="span"
              font="serif"
              size="xs"
              color="muted"
              className={styles.trackerLabel}
            >
              {move.tracker.label}
            </Text>
            <UseDots
              total={move.tracker.max}
              checked={trackerValue}
              onChange={handleTracker}
            />
          </div>
        )}
        <div className={styles.moveText}>{parseMarkdown(move.text)}</div>
      </div>
    );
  },
);

interface TaskRowProps {
  taskKey: string;
  task: string;
  checked: boolean;
  onToggle: (key: string, checked: boolean) => void;
}

const TaskRow = memo(({ taskKey, task, checked, onToggle }: TaskRowProps) => {
  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) =>
      onToggle(taskKey, e.target.checked),
    [taskKey, onToggle],
  );
  return (
    <label className={styles.taskRow}>
      <Checkbox checked={checked} onChange={handleChange} />
      <Text as="span" font="serif">
        {task}
      </Text>
    </label>
  );
});

interface ConsequenceRowProps {
  id: string;
  text: string;
  checked: boolean;
  onToggle: (id: string, checked: boolean) => void;
}

const ConsequenceRow = memo(
  ({ id, text, checked, onToggle }: ConsequenceRowProps) => {
    const handleChange = useCallback(
      (e: React.ChangeEvent<HTMLInputElement>) =>
        onToggle(id, e.target.checked),
      [id, onToggle],
    );
    return (
      <label className={styles.consequenceRow}>
        <Checkbox checked={checked} onChange={handleChange} />
        <Text as="span" font="serif">
          {text}
        </Text>
      </label>
    );
  },
);

interface MysteryMoveBlockProps {
  move: MajorArcanaMysteryMove | MoveDefinition;
  checked: boolean;
  trackerValue?: number;
  followerHp?: number[];
  onToggle: (id: string, checked: boolean) => void;
  onTrackerChange: (id: string, value: number) => void;
  onFollowerHpChange: (id: string, index: number, value: number) => void;
}

// A move authored in the Move-component shape (typed body blocks) rather than the legacy flat string.
const isMoveDefinition = (
  move: MajorArcanaMysteryMove | MoveDefinition,
): move is MoveDefinition => "body" in move;

const MysteryMoveBlock = memo(
  ({
    move,
    checked,
    trackerValue,
    followerHp,
    onToggle,
    onTrackerChange,
    onFollowerHpChange,
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

    // Move-shaped entries render through the shared Move component: its select box maps to the
    // mystery-move checked state, and its rightControl dots persist via the same tracker path.
    if (isMoveDefinition(move)) {
      return (
        <Move
          title={move.name}
          move={move}
          selection={{
            selected: checked,
            onSelectChange: (next) => onToggle(move.id, next),
            takesChecked: 0,
            onTakesChange: () => {},
          }}
          rightControlState={move.rightControl?.map(() => ({
            checked: trackerValue ?? 0,
            onChange: handleTracker,
          }))}
        />
      );
    }

    return (
      <div>
        <label className={styles.mysteryMoveHeader}>
          <Checkbox checked={checked} onChange={handleToggle} />
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
        </label>

        {move.tracker && (
          <div className={styles.tracker}>
            <Text
              as="span"
              font="serif"
              size="xs"
              color="muted"
              className={styles.trackerLabel}
            >
              {move.tracker.label}
            </Text>
            <UseDots
              total={move.tracker.max}
              checked={trackerValue ?? 0}
              onChange={handleTracker}
            />
          </div>
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

export const MajorArcanaCard = ({
  arcanum,
  entry,
  onMarksChange,
  onMysteryMoveToggle,
  onConsequenceToggle,
  onTrackerChange,
  onFollowerHpChange,
  onRemove,
}: MajorArcanaCardProps) => {
  const { marks, mystery } = arcanum;
  const unlocked = entry.marksValue >= (marks.unlockAt ?? marks.max);

  const cx = clsx(styles.card, unlocked && styles.cardUnlocked);

  return (
    <div className={cx}>
      <div className={styles.header}>
        <div className={styles.headerText}>
          <Text font="serif" weight="bold">
            {arcanum.name}
          </Text>
          {arcanum.tags && (
            <Text as="span" font="serif" italic color="muted">
              {arcanum.tags}
            </Text>
          )}
        </div>
        <Button
          variant="ghost"
          onClick={onRemove}
          aria-label={`Remove ${arcanum.name}`}
          className={styles.removeBtn}
        >
          ×
        </Button>
      </div>

      {arcanum.description && (
        <div className={styles.description}>
          {parseMarkdown(arcanum.description)}
        </div>
      )}

      {arcanum.frontMoves.length > 0 && (
        <div className={styles.frontMoves}>
          {arcanum.frontMoves.map((move) => (
            <FrontMoveRow
              key={move.name}
              move={move}
              trackerValue={entry.trackerValues?.[move.name] ?? 0}
              onTrackerChange={onTrackerChange}
            />
          ))}
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
        (mystery.moves.length > 0 || mystery.consequences.length > 0) && (
          <div className={styles.mysteries}>
            <Text
              font="serif"
              size="xs"
              weight="bold"
              className={styles.mysteriesLabel}
            >
              {mystery.sectionLabel ?? "Mysteries"}
            </Text>

            {mystery.moves.length > 0 && (
              <div className={styles.mysteryMoves}>
                {mystery.moves.map((move) => (
                  <MysteryMoveBlock
                    key={move.id}
                    move={move}
                    checked={!!entry.mysteryMovesChecked[move.id]}
                    trackerValue={entry.trackerValues?.[move.id]}
                    followerHp={entry.followerHp?.[move.id]}
                    onToggle={onMysteryMoveToggle}
                    onTrackerChange={onTrackerChange}
                    onFollowerHpChange={onFollowerHpChange}
                  />
                ))}
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
                      checked={!!entry.consequencesMarked[c.id]}
                      onToggle={onConsequenceToggle}
                    />
                    {c.children && c.children.length > 0 && (
                      <div className={styles.consequenceChildren}>
                        {c.children.map((child) => (
                          <ConsequenceRow
                            key={child.id}
                            id={child.id}
                            text={child.text}
                            checked={!!entry.consequencesMarked[child.id]}
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
