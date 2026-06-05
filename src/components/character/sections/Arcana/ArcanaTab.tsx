import { useState, useCallback, useMemo, useRef, memo, type KeyboardEvent } from 'react';
import { useFirestoreSync } from '@/hooks/useFirestoreSync';
import clsx from 'clsx';
import { Button, Text } from '@/components/ui';
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

  const [arcanaMinor, setArcanaMinor] = useState<ArcanaMinorEntry[]>(data?.arcanaMinor ?? []);
  const [arcanaMajor, setArcanaMajor] = useState<ArcanaMajorEntry[]>(data?.arcanaMajor ?? []);
  const minorPendingRef = useRef(false);
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const majorPendingRef = useRef(false);

  useFirestoreSync(data?.arcanaMinor ?? [], setArcanaMinor, minorPendingRef);
  useFirestoreSync(data?.arcanaMajor ?? [], setArcanaMajor, majorPendingRef);

  const saveMinor = useCallback(
    (next: ArcanaMinorEntry[]) => {
      minorPendingRef.current = true;
      onSave({ arcanaMinor: next })
        .catch(() => { setArcanaMinor(data?.arcanaMinor ?? []); })
        .finally(() => { minorPendingRef.current = false; });
    },
    [onSave, data?.arcanaMinor],
  );

  const saveMajor = useCallback(
    (next: ArcanaMajorEntry[]) => {
      majorPendingRef.current = true;
      onSave({ arcanaMajor: next })
        .catch(() => { setArcanaMajor(data?.arcanaMajor ?? []); })
        .finally(() => { majorPendingRef.current = false; });
    },
    [onSave, data?.arcanaMajor],
  );

  // Minor handlers
  const existingMinorIds = useMemo(() => arcanaMinor.map((a) => a.id), [arcanaMinor]);

  const handleAddMinor = useCallback(
    (arcanum: MinorArcanum) => {
      const entry: ArcanaMinorEntry = { id: arcanum.id, requirementsChecked: {} };
      if (arcanum.move.tracker) entry.trackerValue = 0;
      if (arcanum.move.follower) {
        const count = arcanum.move.follower.hpCount ?? 1;
        entry.followerHp = Array.from({ length: count }, () => arcanum.move.follower!.hp);
      }
      const next = [...arcanaMinor, entry];
      setArcanaMinor(next);
      saveMinor(next);
      setMinorModalOpen(false);
    },
    [arcanaMinor, saveMinor],
  );

  const handleRemoveMinor = useCallback(
    (id: string) => {
      const next = arcanaMinor.filter((a) => a.id !== id);
      setArcanaMinor(next);
      saveMinor(next);
    },
    [arcanaMinor, saveMinor],
  );

  const handleToggleRequirement = useCallback(
    (id: string, key: string, checked: boolean) => {
      const next = arcanaMinor.map((a) =>
        a.id === id ? { ...a, requirementsChecked: { ...a.requirementsChecked, [key]: checked } } : a,
      );
      setArcanaMinor(next);
      saveMinor(next);
    },
    [arcanaMinor, saveMinor],
  );

  const handleMinorTrackerChange = useCallback(
    (id: string, value: number) => {
      const next = arcanaMinor.map((a) => (a.id === id ? { ...a, trackerValue: value } : a));
      setArcanaMinor(next);
      saveMinor(next);
    },
    [arcanaMinor, saveMinor],
  );

  const handleMinorFollowerHpChange = useCallback(
    (id: string, index: number, value: number) => {
      const next = arcanaMinor.map((a) => {
        if (a.id !== id) return a;
        const followerHp = [...(a.followerHp ?? [])];
        followerHp[index] = value;
        return { ...a, followerHp };
      });
      setArcanaMinor(next);
      saveMinor(next);
    },
    [arcanaMinor, saveMinor],
  );

  // Major handlers
  const existingMajorIds = useMemo(() => arcanaMajor.map((a) => a.id), [arcanaMajor]);

  const handleAddMajor = useCallback(
    (arcanum: MajorArcanum) => {
      const entry: ArcanaMajorEntry = {
        id: arcanum.id,
        marksValue: 0,
        mysteryMovesChecked: {},
        consequencesMarked: {},
      };
      const next = [...arcanaMajor, entry];
      setArcanaMajor(next);
      saveMajor(next);
      setMajorModalOpen(false);
    },
    [arcanaMajor, saveMajor],
  );

  const handleRemoveMajor = useCallback(
    (id: string) => {
      const next = arcanaMajor.filter((a) => a.id !== id);
      setArcanaMajor(next);
      saveMajor(next);
    },
    [arcanaMajor, saveMajor],
  );

  const handleMajorMarksChange = useCallback(
    (id: string, value: number) => {
      const next = arcanaMajor.map((a) => (a.id === id ? { ...a, marksValue: value } : a));
      setArcanaMajor(next);
      saveMajor(next);
    },
    [arcanaMajor, saveMajor],
  );

  const handleMysteryMoveToggle = useCallback(
    (id: string, moveId: string, checked: boolean) => {
      const next = arcanaMajor.map((a) =>
        a.id === id
          ? { ...a, mysteryMovesChecked: { ...a.mysteryMovesChecked, [moveId]: checked } }
          : a,
      );
      setArcanaMajor(next);
      saveMajor(next);
    },
    [arcanaMajor, saveMajor],
  );

  const handleConsequenceToggle = useCallback(
    (id: string, consequenceId: string, checked: boolean) => {
      const next = arcanaMajor.map((a) => {
        if (a.id !== id) return a;
        const consequencesMarked = { ...a.consequencesMarked, [consequenceId]: checked };
        if (!consequenceId.startsWith('task-')) return { ...a, consequencesMarked };
        const arcanum = MAJOR_ARCANA.find((m) => m.id === id);
        const taskCount = arcanum?.marks.tasks?.length ?? 0;
        const marksValue = Array.from({ length: taskCount }, (_, i) => !!consequencesMarked[`task-${i}`]).filter(Boolean).length;
        return { ...a, consequencesMarked, marksValue };
      });
      setArcanaMajor(next);
      saveMajor(next);
    },
    [arcanaMajor, saveMajor],
  );

  const handleMajorTrackerChange = useCallback(
    (id: string, moveId: string, value: number) => {
      const next = arcanaMajor.map((a) =>
        a.id === id
          ? { ...a, trackerValues: { ...a.trackerValues, [moveId]: value } }
          : a,
      );
      setArcanaMajor(next);
      saveMajor(next);
    },
    [arcanaMajor, saveMajor],
  );

  const handleMajorFollowerHpChange = useCallback(
    (id: string, moveId: string, index: number, value: number) => {
      const next = arcanaMajor.map((a) => {
        if (a.id !== id) return a;
        const existing = a.followerHp?.[moveId] ?? [];
        const updated = [...existing];
        updated[index] = value;
        return { ...a, followerHp: { ...a.followerHp, [moveId]: updated } };
      });
      setArcanaMajor(next);
      saveMajor(next);
    },
    [arcanaMajor, saveMajor],
  );

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
            onClick={() => setSubTab('minor')}
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
            onClick={() => setSubTab('major')}
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
              onClick={() => setMinorModalOpen(true)}
            >
              Add Minor Arcanum
            </Button>
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
              onClick={() => setMajorModalOpen(true)}
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
        onClose={() => setMinorModalOpen(false)}
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
        onClose={() => setMajorModalOpen(false)}
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
