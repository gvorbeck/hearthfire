import { useState, useCallback, useEffect, useRef } from 'react';
import clsx from 'clsx';
import { Button, Text } from '@/components/primitives';
import { MINOR_ARCANA, type MinorArcanum } from '@/lib/arcanaMinor';
import type { ArcanaMinorEntry, CharacterData } from '@/types';
import { MinorArcanaCard } from './MinorArcanaCard';
import { AddMinorArcanaModal } from './AddMinorArcanaModal';
import styles from './ArcanaTab.module.css';

type ArcanaSubTab = 'minor' | 'major';

interface ArcanaTabProps {
  data: CharacterData | undefined;
  onSave: (data: Partial<CharacterData>) => Promise<void>;
}

export const ArcanaTab = ({ data, onSave }: ArcanaTabProps) => {
  const [subTab, setSubTab] = useState<ArcanaSubTab>('minor');
  const [modalOpen, setModalOpen] = useState(false);

  // Suppress re-sync from Firestore while a write is in-flight to avoid reverting rapid checkbox clicks.
  const [arcanaMinor, setArcanaMinor] = useState<ArcanaMinorEntry[]>(data?.arcanaMinor ?? []);
  const pendingRef = useRef(false);

  useEffect(() => {
    if (pendingRef.current) return;
    setArcanaMinor(data?.arcanaMinor ?? []);
  }, [data?.arcanaMinor]);

  const save = useCallback(
    (next: ArcanaMinorEntry[]) => {
      pendingRef.current = true;
      onSave({ arcanaMinor: next })
        .catch(() => {
          setArcanaMinor(data?.arcanaMinor ?? []);
        })
        .finally(() => {
          pendingRef.current = false;
        });
    },
    [onSave, data?.arcanaMinor],
  );

  const existingIds = arcanaMinor.map((a) => a.id);

  const handleAdd = useCallback(
    (arcanum: MinorArcanum) => {
      const entry: ArcanaMinorEntry = { id: arcanum.id, requirementsChecked: {} };
      if (arcanum.move.tracker) entry.trackerValue = 0;
      if (arcanum.move.follower) {
        const count = arcanum.move.follower.hpCount ?? 1;
        entry.followerHp = Array.from({ length: count }, () => arcanum.move.follower!.hp);
      }
      const next = [...arcanaMinor, entry];
      setArcanaMinor(next);
      save(next);
      setModalOpen(false);
    },
    [arcanaMinor, save],
  );

  const handleRemove = useCallback(
    (id: string) => {
      const next = arcanaMinor.filter((a) => a.id !== id);
      setArcanaMinor(next);
      save(next);
    },
    [arcanaMinor, save],
  );

  const handleToggleRequirement = useCallback(
    (id: string, key: string, checked: boolean) => {
      const next = arcanaMinor.map((a) =>
        a.id === id
          ? { ...a, requirementsChecked: { ...a.requirementsChecked, [key]: checked } }
          : a,
      );
      setArcanaMinor(next);
      save(next);
    },
    [arcanaMinor, save],
  );

  const handleTrackerChange = useCallback(
    (id: string, value: number) => {
      const next = arcanaMinor.map((a) => (a.id === id ? { ...a, trackerValue: value } : a));
      setArcanaMinor(next);
      save(next);
    },
    [arcanaMinor, save],
  );

  const handleFollowerHpChange = useCallback(
    (id: string, index: number, value: number) => {
      const next = arcanaMinor.map((a) => {
        if (a.id !== id) return a;
        const followerHp = [...(a.followerHp ?? [])];
        followerHp[index] = value;
        return { ...a, followerHp };
      });
      setArcanaMinor(next);
      save(next);
    },
    [arcanaMinor, save],
  );

  const minorTabCx = clsx(styles.subTab, subTab === 'minor' && styles.subTabActive);
  const majorTabCx = clsx(styles.subTab, subTab === 'major' && styles.subTabActive);

  return (
    <div className={styles.root}>
      <div className={styles.subTabBar}>
        <button
          className={minorTabCx}
          onClick={() => setSubTab('minor')}
          aria-pressed={subTab === 'minor'}
        >
          Minor Arcana
        </button>
        <button
          className={majorTabCx}
          onClick={() => setSubTab('major')}
          aria-pressed={subTab === 'major'}
        >
          Major Arcana
        </button>
      </div>

      {subTab === 'minor' && (
        <div className={styles.panel}>
          <div className={styles.panelHeader}>
            <Button
              variant="secondary"
              size="sm"
              icon="plus"
              onClick={() => setModalOpen(true)}
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
                  <MinorArcanaCard
                    key={entry.id}
                    arcanum={arcanum}
                    requirementsChecked={entry.requirementsChecked}
                    trackerValue={entry.trackerValue}
                    followerHp={entry.followerHp}
                    onToggleRequirement={(key, checked) =>
                      handleToggleRequirement(entry.id, key, checked)
                    }
                    onTrackerChange={(value) => handleTrackerChange(entry.id, value)}
                    onFollowerHpChange={(index, value) =>
                      handleFollowerHpChange(entry.id, index, value)
                    }
                    onRemove={() => handleRemove(entry.id)}
                  />
                );
              })}
            </div>
          )}
        </div>
      )}

      {subTab === 'major' && (
        <div className={styles.panel}>
          <Text as="p" size="sm" color="muted" className={styles.empty}>
            Major arcana coming soon.
          </Text>
        </div>
      )}

      <AddMinorArcanaModal
        key={modalOpen ? 'open' : 'closed'}
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onAdd={handleAdd}
        existingIds={existingIds}
      />
    </div>
  );
};
