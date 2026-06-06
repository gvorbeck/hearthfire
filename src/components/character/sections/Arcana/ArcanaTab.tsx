import { useState, useCallback, useMemo, useRef, memo, type KeyboardEvent } from 'react';
import { useOptimisticField } from '@/hooks/useOptimisticField';
import clsx from 'clsx';
import { Button, Text, Tooltip } from '@/components/ui';
import { MINOR_ARCANA } from '@/lib/arcanaMinor';
import { MAJOR_ARCANA } from '@/lib/arcanaMajor';
import type { MinorArcanum, MajorArcanum, ArcanaMinorEntry, ArcanaMajorEntry, CharacterData } from '@/types';
import { MinorArcanaCard } from './MinorArcanaCard';
import { MajorArcanaCard } from './MajorArcanaCard';
import { AddArcanaModal } from './AddArcanaModal';
import styles from './ArcanaTab.module.css';

type ArcanaSubTab = 'minor' | 'major';

interface MinorArcanaCardRowProps {
  entry: ArcanaMinorEntry;
  arcanum: MinorArcanum;
  onToggleRequirement: (id: string, key: string, checked: boolean) => void;
  onTrackerChange: (id: string, value: number) => void;
  onFollowerHpChange: (id: string, index: number, value: number) => void;
  onRemove: (id: string) => void;
}

const MinorArcanaCardRow = memo(({ entry, arcanum, onToggleRequirement, onTrackerChange, onFollowerHpChange, onRemove }: MinorArcanaCardRowProps) => {
  const handleToggle = useCallback((key: string, checked: boolean) => onToggleRequirement(entry.id, key, checked), [entry.id, onToggleRequirement]);
  const handleTracker = useCallback((value: number) => onTrackerChange(entry.id, value), [entry.id, onTrackerChange]);
  const handleFollowerHp = useCallback((index: number, value: number) => onFollowerHpChange(entry.id, index, value), [entry.id, onFollowerHpChange]);
  const handleRemove = useCallback(() => onRemove(entry.id), [entry.id, onRemove]);
  return (
    <MinorArcanaCard
      arcanum={arcanum}
      requirementsChecked={entry.requirementsChecked}
      trackerValue={entry.trackerValue}
      followerHp={entry.followerHp}
      onToggleRequirement={handleToggle}
      onTrackerChange={handleTracker}
      onFollowerHpChange={handleFollowerHp}
      onRemove={handleRemove}
    />
  );
});

interface MajorArcanaCardRowProps {
  entry: ArcanaMajorEntry;
  arcanum: MajorArcanum;
  onMarksChange: (id: string, value: number) => void;
  onMysteryMoveToggle: (id: string, moveId: string, checked: boolean) => void;
  onConsequenceToggle: (id: string, consequenceId: string, checked: boolean) => void;
  onTrackerChange: (id: string, moveId: string, value: number) => void;
  onFollowerHpChange: (id: string, moveId: string, index: number, value: number) => void;
  onRemove: (id: string) => void;
}

const MajorArcanaCardRow = memo(({ entry, arcanum, onMarksChange, onMysteryMoveToggle, onConsequenceToggle, onTrackerChange, onFollowerHpChange, onRemove }: MajorArcanaCardRowProps) => {
  const handleMarks = useCallback((value: number) => onMarksChange(entry.id, value), [entry.id, onMarksChange]);
  const handleMysteryMove = useCallback((moveId: string, checked: boolean) => onMysteryMoveToggle(entry.id, moveId, checked), [entry.id, onMysteryMoveToggle]);
  const handleConsequence = useCallback((consequenceId: string, checked: boolean) => onConsequenceToggle(entry.id, consequenceId, checked), [entry.id, onConsequenceToggle]);
  const handleTracker = useCallback((moveId: string, value: number) => onTrackerChange(entry.id, moveId, value), [entry.id, onTrackerChange]);
  const handleFollowerHp = useCallback((moveId: string, index: number, value: number) => onFollowerHpChange(entry.id, moveId, index, value), [entry.id, onFollowerHpChange]);
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
      onRemove={handleRemove}
    />
  );
});

