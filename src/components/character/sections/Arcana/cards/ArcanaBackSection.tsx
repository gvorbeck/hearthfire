import { useCallback, useMemo } from "react";
import { Text } from "@/components/ui";
import type { ArcanaConsequence, ArcanaFollowerEntry, ArcanaMajorEntry, ArcanaSection, Creature, MoveDefinition } from "@/types";
import { isMoveDefinition } from "../arcanaParsing";
import type { MoveGating } from "../useArcanumGating";
import { ArcanaFollowerBlock } from "../ArcanaFollowerBlock";
import { ConsequenceRow } from "./ConsequenceRow";
import { ConsequenceTableBlock } from "./ConsequenceTableBlock";
import { MysteryCreatureCard } from "./MysteryCreatureCard";
import { MysteryMoveBlock } from "./MysteryMoveBlock";
import styles from "../arcanaCard.module.css";

// True when a section entry is a consequence (rather than a MoveDefinition). MoveDefinitions carry a
// `body`; consequences carry `value`.
const isConsequence = (
  entry: ArcanaSection["content"][number],
): entry is ArcanaConsequence => "value" in entry;

// True when a section entry is a standalone follower (a "Followers" section entry) rather than a move or
// consequence. Follower entries carry a `follower`; the other two carry `body` / `value`.
const isFollowerEntry = (
  entry: ArcanaSection["content"][number],
): entry is ArcanaFollowerEntry => "follower" in entry;

interface ArcanaBackSectionProps {
  section: ArcanaSection;
  entry: ArcanaMajorEntry;
  // Each back consequence id → its prose, so a consequence-gated follower can name what activates it.
  consequenceTextById: Record<string, string>;
  // Follower id → replacement Cost, when a marked consequence overrides it (e.g. the Ring of Daagon).
  followerCostById: Record<string, string>;
  // The section's creature projected from its marked consequences; rendered when the section carries a
  // `creature`. Undefined for sections without one.
  projectedCreature: Creature | undefined;
  getConsequenceCheckedMarks: (id: string, text: string, count?: number) => boolean[];
  // Lock reasons + dot override for a back move, computed the same way as for mystery moves.
  getMoveGating: (move: MoveDefinition) => MoveGating;
  onMysteryMoveToggle: (moveId: string, checked: boolean) => void;
  onConsequenceToggle: (consequenceId: string, checked: boolean) => void;
  onTrackerChange: (moveId: string, value: number) => void;
  onFollowerHpChange: (moveId: string, index: number, value: number) => void;
  onBodyCheckChange: (ownerId: string, itemId: string, checked: boolean) => void;
  onBodyInputChange: (ownerId: string, itemId: string, value: string) => void;
  onConsequenceTableChoice: (consequenceId: string, rowId: string) => void;
  onMysteryCreatureSave: (creature: Creature) => void;
}

