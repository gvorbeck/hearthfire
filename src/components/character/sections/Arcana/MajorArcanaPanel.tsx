import { useState, useCallback, useMemo, memo, type MutableRefObject } from 'react';
import { Button, Text } from '@/components/ui';
import { MAJOR_ARCANA } from '@/lib/arcanaMajor';
import type { MajorArcanum, ArcanaMajorEntry, Creature } from '@/types';
import { MajorArcanaCard } from './MajorArcanaCard';
import { AddArcanaModal } from './AddArcanaModal';
import styles from './ArcanaPanel.module.css';

interface MajorArcanaCardRowProps {
  entry: ArcanaMajorEntry;
  arcanum: MajorArcanum;
  onMarksChange: (id: string, value: number) => void;
  onMysteryMoveToggle: (id: string, moveId: string, checked: boolean) => void;
  onConsequenceToggle: (id: string, consequenceId: string, checked: boolean) => void;
  onTrackerChange: (id: string, moveId: string, value: number) => void;
  onFollowerHpChange: (id: string, moveId: string, index: number, value: number) => void;
  onBodyCheckChange: (id: string, moveId: string, itemId: string, checked: boolean) => void;
  onMysteryCreatureSave: (id: string, creature: Creature) => void;
  onRemove: (id: string) => void;
}

const MajorArcanaCardRow = memo(({ entry, arcanum, onMarksChange, onMysteryMoveToggle, onConsequenceToggle, onTrackerChange, onFollowerHpChange, onBodyCheckChange, onMysteryCreatureSave, onRemove }: MajorArcanaCardRowProps) => {
  const handleMarks = useCallback((value: number) => onMarksChange(entry.id, value), [entry.id, onMarksChange]);
  const handleMysteryMove = useCallback((moveId: string, checked: boolean) => onMysteryMoveToggle(entry.id, moveId, checked), [entry.id, onMysteryMoveToggle]);
  const handleConsequence = useCallback((consequenceId: string, checked: boolean) => onConsequenceToggle(entry.id, consequenceId, checked), [entry.id, onConsequenceToggle]);
  const handleTracker = useCallback((moveId: string, value: number) => onTrackerChange(entry.id, moveId, value), [entry.id, onTrackerChange]);
  const handleFollowerHp = useCallback((moveId: string, index: number, value: number) => onFollowerHpChange(entry.id, moveId, index, value), [entry.id, onFollowerHpChange]);
  const handleBodyCheck = useCallback((moveId: string, itemId: string, checked: boolean) => onBodyCheckChange(entry.id, moveId, itemId, checked), [entry.id, onBodyCheckChange]);
  const handleMysteryCreature = useCallback((creature: Creature) => onMysteryCreatureSave(entry.id, creature), [entry.id, onMysteryCreatureSave]);
  const handleRemove = useCallback(() => onRemove(entry.id), [entry.id, onRemove]);
  return (
    <MajorArcanaCard
      arcanum={arcanum}
      entry={entry}
      onMarksChange={handleMarks}
      onMysteryMoveToggle={handleMysteryMove}
      onConsequenceToggle={handleConsequence}
      onTrackerChange={handleTracker}
      onFollowerHpChange={handleFollowerHp}
      onBodyCheckChange={handleBodyCheck}
      onMysteryCreatureSave={handleMysteryCreature}
      onRemove={handleRemove}
    />
  );
});

interface MajorArcanaPanelProps {
  arcanaMajor: ArcanaMajorEntry[];
  arcanaMajorRef: MutableRefObject<ArcanaMajorEntry[]>;
  saveMajor: (next: ArcanaMajorEntry[]) => void;
}

export const MajorArcanaPanel = ({ arcanaMajor, arcanaMajorRef, saveMajor }: MajorArcanaPanelProps) => {
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
      saveMajor(arcanaMajorRef.current.map((a) => (a.id === id ? { ...a, marksValue: value } : a)));
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
      saveMajor(arcanaMajorRef.current.map((a) => {
        if (a.id !== id) return a;
        const consequencesMarked = { ...a.consequencesMarked, [consequenceId]: checked };
        if (!consequenceId.startsWith('task-')) return { ...a, consequencesMarked };
        const arcanum = MAJOR_ARCANA.find((m) => m.id === id);
        const taskCount = arcanum?.marks.tasks?.length ?? 0;
        const marksValue = Array.from({ length: taskCount }, (_, i) => !!consequencesMarked[`task-${i}`]).filter(Boolean).length;
        return { ...a, consequencesMarked, marksValue };
      }));
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
    (id: string, moveId: string, itemId: string, checked: boolean) => {
      saveMajor(arcanaMajorRef.current.map((a) =>
        a.id === id
          ? {
              ...a,
              bodyChecks: {
                ...a.bodyChecks,
                [moveId]: { ...a.bodyChecks?.[moveId], [itemId]: checked },
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
                  onTrackerChange={handleMajorTrackerChange}
                  onFollowerHpChange={handleMajorFollowerHpChange}
                  onBodyCheckChange={handleMajorBodyCheckChange}
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
