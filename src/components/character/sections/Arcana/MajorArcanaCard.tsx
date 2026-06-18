import { useCallback, useState, useRef, useEffect, memo } from "react";
import clsx from "clsx";
import { Button, Checkbox, CreatureCard, Text } from "@/components/ui";
import { UseDots } from "@/components/ui/UseDots/UseDots";
import { useLatest } from "@/hooks/useLatest";
import { parseMarkdown } from "@/lib/parseMarkdown";
import { Move } from "../../Move";
import type {
  MajorArcanum,
  MajorArcanaMysteryMove,
  MoveDefinition,
  RightControlSpec,
  ArcanaMove,
  Creature,
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
  onBodyCheckChange: (moveId: string, itemId: string, checked: boolean) => void;
  onMysteryCreatureSave: (creature: Creature) => void;
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

    // Move-shaped entries render through the shared Move component: its select box maps to the
    // mystery-move checked state, and its rightControl dots persist via the same tracker path.
    if (isMoveDefinition(move)) {
      const rightSpecs = rightControlOverride ?? move.rightControl;
      return (
        <Move
          title={move.name}
          move={move}
          requirement={requirement}
          selection={{
            selected: checked,
            onSelectChange: (next) => onToggle(move.id, next),
            takesChecked: 0,
            onTakesChange: () => {},
          }}
          rightControl={rightControlOverride}
          rightControlState={rightSpecs?.map(() => ({
            checked: trackerValue ?? 0,
            onChange: handleTracker,
          }))}
          bodyCheck={{ checked: bodyChecks ?? {}, onChange: handleBodyCheck }}
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

interface MysteryCreatureCardProps {
  // Book seed used until the player edits the creature.
  seed: Creature;
  // Player's saved working copy, if any.
  saved?: Creature;
  onSave: (creature: Creature) => void;
}

// Coerce a stored creature into the current shape, migrating fields that earlier shapes used:
//   - instinct as an array (pre-split) — the first line is the single instinct; any later lines were
//     really moves, so prepend them to the moves list
//   - separate damage/specialQualities/cost strings — these are now presented `qualities` lines, so
//     fold any that exist into the qualities list (and drop the orphaned fields)
const normalizeCreature = (creature: Creature): Creature => {
  const { damage, specialQualities, cost, ...rest } = creature as Creature & {
    damage?: string;
    specialQualities?: string;
    cost?: string;
  };
  // A stored instinct array splits into the single instinct (first line) and trailing move lines.
  const instinctArray = Array.isArray(rest.instinct)
    ? (rest.instinct as string[])
    : undefined;
  const instinct = instinctArray ? instinctArray[0] : rest.instinct;
  const movesFromInstinct = instinctArray ? instinctArray.slice(1) : [];
  const legacyQualities = [
    damage && `**Damage** ${damage}`,
    specialQualities && `**Special qualities** ${specialQualities}`,
    cost && `**Cost** ${cost}`,
  ].filter((line): line is string => Boolean(line));
  return {
    ...rest,
    qualities: [...(rest.qualities ?? []), ...legacyQualities],
    instinct,
    moves: [...movesFromInstinct, ...(rest.moves ?? [])],
  };
};

// Wraps the presentational CreatureCard with optimistic local state, persisting a single creature
// (the Mindgem's Mighty Servant) onto the arcanum entry. Text edits save on blur; loyalty saves
// immediately since it has no blur.
const MysteryCreatureCard = memo(({ seed, saved, onSave }: MysteryCreatureCardProps) => {
  const [creature, setCreature] = useState<Creature>(() => normalizeCreature(saved ?? seed));
  const creatureRef = useLatest(creature);
  const onSaveRef = useLatest(onSave);

  // Re-seed only when a genuinely new saved snapshot arrives from Firestore, not on every
  // local keystroke re-render.
  const lastSavedRef = useRef<string | undefined>(
    saved ? JSON.stringify(saved) : undefined,
  );
  useEffect(() => {
    if (saved === undefined) return;
    const incoming = JSON.stringify(saved);
    if (incoming === lastSavedRef.current) return;
    lastSavedRef.current = incoming;
    setCreature(normalizeCreature(saved));
  }, [saved]);

  const commit = useCallback((next: Creature) => {
    setCreature(next);
    lastSavedRef.current = JSON.stringify(next);
    onSaveRef.current(next);
  }, []);

  const handleFieldChange = useCallback(
    <K extends keyof Creature>(field: K, value: Creature[K]) => {
      const next = { ...creatureRef.current, [field]: value };
      // Loyalty has no blur, so persist it right away; text fields persist on blur.
      if (field === "loyalty") {
        commit(next);
      } else {
        setCreature(next);
      }
    },
    [commit],
  );

  const handleBlur = useCallback(() => commit(creatureRef.current), [commit]);

  return (
    <CreatureCard
      creature={creature}
      onFieldChange={handleFieldChange}
      onBlur={handleBlur}
    />
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
  onBodyCheckChange,
  onMysteryCreatureSave,
  onRemove,
}: MajorArcanaCardProps) => {
  const { marks, mystery } = arcanum;
  const unlocked = entry.marksValue >= (marks.unlockAt ?? marks.max);

  const cx = clsx(styles.card, unlocked && styles.cardUnlocked);

  // Budget gate for sub-moves that require a parent move (e.g. Noruba's Ice Sphere): the book grants
  // one such move "for every 2 Consequences you mark", so the number of selectable sub-moves is
  // floor(markedConsequences / 2). A sub-move is locked while its parent is unselected, or once the
  // grant budget is spent on other sub-moves.
  const consequenceIds = mystery.consequences.flatMap((c) => [
    c.id,
    ...(c.children?.map((child) => child.id) ?? []),
  ]);
  const markedConsequenceCount = consequenceIds.filter(
    (id) => entry.consequencesMarked[id],
  ).length;
  const consequenceGrants = Math.floor(markedConsequenceCount / 2);
  const selectedSubMoves = mystery.moves.filter(
    (m) => "requires" in m && m.requires?.length && entry.mysteryMovesChecked[m.id],
  ).length;

  // Returns the lock reasons for a sub-move, or an empty array when it is selectable.
  const getMysteryRequirement = (move: MajorArcanum["mystery"]["moves"][number]): string[] => {
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
  // (e.g. A Mighty Will → Mindwalking's Power). Returns undefined when no active bonus applies.
  const getDotOverride = (
    move: MajorArcanum["mystery"]["moves"][number],
  ): RightControlSpec[] | undefined => {
    const base = "rightControl" in move ? move.rightControl : undefined;
    if (!base) return undefined;
    const hasBonus = (mystery.dotBonuses ?? []).some(
      (b) => b.targetId === move.id && entry.mysteryMovesChecked[b.sourceId],
    );
    if (!hasBonus) return undefined;
    return base.map((spec) => ({ ...spec, number: (spec.number ?? 1) + 1 }));
  };

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

            {mystery.mysteryCreature && (
              <MysteryCreatureCard
                seed={mystery.mysteryCreature}
                saved={entry.mysteryCreature}
                onSave={onMysteryCreatureSave}
              />
            )}

            {mystery.moves.length > 0 && (
              <div className={styles.mysteryMoves}>
                {mystery.moves.map((move) => (
                  <MysteryMoveBlock
                    key={move.id}
                    move={move}
                    checked={!!entry.mysteryMovesChecked[move.id]}
                    trackerValue={entry.trackerValues?.[move.id]}
                    followerHp={entry.followerHp?.[move.id]}
                    bodyChecks={entry.bodyChecks?.[move.id]}
                    requirement={getMysteryRequirement(move)}
                    rightControlOverride={getDotOverride(move)}
                    onToggle={onMysteryMoveToggle}
                    onTrackerChange={onTrackerChange}
                    onFollowerHpChange={onFollowerHpChange}
                    onBodyCheckChange={onBodyCheckChange}
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