// One labeled section of an arcanum's back: a "Moves" section renders its MoveDefinitions through the
// shared move block; a "Consequences" section renders its checkbox consequences (with nested children)
// through ConsequenceRow. Both block types are the same ones the legacy `mystery` rendering uses, so the
// look is identical — only the data source (section.content) differs.
export const ArcanaBackSection = ({
  section,
  entry,
  consequenceTextById,
  followerCostById,
  projectedCreature,
  getConsequenceCheckedMarks,
  getMoveGating,
  onMysteryMoveToggle,
  onConsequenceToggle,
  onTrackerChange,
  onFollowerHpChange,
  onBodyCheckChange,
  onBodyInputChange,
  onConsequenceTableChoice,
  onMysteryCreatureSave,
}: ArcanaBackSectionProps) => {
  // A section whose entries are all moves lays them out masonry-style (two columns on desktop, one
  // below); a section that mixes in consequences or followers stays a single stacked column.
  const isMovesOnly = section.content.every(
    (item) => !isConsequence(item) && !isFollowerEntry(item),
  );
  const itemsClassName = isMovesOnly ? styles.moveGrid : styles.consequences;
  return (
    <div className={styles.consequences}>
      <Text font="serif" size="xs" weight="bold" className={styles.consequencesLabel}>
        {section.label}
      </Text>
      {section.creature && projectedCreature && (
        <MysteryCreatureCard
          creature={projectedCreature}
          onSave={onMysteryCreatureSave}
        />
      )}
      <div className={itemsClassName}>
        {section.content.map((item) =>
          isConsequence(item) ? (
            <ConsequenceConsequence
              key={item.id}
              consequence={item}
              entry={entry}
              getConsequenceCheckedMarks={getConsequenceCheckedMarks}
              onConsequenceToggle={onConsequenceToggle}
              onTrackerChange={onTrackerChange}
              onConsequenceTableChoice={onConsequenceTableChoice}
            />
          ) : isFollowerEntry(item) ? (
            <BackFollower
              key={item.id}
              followerEntry={item}
              entry={entry}
              consequenceTextById={consequenceTextById}
              costOverride={followerCostById[item.id]}
              onTrackerChange={onTrackerChange}
              onFollowerHpChange={onFollowerHpChange}
              onBodyCheckChange={onBodyCheckChange}
              onBodyInputChange={onBodyInputChange}
            />
          ) : isMoveDefinition(item) ? (
            <BackMove
              key={item.id}
              move={item}
              entry={entry}
              gating={getMoveGating(item)}
              onMysteryMoveToggle={onMysteryMoveToggle}
              onTrackerChange={onTrackerChange}
              onFollowerHpChange={onFollowerHpChange}
              onBodyCheckChange={onBodyCheckChange}
            />
          ) : null,
        )}
      </div>
    </div>
  );
};

interface BackMoveProps {
  move: MoveDefinition;
  entry: ArcanaMajorEntry;
  gating: MoveGating;
  onMysteryMoveToggle: (moveId: string, checked: boolean) => void;
  onTrackerChange: (moveId: string, value: number) => void;
  onFollowerHpChange: (moveId: string, index: number, value: number) => void;
  onBodyCheckChange: (moveId: string, itemId: string, checked: boolean) => void;
}

