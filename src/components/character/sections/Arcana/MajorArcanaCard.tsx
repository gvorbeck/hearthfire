import { useCallback, memo } from 'react';
import clsx from 'clsx';
import { Button, Checkbox, List, Text } from '@/components/ui';
import { UseDots } from '@/components/ui/UseDots/UseDots';
import { parseInlineMarkdown, parseMarkdown } from '@/lib/parseMarkdown';
import type { MajorArcanum, MajorArcanaMysteryMove, ArcanaMove } from '@/types';
import type { ArcanaMajorEntry } from '@/types';
import styles from './MajorArcanaCard.module.css';

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

const FrontMoveRow = memo(({ move, trackerValue, onTrackerChange }: FrontMoveRowProps) => {
  const handleTracker = useCallback((v: number) => onTrackerChange(move.name, v), [move.name, onTrackerChange]);
  return (
    <div className={styles.frontMove}>
      <div className={styles.moveHeader}>
        <Text as="p" font="serif" size="sm" weight="bold">
          {move.name}
        </Text>
        {move.subtitle && (
          <Text as="p" font="serif" size="sm" italic color="muted">
            {parseInlineMarkdown(move.subtitle)}
          </Text>
        )}
      </div>
      {move.tracker && (
        <div className={styles.tracker}>
          <Text as="span" font="serif" size="xs" color="muted" className={styles.trackerLabel}>
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
});

interface TaskRowProps {
  taskKey: string;
  task: string;
  checked: boolean;
  onToggle: (key: string, checked: boolean) => void;
}

const TaskRow = memo(({ taskKey, task, checked, onToggle }: TaskRowProps) => {
  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => onToggle(taskKey, e.target.checked),
    [taskKey, onToggle],
  );
  return (
    <label className={styles.taskRow}>
      <Checkbox checked={checked} onChange={handleChange} />
      <Text as="span" font="serif" size="sm">{task}</Text>
    </label>
  );
});

interface FollowerHpInputProps {
  index: number;
  moveId: string;
  followerName: string;
  isMultiHp: boolean;
  value: number;
  max: number;
  onFollowerHpChange: (moveId: string, index: number, value: number) => void;
}

const FollowerHpInput = memo(({ index, moveId, followerName, isMultiHp, value, max, onFollowerHpChange }: FollowerHpInputProps) => {
  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const val = parseInt(e.target.value, 10);
      if (!isNaN(val)) onFollowerHpChange(moveId, index, val);
    },
    [moveId, index, onFollowerHpChange],
  );
  return (
    <label className={styles.followerHpLabel}>
      <Text as="span" font="serif" size="xs" color="muted">
        {isMultiHp ? `HP ${index + 1}` : 'HP'}
      </Text>
      <input
        type="number"
        className={styles.followerHpInput}
        value={value}
        min={0}
        max={max}
        onChange={handleChange}
        aria-label={isMultiHp ? `${followerName} ${index + 1} HP` : `${followerName} HP`}
      />
      <Text as="span" font="serif" size="xs" color="muted">
        /{max}
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

const ConsequenceRow = memo(({ id, text, checked, onToggle }: ConsequenceRowProps) => {
  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => onToggle(id, e.target.checked),
    [id, onToggle],
  );
  return (
    <label className={styles.consequenceRow}>
      <Checkbox checked={checked} onChange={handleChange} />
      <Text as="span" font="serif" size="sm">
        {parseInlineMarkdown(text)}
      </Text>
    </label>
  );
});

interface MysteryMoveBlockProps {
  move: MajorArcanaMysteryMove;
  checked: boolean;
  trackerValue?: number;
  followerHp?: number[];
  onToggle: (id: string, checked: boolean) => void;
  onTrackerChange: (id: string, value: number) => void;
  onFollowerHpChange: (id: string, index: number, value: number) => void;
}

const MysteryMoveBlock = memo(({
  move,
  checked,
  trackerValue,
  followerHp,
  onToggle,
  onTrackerChange,
  onFollowerHpChange,
}: MysteryMoveBlockProps) => {
  const handleToggle = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => onToggle(move.id, e.target.checked),
    [move.id, onToggle],
  );
  const handleTracker = useCallback(
    (value: number) => onTrackerChange(move.id, value),
    [move.id, onTrackerChange],
  );

  const isMultiHp = !!(move.follower?.hpCount && move.follower.hpCount > 1);

  return (
    <div className={clsx(styles.mysteryMove, checked && styles.mysteryMoveChosen)}>
      <label className={styles.mysteryMoveHeader}>
        <Checkbox checked={checked} onChange={handleToggle} />
        <div className={styles.mysteryMoveTitle}>
          <Text as="span" font="serif" size="sm" weight="bold">
            {move.name}
          </Text>
          {move.subtitle && (
            <Text as="span" font="serif" size="sm" italic color="muted">
              {parseInlineMarkdown(move.subtitle)}
            </Text>
          )}
        </div>
      </label>

      {move.tracker && (
        <div className={styles.tracker}>
          <Text as="span" font="serif" size="xs" color="muted" className={styles.trackerLabel}>
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
        <div className={styles.follower}>
          <div className={styles.followerHeader}>
            <Text as="p" font="serif" size="sm" weight="bold">
              {move.follower.name}
            </Text>
            {move.follower.tags && (
              <Text as="span" font="serif" size="xs" italic color="muted">
                {move.follower.tags}
              </Text>
            )}
          </div>
          <div className={styles.followerStats}>
            <div className={styles.followerHpRow}>
              {Array.from({ length: move.follower.hpCount ?? 1 }).map((_, i) => (
                <FollowerHpInput
                  key={`hp-${move.id}-${i}`}
                  index={i}
                  moveId={move.id}
                  followerName={move.follower!.name}
                  isMultiHp={isMultiHp}
                  value={followerHp?.[i] ?? move.follower!.hp}
                  max={move.follower!.hp}
                  onFollowerHpChange={onFollowerHpChange}
                />
              ))}
              {move.follower.armor !== undefined && (
                <span className={styles.followerStat}>
                  <Text as="span" font="serif" size="xs" color="muted">Armor</Text>
                  <Text as="span" font="serif" size="xs">{move.follower.armor}</Text>
                </span>
              )}
              {move.follower.damage && (
                <span className={styles.followerStat}>
                  <Text as="span" font="serif" size="xs" color="muted">Damage</Text>
                  <Text as="span" font="serif" size="xs">{move.follower.damage}</Text>
                </span>
              )}
            </div>
            <div className={styles.followerInstinct}>
              <Text as="span" font="serif" size="xs" color="muted">Instinct: </Text>
              <Text as="span" font="serif" size="xs" italic>{move.follower.instinct}</Text>
            </div>
            {move.follower.qualities && (
              <List
                variant="bullet"
                items={move.follower.qualities.map((q, i) => (
                  <Text key={`quality-${move.id}-${i}`} as="span" font="serif" size="xs">{q}</Text>
                ))}
              />
            )}
            {move.follower.cost && (
              <div className={styles.followerCost}>
                <Text as="span" font="serif" size="xs" color="muted">Cost: </Text>
                <Text as="span" font="serif" size="xs">{move.follower.cost}</Text>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
});

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
          <Text as="p" font="serif" size="sm" weight="bold">
            {arcanum.name}
          </Text>
          {arcanum.tags && (
            <Text as="span" font="serif" size="sm" italic color="muted">
              {arcanum.tags}
            </Text>
          )}
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={onRemove}
          aria-label={`Remove ${arcanum.name}`}
          className={styles.removeBtn}
        >
          ×
        </Button>
      </div>

      {arcanum.description && (
        <div className={styles.description}>{parseMarkdown(arcanum.description)}</div>
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
          <Text as="span" font="serif" size="xs" color="muted" className={styles.taskCount}>
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

      {unlocked && (mystery.moves.length > 0 || mystery.consequences.length > 0) && (
        <div className={styles.mysteries}>
          <Text as="p" font="serif" size="xs" weight="bold" className={styles.mysteriesLabel}>
            {mystery.sectionLabel ?? 'Mysteries'}
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
              <Text as="p" font="serif" size="xs" weight="bold" className={styles.consequencesLabel}>
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