interface ArcanaTabProps {
  data: CharacterData | undefined;
  onSave: (data: Partial<CharacterData>) => Promise<void>;
}

export const ArcanaTab = ({ data, onSave }: ArcanaTabProps) => {
  const [subTab, setSubTab] = useState<ArcanaSubTab>('minor');
  const [minorModalOpen, setMinorModalOpen] = useState(false);
  const [majorModalOpen, setMajorModalOpen] = useState(false);
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const { value: arcanaMinor, ref: arcanaMinorRef, save: saveMinor } = useOptimisticField(
    data?.arcanaMinor ?? [],
    (next) => onSave({ arcanaMinor: next }),
    'Failed to save.',
  );
  const { value: arcanaMajor, ref: arcanaMajorRef, save: saveMajor } = useOptimisticField(
    data?.arcanaMajor ?? [],
    (next) => onSave({ arcanaMajor: next }),
    'Failed to save.',
  );

  const existingMinorIds = useMemo(() => arcanaMinor.map((a) => a.id), [arcanaMinor]);

  const handleAddMinor = useCallback(
    (arcanum: MinorArcanum) => {
      const entry: ArcanaMinorEntry = { id: arcanum.id, requirementsChecked: {} };
      if (arcanum.move.tracker) entry.trackerValue = 0;
      if (arcanum.move.follower) {
        const count = arcanum.move.follower.hpCount ?? 1;
        entry.followerHp = Array.from({ length: count }, () => arcanum.move.follower!.hp);
      }
      saveMinor([...arcanaMinorRef.current, entry]);
      setMinorModalOpen(false);
    },
    [saveMinor],
  );

  const handleRandomMinor = useCallback(() => {
    const available = MINOR_ARCANA.filter((a) => !arcanaMinorRef.current.some((e) => e.id === a.id));
    if (available.length === 0) return;
    const pick = available[Math.floor(Math.random() * available.length)];
    handleAddMinor(pick);
  }, [handleAddMinor]);

  const handleRemoveMinor = useCallback(
    (id: string) => {
      saveMinor(arcanaMinorRef.current.filter((a) => a.id !== id));
    },
    [saveMinor],
  );

  const handleToggleRequirement = useCallback(
    (id: string, key: string, checked: boolean) => {
      saveMinor(arcanaMinorRef.current.map((a) =>
        a.id === id ? { ...a, requirementsChecked: { ...a.requirementsChecked, [key]: checked } } : a,
      ));
    },
    [saveMinor],
  );

  const handleMinorTrackerChange = useCallback(
    (id: string, value: number) => {
      saveMinor(arcanaMinorRef.current.map((a) => (a.id === id ? { ...a, trackerValue: value } : a)));
    },
    [saveMinor],
  );

  const handleMinorFollowerHpChange = useCallback(
    (id: string, index: number, value: number) => {
      saveMinor(arcanaMinorRef.current.map((a) => {
        if (a.id !== id) return a;
        const followerHp = [...(a.followerHp ?? [])];
        followerHp[index] = value;
        return { ...a, followerHp };
      }));
    },
    [saveMinor],
  );

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

  const handleSelectMinorTab = useCallback(() => setSubTab('minor'), []);
  const handleSelectMajorTab = useCallback(() => setSubTab('major'), []);
  const handleOpenMinorModal = useCallback(() => setMinorModalOpen(true), []);
  const handleOpenMajorModal = useCallback(() => setMajorModalOpen(true), []);
  const handleCloseMinorModal = useCallback(() => setMinorModalOpen(false), []);
  const handleCloseMajorModal = useCallback(() => setMajorModalOpen(false), []);

  const minorTabCx = clsx(styles.subTab, subTab === 'minor' && styles.subTabActive);
  const majorTabCx = clsx(styles.subTab, subTab === 'major' && styles.subTabActive);

  const handleTabKeyDown = useCallback(
    (e: KeyboardEvent<HTMLDivElement>) => {
      const tabs: ArcanaSubTab[] = ['minor', 'major'];
      const currentIndex = tabs.indexOf(subTab);
      let nextIndex: number | null = null;

      if (e.key === 'ArrowRight') {
        nextIndex = (currentIndex + 1) % tabs.length;
      } else if (e.key === 'ArrowLeft') {
        nextIndex = (currentIndex - 1 + tabs.length) % tabs.length;
      } else if (e.key === 'Home') {
        e.preventDefault();
        nextIndex = 0;
      } else if (e.key === 'End') {
        e.preventDefault();
        nextIndex = tabs.length - 1;
      }

      if (nextIndex !== null) {
        e.preventDefault();
        setSubTab(tabs[nextIndex]);
        tabRefs.current[nextIndex]?.focus();
      }
    },
    [subTab],
  );

  return (
    <div className={styles.root}>
      <div className={styles.tabRow}>
        <div className={styles.subTabBar} role="tablist" onKeyDown={handleTabKeyDown}>
          <button
            ref={(el) => { tabRefs.current[0] = el; }}
            id="arcana-minor-tab"
            role="tab"
            className={minorTabCx}
            onClick={handleSelectMinorTab}
            aria-selected={subTab === 'minor'}
            aria-controls="arcana-minor-panel"
            tabIndex={subTab === 'minor' ? 0 : -1}
          >
            Minor Arcana
            {arcanaMinor.length > 0 && (
              <span className={styles.badge}>{arcanaMinor.length}</span>
            )}
          </button>
          <button
            ref={(el) => { tabRefs.current[1] = el; }}
            id="arcana-major-tab"
            role="tab"
            className={majorTabCx}
            onClick={handleSelectMajorTab}
            aria-selected={subTab === 'major'}
            aria-controls="arcana-major-panel"
            tabIndex={subTab === 'major' ? 0 : -1}
          >
            Major Arcana
            {arcanaMajor.length > 0 && (
              <span className={styles.badge}>{arcanaMajor.length}</span>
            )}
          </button>
        </div>
      </div>

      {subTab === 'minor' && (
        <div id="arcana-minor-panel" role="tabpanel" aria-labelledby="arcana-minor-tab" className={styles.panel}>
          <div className={styles.panelHeader}>
            <Button
              variant="secondary"
              size="sm"
              icon="plus"
              onClick={handleOpenMinorModal}
            >
              Add Minor Arcanum
            </Button>
            <Tooltip text="Add a random minor arcanum" side="right" noTabStop>
              <Button
                variant="secondary"
                size="sm"
                icon="dice"
                onClick={handleRandomMinor}
                aria-label="Add random minor arcanum"
              />
            </Tooltip>
          </div>

          {arcanaMinor.length === 0 ? (
            <Text as="p" size="sm" color="muted" className={styles.empty}>
              No minor arcana yet. Add one when your character discovers an arcanum.
            </Text>
          ) : (
            <div className={styles.cardList}>
              {arcanaMinor.map((entry) => {
                const arcanum = MINOR_ARCANA.find((a) => a.id === entry.id);
                if (!arcanum) return null;
                return (
                  <MinorArcanaCardRow
                    key={entry.id}
                    entry={entry}
                    arcanum={arcanum}
                    onToggleRequirement={handleToggleRequirement}
                    onTrackerChange={handleMinorTrackerChange}
                    onFollowerHpChange={handleMinorFollowerHpChange}
                    onRemove={handleRemoveMinor}
                  />
                );
              })}
            </div>
          )}
        </div>
      )}

      {subTab === 'major' && (
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
            <Text as="p" size="sm" color="muted" className={styles.empty}>
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
                    onRemove={handleRemoveMajor}
                  />
                );
              })}
            </div>
          )}
        </div>
      )}

      <AddArcanaModal
        key={minorModalOpen ? 'open' : 'closed'}
        open={minorModalOpen}
        onClose={handleCloseMinorModal}
        onAdd={handleAddMinor}
        items={MINOR_ARCANA}
        existingIds={existingMinorIds}
        title="Add Minor Arcanum"
        noun="minor arcana"
        placeholder="e.g. scroll, wolf pelt, cave…"
      />

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
    </div>
  );
};