// A back Move rendered through the shared mystery-move block, with its per-move saved state and the
// gating (lock reasons, dot widening) computed for it — so a back move with prerequisites stays locked
// exactly like a mystery move does.
const BackMove = ({
  move,
  entry,
  gating,
  onMysteryMoveToggle,
  onTrackerChange,
  onFollowerHpChange,
  onBodyCheckChange,
}: BackMoveProps) => (
  <MysteryMoveBlock
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

interface BackFollowerProps {
  followerEntry: ArcanaFollowerEntry;
  entry: ArcanaMajorEntry;
  consequenceTextById: Record<string, string>;
  // A replacement Cost imposed by a marked consequence (e.g. the Ring of Daagon's daagon-c4). When set,
  // it overrides the follower's seed cost; undefined leaves the seed cost in place.
  costOverride: string | undefined;
  onTrackerChange: (moveId: string, value: number) => void;
  onFollowerHpChange: (moveId: string, index: number, value: number) => void;
  onBodyCheckChange: (ownerId: string, itemId: string, checked: boolean) => void;
  onBodyInputChange: (ownerId: string, itemId: string, value: string) => void;
}

// A standalone follower in a "Followers" section. Its saved state is keyed by the entry's id: HP under
// followerHp[id], Loyalty under trackerValues[id] (reusing the same tracker path moves use for dots),
// and — for a rolled-aspects follower (the Servant of Daagon) — its d4 write-ins under bodyInputs[id]
// and Traits/Moves ticks under bodyChecks[id]. A follower gated on a consequence (requiresConsequence)
// renders inactive until that box is marked.
const BackFollower = ({
  followerEntry,
  entry,
  consequenceTextById,
  costOverride,
  onTrackerChange,
  onFollowerHpChange,
  onBodyCheckChange,
  onBodyInputChange,
}: BackFollowerProps) => {
  const { id, follower: seedFollower, requiresConsequence } = followerEntry;
  // A marked consequence may replace the follower's Cost; apply it over the seed. Memoized so the
  // follower object stays referentially stable (and ArcanaFollowerBlock's memo holds) until it changes.
  const follower = useMemo(
    () => (costOverride === undefined ? seedFollower : { ...seedFollower, cost: costOverride }),
    [seedFollower, costOverride],
  );
  const inactive = !!requiresConsequence && !entry.consequencesMarked[requiresConsequence];
  const gateText = requiresConsequence ? consequenceTextById[requiresConsequence] : undefined;
  const activationNote = gateText ? `Gained when you mark: “${gateText}”` : undefined;
  // Stable per-follower callbacks so the memoized ArcanaFollowerBlock skips re-rendering when the card
  // re-renders for unrelated reasons (another card's edit echoing back through the snapshot).
  const handleFollowerHp = useCallback(
    (index: number, value: number) => onFollowerHpChange(id, index, value),
    [id, onFollowerHpChange],
  );
  const handleLoyalty = useCallback(
    (value: number) => onTrackerChange(id, value),
    [id, onTrackerChange],
  );
  const handleAspectInput = useCallback(
    (rowId: string, value: string) => onBodyInputChange(id, rowId, value),
    [id, onBodyInputChange],
  );
  const handleAspectCheck = useCallback(
    (optionId: string, checked: boolean) => onBodyCheckChange(id, optionId, checked),
    [id, onBodyCheckChange],
  );
  return (
    <ArcanaFollowerBlock
      arcanaId={id}
      follower={follower}
      followerHp={entry.followerHp?.[id]}
      onFollowerHpChange={handleFollowerHp}
      loyaltyValue={entry.trackerValues?.[id]}
      onLoyaltyChange={handleLoyalty}
      inactive={inactive}
      activationNote={activationNote}
      aspectInputs={entry.bodyInputs?.[id]}
      onAspectInputChange={handleAspectInput}
      aspectChecks={entry.bodyChecks?.[id]}
      onAspectCheckChange={handleAspectCheck}
    />
  );
};

interface ConsequenceConsequenceProps {
  consequence: ArcanaConsequence;
  entry: ArcanaMajorEntry;
  // A child is locked until its parent is marked; the root consequence of a tree is never disabled.
  disabled?: boolean;
  getConsequenceCheckedMarks: (id: string, text: string, count?: number) => boolean[];
  onConsequenceToggle: (consequenceId: string, checked: boolean) => void;
  onTrackerChange: (id: string, value: number) => void;
  onConsequenceTableChoice: (consequenceId: string, rowId: string) => void;
}

// A back consequence and its nested children, rendered with the same ConsequenceRow used by the mystery
// path. Recursive so an arbitrarily deep consequence tree renders without special-casing depth. A child's
// boxes stay locked until its parent's first box is marked (the parent's own id). A creature-projecting
// consequence may also carry a "hold" tracker or a roll table, rendered exactly as the mystery path does.
const ConsequenceConsequence = ({
  consequence,
  entry,
  disabled,
  getConsequenceCheckedMarks,
  onConsequenceToggle,
  onTrackerChange,
  onConsequenceTableChoice,
}: ConsequenceConsequenceProps) => {
  const checkedMarks = getConsequenceCheckedMarks(
    consequence.id,
    consequence.value,
    consequence.checkboxes,
  );
  return (
    <div className={styles.consequenceGroup}>
      <ConsequenceRow
        id={consequence.id}
        text={consequence.value}
        checkedMarks={checkedMarks}
        markCount={consequence.checkboxes}
        disabled={disabled}
        onToggle={onConsequenceToggle}
        tracker={consequence.tracker}
        trackerValue={entry.trackerValues?.[consequence.id]}
        onTrackerChange={onTrackerChange}
      />
      {consequence.table && (
        <ConsequenceTableBlock
          consequenceId={consequence.id}
          table={consequence.table}
          selectedRowId={entry.consequenceTableChoice?.[consequence.id]}
          disabled={!checkedMarks[0]}
          onChoose={onConsequenceTableChoice}
        />
      )}
      {consequence.children && consequence.children.length > 0 && (
        <div className={styles.consequenceChildren}>
          {consequence.children.map((child) => (
            <ConsequenceConsequence
              key={child.id}
              consequence={child}
              entry={entry}
              disabled={!checkedMarks[0]}
              getConsequenceCheckedMarks={getConsequenceCheckedMarks}
              onConsequenceToggle={onConsequenceToggle}
              onTrackerChange={onTrackerChange}
              onConsequenceTableChoice={onConsequenceTableChoice}
            />
          ))}
        </div>
      )}
    </div>
  );
};
