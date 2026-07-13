import { useState, useCallback, useMemo, memo, type MutableRefObject } from 'react';
import { Button, Text } from '@/components/ui';
import { MAJOR_ARCANA } from '@/lib/arcanaMajor';
import { applyConsequenceActions, hasConsequenceActions } from '@/lib/consequenceActions';
import type { MajorArcanum, ArcanaMajorEntry, Creature, CharacterData } from '@/types';
import { MajorArcanaCard } from './MajorArcanaCard';
import { AddArcanaModal } from './AddArcanaModal';
import styles from './ArcanaPanel.module.css';

// Set an entry's marks and latch `everUnlocked` the first time marks reach the unlock threshold (the
// tracker's `unlockAt`, or its `max` when unspecified). Once latched it never clears, so an arcanum that
// erases all marks after each unlock keeps its Mysteries revealed. Never un-latches: erasing marks is
// the intended flow, not a mistake to undo.
export const withMarks = (entry: ArcanaMajorEntry, marksValue: number): ArcanaMajorEntry => {
  const marksTracker = MAJOR_ARCANA.find((m) => m.id === entry.id)?.frontTrackers.find(
    (t) => t.role === 'marks',
  );
  const threshold = marksTracker?.unlockAt ?? marksTracker?.max ?? 0;
  const everUnlocked = entry.everUnlocked || (threshold > 0 && marksValue >= threshold);
  return { ...entry, marksValue, everUnlocked };
};

interface MajorArcanaCardRowProps {
  entry: ArcanaMajorEntry;
  arcanum: MajorArcanum;
  onMarksChange: (id: string, value: number) => void;
  onMysteryMoveToggle: (id: string, moveId: string, checked: boolean) => void;
  onConsequenceToggle: (id: string, consequenceId: string, checked: boolean) => void;
  onConsequenceTableChoice: (id: string, consequenceId: string, rowId: string) => void;
  onTrackerChange: (id: string, moveId: string, value: number) => void;
  onFollowerHpChange: (id: string, moveId: string, index: number, value: number) => void;
  onBodyCheckChange: (id: string, ownerId: string, itemId: string, checked: boolean) => void;
  onBodyInputChange: (id: string, ownerId: string, itemId: string, value: string) => void;
  onMysteryCreatureSave: (id: string, creature: Creature) => void;
  onRemove: (id: string) => void;
}

const MajorArcanaCardRow = memo(({ entry, arcanum, onMarksChange, onMysteryMoveToggle, onConsequenceToggle, onConsequenceTableChoice, onTrackerChange, onFollowerHpChange, onBodyCheckChange, onBodyInputChange, onMysteryCreatureSave, onRemove }: MajorArcanaCardRowProps) => {
  const handleMarks = useCallback((value: number) => onMarksChange(entry.id, value), [entry.id, onMarksChange]);
  const handleMysteryMove = useCallback((moveId: string, checked: boolean) => onMysteryMoveToggle(entry.id, moveId, checked), [entry.id, onMysteryMoveToggle]);
  const handleConsequence = useCallback((consequenceId: string, checked: boolean) => onConsequenceToggle(entry.id, consequenceId, checked), [entry.id, onConsequenceToggle]);
  const handleConsequenceTable = useCallback((consequenceId: string, rowId: string) => onConsequenceTableChoice(entry.id, consequenceId, rowId), [entry.id, onConsequenceTableChoice]);
  const handleTracker = useCallback((moveId: string, value: number) => onTrackerChange(entry.id, moveId, value), [entry.id, onTrackerChange]);
  const handleFollowerHp = useCallback((moveId: string, index: number, value: number) => onFollowerHpChange(entry.id, moveId, index, value), [entry.id, onFollowerHpChange]);
  const handleBodyCheck = useCallback((ownerId: string, itemId: string, checked: boolean) => onBodyCheckChange(entry.id, ownerId, itemId, checked), [entry.id, onBodyCheckChange]);
  const handleBodyInput = useCallback((ownerId: string, itemId: string, value: string) => onBodyInputChange(entry.id, ownerId, itemId, value), [entry.id, onBodyInputChange]);
  const handleMysteryCreature = useCallback((creature: Creature) => onMysteryCreatureSave(entry.id, creature), [entry.id, onMysteryCreatureSave]);
  const handleRemove = useCallback(() => onRemove(entry.id), [entry.id, onRemove]);
  return (
    <MajorArcanaCard
      arcanum={arcanum}
      entry={entry}
      onMarksChange={handleMarks}
      onMysteryMoveToggle={handleMysteryMove}
      onConsequenceToggle={handleConsequence}
      onConsequenceTableChoice={handleConsequenceTable}
      onTrackerChange={handleTracker}
      onFollowerHpChange={handleFollowerHp}
      onBodyCheckChange={handleBodyCheck}
      onBodyInputChange={handleBodyInput}
      onMysteryCreatureSave={handleMysteryCreature}
      onRemove={handleRemove}
    />
  );
});

