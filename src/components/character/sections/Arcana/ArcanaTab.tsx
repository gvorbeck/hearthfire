import { useState, lazy, Suspense } from 'react';
import { useOptimisticField } from '@/hooks/useOptimisticField';
import { useLatest } from '@/hooks/useLatest';
import type { PlaybookSectionProps } from '@/types';
import { Spinner } from '@/components/ui';
import { ArcanaSubTabs, type ArcanaSubTab } from './ArcanaSubTabs';
import styles from './ArcanaTab.module.css';

// Each panel statically imports its (large) arcana dataset, so lazy-loading the
// panels splits MAJOR_ARCANA and MINOR_ARCANA into separate chunks that load
// only when their sub-tab is viewed.
const MinorArcanaPanel = lazy(() =>
  import('./MinorArcanaPanel').then((m) => ({ default: m.MinorArcanaPanel })),
);
const MajorArcanaPanel = lazy(() =>
  import('./MajorArcanaPanel').then((m) => ({ default: m.MajorArcanaPanel })),
);

type ArcanaTabProps = PlaybookSectionProps;

export const ArcanaTab = ({ data, onSave }: ArcanaTabProps) => {
  const [subTab, setSubTab] = useState<ArcanaSubTab>('minor');

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
  // A consequence's armor action adds to the PC's Armor relative to its current value; the major panel
  // reads it on toggle and persists the new value via onSave (Stats reconciles from the snapshot). Armor
  // is edited in another tab, so the snapshot value is current.
  const actionContextRef = useLatest({ armor: data?.statArmor ?? '0' });

  return (
    <div className={styles.root}>
      <ArcanaSubTabs
        subTab={subTab}
        onSelect={setSubTab}
        minorCount={arcanaMinor.length}
        majorCount={arcanaMajor.length}
      />

      <Suspense fallback={<div className={styles.loading}><Spinner /></div>}>
        {subTab === 'minor' && (
          <MinorArcanaPanel
            arcanaMinor={arcanaMinor}
            arcanaMinorRef={arcanaMinorRef}
            saveMinor={saveMinor}
          />
        )}

        {subTab === 'major' && (
          <MajorArcanaPanel
            arcanaMajor={arcanaMajor}
            arcanaMajorRef={arcanaMajorRef}
            saveMajor={saveMajor}
            actionContextRef={actionContextRef}
            saveCharacterData={onSave}
          />
        )}
      </Suspense>
    </div>
  );
};
