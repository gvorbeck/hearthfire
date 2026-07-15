import { useMemo } from "react";
import clsx from "clsx";
import { Text } from "@/components/ui";
import { UseDots } from "@/components/ui/UseDots/UseDots";
import { parseMarkdown } from "@/lib/parseMarkdown";
import type {
  MajorArcanum,
  ArcanaMajorEntry,
  Creature,
} from "@/types";
import { ArcanaCardHeader } from "./ArcanaCardHeader";
import { parseDescriptionTasks } from "./arcanaParsing";
import { getMarkedFollowerCost } from "@/lib/consequenceActions";
import { useArcanumGating } from "./useArcanumGating";
import {
  ArcanaBackSection,
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
  onBodyCheckChange: (ownerId: string, itemId: string, checked: boolean) => void;
  onBodyInputChange: (ownerId: string, itemId: string, value: string) => void;
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
  onBodyInputChange,
  onMysteryCreatureSave,
  onRemove,
}: MajorArcanaCardProps) => {
  const { frontTrackers, back } = arcanum;
  // Exactly one front tracker is the unlock track (role "marks"); its value lives on entry.marksValue.
  // The rest are resource pools persisting under entry.trackerValues[id].
  const marksTracker = frontTrackers.find((t) => t.role === "marks");
  const poolTrackers = frontTrackers.filter((t) => t.role !== "marks");
  const {
    unlocked,
    projectedCreature,
    getConsequenceCheckedMarks,
    getMoveGating,
  } = useArcanumGating(arcanum, entry);

  const cx = clsx(styles.card, unlocked && styles.cardUnlocked);

  // Legacy/hand-edited docs can have an arcanaMajor entry predating these fields; default so every
  // lookup below is safe without repeating the guard at each call site. Memoized so the fallback `{}`
  // doesn't create a new reference every render and break followerCostById's memo.
  const consequencesMarked = useMemo(
    () => entry.consequencesMarked ?? {},
    [entry.consequencesMarked],
  );
  const mysteryMovesChecked = entry.mysteryMovesChecked ?? {};

  // A consequence can replace a follower's Cost (e.g. the Ring of Daagon's daagon-c4). Derive the
  // effective override per follower id from marked state, so unmarking restores the seed cost.
  const followerCostById = useMemo(() => {
    const map: Record<string, string> = {};
    for (const section of back?.sections ?? []) {
      for (const item of section.content) {
        if (!("follower" in item)) continue;
        const cost = getMarkedFollowerCost(arcanum, consequencesMarked, item.id);
        if (cost !== undefined) map[item.id] = cost;
      }
    }
    return map;
  }, [arcanum, back, consequencesMarked]);

  // A follower gained via a consequence shows a note naming that consequence's prose; map each back
  // consequence id to its text so a follower can look up its activating consequence across sections.
  const backConsequenceTextById = useMemo(() => {
    const map: Record<string, string> = {};
    for (const section of back?.sections ?? []) {
      for (const item of section.content) {
        if ("value" in item) map[item.id] = item.value;
      }
    }
    return map;
  }, [back]);

  // The provisions weight is rendered as ◊ diamonds by the header (from `weight`), so strip any
  // leading ◊ markers and their separator out of the tags string to avoid showing them twice.
  const tags = arcanum.tags?.replace(/^(?:◊\s*,?\s*)+/, "") || undefined;

  // Task checkboxes are authored inline as a "[ ] …" block within the description, so the prose and
  // its tasks read as one passage. Split the description around that block: the prose halves render as
  // markdown, the task labels feed the interactive list between them. An arcanum with no inline task
  // block falls back to the marks tracker's `tasks`, in which case the whole description is `proseBefore`.
  const { proseBefore, tasks: descriptionTasks, proseAfter } = arcanum.description
    ? parseDescriptionTasks(arcanum.description)
    : { proseBefore: "", tasks: [], proseAfter: "" };
  const tasks = descriptionTasks.length > 0 ? descriptionTasks : marksTracker?.tasks;

  return (
    <div className={cx}>
      <ArcanaCardHeader
        id={arcanum.id}
        name={arcanum.name}
        tags={tags}
        weight={arcanum.weight}
        onRemove={onRemove}
      />

      {proseBefore && (
        <div className={styles.description}>
          {parseMarkdown(proseBefore)}
        </div>
      )}

      {tasks ? (
        <div className={styles.taskList}>
          {tasks.map((task, i) => {
            // The persisted mark key is positional (`task-i`) so a saved mark survives re-renders; the
            // React key also encodes the task text so it stays stable if the list is ever reordered.
            const taskKey = `task-${i}`;
            return (
              <TaskRow
                key={`${taskKey}-${task}`}
                taskKey={taskKey}
                task={task}
                checked={!!consequencesMarked[taskKey]}
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
            {entry.marksValue} / {marksTracker?.max} tasks completed
          </Text>
        </div>
      ) : (
        marksTracker && (
          <DotRow
            total={marksTracker.max}
            value={entry.marksValue}
            label={marksTracker.label}
            ariaLabel={`${arcanum.name} ${marksTracker.label}`}
            onChange={onMarksChange}
          />
        )
      )}

      {poolTrackers.map((tracker) => (
        <DotRow
          key={tracker.id}
          total={tracker.max}
          value={entry.trackerValues?.[tracker.id] ?? 0}
          label={tracker.label}
          ariaLabel={tracker.label}
          onChange={(next) => onTrackerChange(tracker.id, next)}
        />
      ))}

      {proseAfter && (
        <div className={styles.description}>
          {parseMarkdown(proseAfter)}
        </div>
      )}

      {/* Base moves (e.g. the Codex's Cast a Codex Spell) render inline after the description prose so
          their typed body and dot controls show. */}
      {arcanum.baseMoves?.map((move) => (
        <MysteryMoveBlock
          key={move.id}
          move={move}
          checked={!!mysteryMovesChecked[move.id]}
          trackerValue={entry.trackerValues?.[move.id]}
          bodyChecks={entry.bodyChecks?.[move.id]}
          onToggle={onMysteryMoveToggle}
          onTrackerChange={onTrackerChange}
          onBodyCheckChange={onBodyCheckChange}
        />
      ))}

      {unlocked && back && (
        <div className={styles.mysteries}>
          <Text
            font="serif"
            size="xs"
            weight="bold"
            className={styles.mysteriesLabel}
          >
            {back.label}
          </Text>
          {back.sections.map((section) => (
            <ArcanaBackSection
              key={section.label}
              section={section}
              entry={entry}
              consequenceTextById={backConsequenceTextById}
              followerCostById={followerCostById}
              projectedCreature={projectedCreature}
              getConsequenceCheckedMarks={getConsequenceCheckedMarks}
              getMoveGating={getMoveGating}
              onMysteryMoveToggle={onMysteryMoveToggle}
              onConsequenceToggle={onConsequenceToggle}
              onTrackerChange={onTrackerChange}
              onFollowerHpChange={onFollowerHpChange}
              onBodyCheckChange={onBodyCheckChange}
              onBodyInputChange={onBodyInputChange}
              onConsequenceTableChoice={onConsequenceTableChoice}
              onMysteryCreatureSave={onMysteryCreatureSave}
            />
          ))}
        </div>
      )}
    </div>
  );
};

interface DotRowProps {
  total: number;
  value: number;
  // Suffix after the "N / max" counter (e.g. "marks", "Acumen").
  label: string;
  ariaLabel: string;
  onChange: (value: number) => void;
}

// The dot-tracker row shared by the front Marks tracker and any extra front pools (frontTrackers, e.g.
// Acumen): dots on the left, a "N / max label" counter on the right.
const DotRow = ({ total, value, label, ariaLabel, onChange }: DotRowProps) => (
  <div className={styles.marksRow}>
    <UseDots total={total} checked={value} onChange={onChange} ariaLabel={ariaLabel} />
    <Text as="span" font="serif" size="xs" color="muted">
      {value} / {total} {label}
    </Text>
  </div>
);
