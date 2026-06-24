import {
  useCallback,
  useId,
  useMemo,
  useState,
  useRef,
  useEffect,
  memo,
} from "react";
import clsx from "clsx";
import { Checkbox, CreatureCard, Divider, Table, Text } from "@/components/ui";
import { UseDots } from "@/components/ui/UseDots/UseDots";
import { useLatest } from "@/hooks/useLatest";
import { parseMarkdown } from "@/lib/parseMarkdown";
import { projectCreature } from "@/lib/creatureMutations";
import { Move } from "../../Move";
import { ArcanaCardHeader } from "./ArcanaCardHeader";
import { ArcanaTrackerRow } from "./ArcanaTrackerRow";
import type {
  MajorArcanum,
  MajorArcanaMysteryMove,
  MajorArcanaMysteryConsequence,
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
  onConsequenceTableChoice: (consequenceId: string, rowId: string) => void;
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
            onChange={handleTracker}
          />
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

// A consequence prefixed with a run of ◻ glyphs (e.g. "◻◻◻ The dark spirit…") can be marked that
// many separate times. Split the boxes off into a mark count and return the prose without them.
const LEADING_MARK_BOXES_RE = /^(◻+)\s*/;
const parseConsequenceMarks = (
  text: string,
): { markCount: number; text: string } => {
  const match = text.match(LEADING_MARK_BOXES_RE);
  if (!match) return { markCount: 1, text };
  return { markCount: match[1].length, text: text.slice(match[0].length) };
};

// The id for one box of a multi-mark consequence. Box 0 keeps the consequence's own id so existing
// single-box marks (and any effects keyed on that id) stay valid; later boxes get a suffix.
const consequenceMarkId = (baseId: string, index: number): string =>
  index === 0 ? baseId : `${baseId}#${index}`;

interface ConsequenceRowProps {
  id: string;
  text: string;
  // Checked state for each mark box, in order; its length is the number of boxes to render.
  checkedMarks: boolean[];
  onToggle: (id: string, checked: boolean) => void;
  // A "hold up to max" dot tracker shown after the prose (e.g. Sustenance), interactive only while the
  // consequence's first box is marked.
  tracker?: { label: string; max: number };
  trackerValue?: number;
  onTrackerChange?: (id: string, value: number) => void;
}

// Not memoized: each card renders only a handful of consequences and they change rarely, so the
// per-render `checkedMarks` array (which would defeat memo anyway) costs nothing here.
const ConsequenceRow = ({
  id,
  text,
  checkedMarks,
  onToggle,
  tracker,
  trackerValue,
  onTrackerChange,
}: ConsequenceRowProps) => {
  const { markCount, text: prose } = parseConsequenceMarks(text);
  const proseId = useId();
  const handleTracker = useCallback(
    (v: number) => onTrackerChange?.(id, v),
    [id, onTrackerChange],
  );
  // Not a <label>: each box is its own labelable control, so wrapping the shared prose in one label
  // would bind every click to only the first box. Each box is named by the prose instead (via
  // aria-labelledby, so the rendered text—not its markdown markers—is read), plus a hidden position
  // when there is more than one box.
  return (
    <div className={styles.consequenceRow}>
      <span className={styles.consequenceMarks}>
        {Array.from({ length: markCount }, (_, i) => {
          const markId = consequenceMarkId(id, i);
          const posId = `${proseId}-pos-${i}`;
          return (
            <Checkbox
              key={markId}
              checked={!!checkedMarks[i]}
              onChange={(e) => onToggle(markId, e.target.checked)}
              aria-labelledby={markCount > 1 ? `${proseId} ${posId}` : proseId}
            />
          );
        })}
        {markCount > 1 &&
          Array.from({ length: markCount }, (_, i) => (
            <span
              key={`${proseId}-pos-${i}`}
              id={`${proseId}-pos-${i}`}
              className={styles.srOnly}
            >
              mark {i + 1} of {markCount}
            </span>
          ))}
      </span>
      <Text as="span" id={proseId} font="serif">
        {prose}
      </Text>
      {tracker && (
        <UseDots
          total={tracker.max}
          checked={trackerValue ?? 0}
          onChange={handleTracker}
          disabled={!checkedMarks[0]}
          label={tracker.label}
        />
      )}
    </div>
  );
};

interface ConsequenceTableBlockProps {
  consequenceId: string;
  table: NonNullable<MajorArcanaMysteryConsequence["table"]>;
  selectedRowId?: string;
  // The table only drives an effect while its consequence is marked, so the rows stay disabled until
  // the box is checked.
  disabled: boolean;
  onChoose: (consequenceId: string, rowId: string) => void;
}

// The Mindgem's 1d4 purpose table: each row is radio-selectable, and the pick drives the row's
// effect on the creature. Rendered through the shared ui/Table with its selectable-cells rows.
const ConsequenceTableBlock = memo(
  ({
    consequenceId,
    table,
    selectedRowId,
    disabled,
    onChoose,
  }: ConsequenceTableBlockProps) => (
    <div className={styles.consequenceTable}>
      <Table
        columnHeaders={table.columnHeaders}
        selectionLabel={table.columnHeaders.join(" ")}
        rows={table.rows.map((row) => ({
          cells: [row.roll, ...row.cells],
          selectable: true,
          selected: selectedRowId === row.id,
          disabled,
          onSelect: () => onChoose(consequenceId, row.id),
        }))}
      />
    </div>
  ),
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

    // A move with `requires` is one of a budgeted set the player chooses between, so it keeps a select
    // box. Every other mystery move is granted outright once the arcanum unlocks — it is already
    // activated, so it shows no checkbox.
    const isSelectable = "requires" in move && !!move.requires?.length;
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

interface MysteryCreatureCardProps {
  // Fully projected creature: book data (from seed + marked consequences) with the player's saved
  // HP/armor/loyalty already merged in. Recomputed upstream whenever a consequence toggles.
  creature: Creature;
  onSave: (creature: Creature) => void;
}

// Wraps the presentational CreatureCard with optimistic local state, persisting the player's edits
// (HP, armor, loyalty) onto the arcanum entry. Text edits save on blur; loyalty saves immediately
// since it has no blur. The book-data fields are read-only here — they come from the projection.
const MysteryCreatureCard = memo(({ creature: projected, onSave }: MysteryCreatureCardProps) => {
  const [creature, setCreature] = useState<Creature>(projected);
  const creatureRef = useLatest(creature);
  const onSaveRef = useLatest(onSave);

  // Re-sync when a genuinely new projection arrives (a consequence toggled, or a fresh Firestore
  // snapshot), not on every local keystroke re-render.
  const lastSavedRef = useRef<string>(JSON.stringify(projected));
  useEffect(() => {
    const incoming = JSON.stringify(projected);
    if (incoming === lastSavedRef.current) return;
    lastSavedRef.current = incoming;
    setCreature(projected);
  }, [projected]);

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
  onConsequenceTableChoice,
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
  // floor(markedConsequences / 2), and a sub-move is locked while its parent is unselected or once the
  // grant budget is spent. Each box of a multi-mark consequence is its own markable id, so a 3-box
  // consequence contributes up to 3 toward that budget.
  const markIdsFor = (id: string, text: string): string[] =>
    Array.from({ length: parseConsequenceMarks(text).markCount }, (_, i) =>
      consequenceMarkId(id, i),
    );
  const consequenceIds = mystery.consequences.flatMap((c) => [
    ...markIdsFor(c.id, c.text),
    ...(c.children?.flatMap((child) => markIdsFor(child.id, child.text)) ?? []),
  ]);
  const markedConsequenceCount = consequenceIds.filter(
    (id) => entry.consequencesMarked[id],
  ).length;

  // The checked state of each mark box of a consequence, in box order, for ConsequenceRow.
  const getConsequenceCheckedMarks = (id: string, text: string): boolean[] =>
    markIdsFor(id, text).map((markId) => !!entry.consequencesMarked[markId]);
  const consequenceGrants = Math.floor(markedConsequenceCount / 2);
  const selectedSubMoves = mystery.moves.filter(
    (m) => "requires" in m && m.requires?.length && entry.mysteryMovesChecked[m.id],
  ).length;

  // Returns the lock reasons for a sub-move, or an empty array when it is available.
  const getMysteryRequirement = (move: MajorArcanum["mystery"]["moves"][number]): string[] => {
    // A move granted at a Consequence threshold (e.g. A Flickering Flame at 3) stays locked until that
    // many Consequences are marked.
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

            {projectedCreature && (
              <MysteryCreatureCard
                creature={projectedCreature}
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
