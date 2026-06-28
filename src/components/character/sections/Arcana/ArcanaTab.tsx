import { useState, lazy, Suspense } from 'react';
import { useOptimisticField } from '@/hooks/useOptimisticField';
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
  // An instinct-altering consequence (e.g. the Sword's "Paranoia") rewrites this field, so the major
  // panel needs the latest value (ref) and a way to persist it.
  const { ref: instinctRef, save: saveInstinct } = useOptimisticField(
    data?.instinct ?? '',
    (next) => onSave({ instinct: next }),
    'Failed to save.',
  );

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
            instinctRef={instinctRef}
            saveInstinct={saveInstinct}
          />
        )}
      </Suspense>
    </div>
  );
};