interface MajorArcanaPanelProps {
  arcanaMajor: ArcanaMajorEntry[];
  arcanaMajorRef: MutableRefObject<ArcanaMajorEntry[]>;
  saveMajor: (next: ArcanaMajorEntry[]) => void;
  // Writer for the absolute field patch a consequence action produces (debility flags). Armor/HP go
  // through adjustCharacterStats instead, since those are additive.
  saveCharacterData: (patch: Partial<CharacterData>) => Promise<void>;
  // Transactional Armor/HP adjuster: applies a consequence's signed delta against the freshly-read doc.
  adjustCharacterStats: (deltas: Partial<Record<'statArmor' | 'statHp', number>>) => Promise<void>;
}

export const MajorArcanaPanel = ({ arcanaMajor, arcanaMajorRef, saveMajor, saveCharacterData, adjustCharacterStats }: MajorArcanaPanelProps) => {
  const [majorModalOpen, setMajorModalOpen] = useState(false);

  const existingMajorIds = useMemo(() => arcanaMajor.map((a) => a.id), [arcanaMajor]);

  const handleAddMajor = useCallback(
    (arcanum: MajorArcanum) => {
      const entry: ArcanaMajorEntry = {
        id: arcanum.id,
        marksValue: 0,
        mysteryMovesChecked: {},
        consequencesMarked: {},
      };
      saveMajor([...arcanaMajorRef.current, entry]);
      setMajorModalOpen(false);
    },
    [saveMajor],
  );

  const handleRemoveMajor = useCallback(
    (id: string) => {
      saveMajor(arcanaMajorRef.current.filter((a) => a.id !== id));
    },
    [saveMajor],
  );

  const handleMajorMarksChange = useCallback(
    (id: string, value: number) => {
      saveMajor(arcanaMajorRef.current.map((a) => (a.id === id ? withMarks(a, value) : a)));
    },
    [saveMajor],
  );

  const handleMysteryMoveToggle = useCallback(
    (id: string, moveId: string, checked: boolean) => {
      saveMajor(arcanaMajorRef.current.map((a) =>
        a.id === id
          ? { ...a, mysteryMovesChecked: { ...a.mysteryMovesChecked, [moveId]: checked } }
          : a,
      ));
    },
    [saveMajor],
  );

  const handleConsequenceToggle = useCallback(
    (id: string, consequenceId: string, checked: boolean) => {
      const arcanum = MAJOR_ARCANA.find((m) => m.id === id);
      // A consequence whose actions touch character fields (a debility, Armor/HP): compute the field
      // patch, the signed stat deltas, and any cascade-cleared descendant ids up front, then persist
      // once — not inside the map below, which React may run twice under StrictMode. The pre-toggle
      // marked map is read from the ref so unchecking a parent reverses only actually-marked descendants.
      const preToggleMarked = arcanaMajorRef.current.find((a) => a.id === id)?.consequencesMarked ?? {};
      const actionChange =
        arcanum && hasConsequenceActions(arcanum, consequenceId)
          ? applyConsequenceActions(arcanum, consequenceId, checked, preToggleMarked)
          : undefined;
      saveMajor(arcanaMajorRef.current.map((a) => {
        if (a.id !== id) return a;
        const consequencesMarked = { ...a.consequencesMarked, [consequenceId]: checked };
        // Unchecking a parent cascades down: clear every descendant's mark boxes (its own id plus any
        // multi-box `id#n` keys) so a child can't stay marked once its parent is gone.
        for (const clearedId of actionChange?.clearedConsequenceIds ?? []) {
          for (const key of Object.keys(consequencesMarked)) {
            if (key === clearedId || key.startsWith(`${clearedId}#`)) {
              consequencesMarked[key] = false;
            }
          }
        }
        if (actionChange) {
          return { ...a, consequencesMarked };
        }
        if (!consequenceId.startsWith('task-')) return { ...a, consequencesMarked };
        // Tasks are authored in the description now (not a fixed marks.tasks array), so count the
        // checked task-* keys directly rather than iterating a known length.
        const marksValue = Object.entries(consequencesMarked).filter(
          ([key, checked]) => key.startsWith('task-') && checked,
        ).length;
        return { ...withMarks(a, marksValue), consequencesMarked };
      }));
      // Persist the character-side effects. Failures already surface a toast via reportSave, so swallow
      // the rejection here to avoid an unhandled promise — the box stays as the player left it.
      if (actionChange && Object.keys(actionChange.dataPatch).length > 0) {
        saveCharacterData(actionChange.dataPatch).catch(() => {});
      }
      if (actionChange && (actionChange.statDeltas.statArmor || actionChange.statDeltas.statHp)) {
        adjustCharacterStats(actionChange.statDeltas).catch(() => {});
      }
    },
    [saveMajor, arcanaMajorRef, saveCharacterData, adjustCharacterStats],
  );

  const handleConsequenceTableChoice = useCallback(
    (id: string, consequenceId: string, rowId: string) => {
      saveMajor(arcanaMajorRef.current.map((a) =>
        a.id === id
          ? {
              ...a,
              consequenceTableChoice: {
                ...a.consequenceTableChoice,
                [consequenceId]: rowId,
              },
            }
          : a,
      ));
    },
    [saveMajor],
  );

  const handleMajorTrackerChange = useCallback(
    (id: string, moveId: string, value: number) => {
      saveMajor(arcanaMajorRef.current.map((a) =>
        a.id === id
          ? { ...a, trackerValues: { ...a.trackerValues, [moveId]: value } }
          : a,
      ));
    },
    [saveMajor],
  );

  const handleMajorFollowerHpChange = useCallback(
    (id: string, moveId: string, index: number, value: number) => {
      saveMajor(arcanaMajorRef.current.map((a) => {
        if (a.id !== id) return a;
        const existing = a.followerHp?.[moveId] ?? [];
        const updated = [...existing];
        updated[index] = value;
        return { ...a, followerHp: { ...a.followerHp, [moveId]: updated } };
      }));
    },
    [saveMajor],
  );

  const handleMajorBodyCheckChange = useCallback(
    (id: string, ownerId: string, itemId: string, checked: boolean) => {
      saveMajor(arcanaMajorRef.current.map((a) =>
        a.id === id
          ? {
              ...a,
              bodyChecks: {
                ...a.bodyChecks,
                [ownerId]: { ...a.bodyChecks?.[ownerId], [itemId]: checked },
              },
            }
          : a,
      ));
    },
    [saveMajor],
  );

  const handleMajorBodyInputChange = useCallback(
    (id: string, ownerId: string, itemId: string, value: string) => {
      saveMajor(arcanaMajorRef.current.map((a) =>
        a.id === id
          ? {
              ...a,
              bodyInputs: {
                ...a.bodyInputs,
                [ownerId]: { ...a.bodyInputs?.[ownerId], [itemId]: value },
              },
            }
          : a,
      ));
    },
    [saveMajor],
  );

  const handleMysteryCreatureSave = useCallback(
    (id: string, creature: Creature) => {
      saveMajor(arcanaMajorRef.current.map((a) =>
        a.id === id ? { ...a, mysteryCreature: creature } : a,
      ));
    },
    [saveMajor],
  );

  const handleOpenMajorModal = useCallback(() => setMajorModalOpen(true), []);
  const handleCloseMajorModal = useCallback(() => setMajorModalOpen(false), []);

  return (
    <>
      <div id="arcana-major-panel" role="tabpanel" aria-labelledby="arcana-major-tab" className={styles.panel}>
        <div className={styles.panelHeader}>
          <Button
            variant="secondary"
            size="sm"
            icon="plus"
            onClick={handleOpenMajorModal}
          >
            Add Major Arcanum
          </Button>
        </div>

        {arcanaMajor.length === 0 ? (
          <Text color="muted" className={styles.empty}>
            No major arcana yet. Add one when your character is assigned their arcanum.
          </Text>
        ) : (
          <div className={styles.cardList}>
            {arcanaMajor.map((entry) => {
              const arcanum = MAJOR_ARCANA.find((a) => a.id === entry.id);
              if (!arcanum) return null;
              return (
                <MajorArcanaCardRow
                  key={entry.id}
                  entry={entry}
                  arcanum={arcanum}
                  onMarksChange={handleMajorMarksChange}
                  onMysteryMoveToggle={handleMysteryMoveToggle}
                  onConsequenceToggle={handleConsequenceToggle}
                  onConsequenceTableChoice={handleConsequenceTableChoice}
                  onTrackerChange={handleMajorTrackerChange}
                  onFollowerHpChange={handleMajorFollowerHpChange}
                  onBodyCheckChange={handleMajorBodyCheckChange}
                  onBodyInputChange={handleMajorBodyInputChange}
                  onMysteryCreatureSave={handleMysteryCreatureSave}
                  onRemove={handleRemoveMajor}
                />
              );
            })}
          </div>
        )}
      </div>

      <AddArcanaModal
        key={majorModalOpen ? 'major-open' : 'major-closed'}
        open={majorModalOpen}
        onClose={handleCloseMajorModal}
        onAdd={handleAddMajor}
        items={MAJOR_ARCANA}
        existingIds={existingMajorIds}
        title="Add Major Arcanum"
        noun="major arcana"
        placeholder="e.g. staff, cloak, sword…"
      />
    </>
  );
};
