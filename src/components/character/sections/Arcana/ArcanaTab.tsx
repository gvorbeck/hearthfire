import { useState, useEffect, useCallback, lazy, Suspense } from 'react';
import { useOptimisticField } from '@/hooks/useOptimisticField';
import type { PlaybookSectionProps } from '@/types';
import { Spinner } from '@/components/ui';
import { ArcanaSubTabs, type ArcanaSubTab } from './ArcanaSubTabs';
import styles from './ArcanaTab.module.css';

// The character tab lives in the first hash segment (e.g. "#arcana", from useHashTabs); the Arcana
// sub-tab lives in a second "&"-delimited segment ("#arcana&major") so a refresh or shared link keeps
// both. Read the sub-tab from that segment, defaulting to "minor".
const readSubTabFromHash = (): ArcanaSubTab =>
  window.location.hash.slice(1).split('&')[1] === 'major' ? 'major' : 'minor';

// Rewrite the hash's sub-tab segment while preserving the leading character-tab segment that
// useHashTabs owns. "major" gets the "&major" segment; "minor" (the default) drops it for a clean hash.
// Fall back to "arcana" when there's no leading segment (e.g. a hand-edited "#&major") so we never write
// a hash that starts with "&".
const writeSubTabToHash = (subTab: ArcanaSubTab) => {
  const characterTab = window.location.hash.slice(1).split('&')[0] || 'arcana';
  window.location.hash = subTab === 'major' ? `${characterTab}&major` : characterTab;
};

// Each panel statically imports its (large) arcana dataset, so lazy-loading the
// panels splits MAJOR_ARCANA and MINOR_ARCANA into separate chunks that load
// only when their sub-tab is viewed.
const MinorArcanaPanel = lazy(() =>
  import('./MinorArcanaPanel').then((m) => ({ default: m.MinorArcanaPanel })),
);
const MajorArcanaPanel = lazy(() =>
  import('./MajorArcanaPanel').then((m) => ({ default: m.MajorArcanaPanel })),
);

interface ArcanaTabProps extends PlaybookSectionProps {
  // Transactional Armor/HP adjuster: a consequence's armor/maxHp action applies its delta against the
  // freshly-read doc, so rapid toggles or a stale snapshot can't strand the stat on the wrong value.
  adjustCharacterStats: (deltas: Partial<Record<'statArmor' | 'statHp', number>>) => Promise<void>;
}

export const ArcanaTab = ({ data, onSave, adjustCharacterStats }: ArcanaTabProps) => {
  const [subTab, setSubTab] = useState<ArcanaSubTab>(readSubTabFromHash);

  const handleSelectSubTab = useCallback((next: ArcanaSubTab) => {
    setSubTab(next);
    writeSubTabToHash(next);
  }, []);

  // Keep the sub-tab in sync when the hash changes outside our own writes — browser back/forward, or
  // useHashTabs rewriting the character-tab segment (which would otherwise drop our "&major").
  useEffect(() => {
    const onHashChange = () => setSubTab(readSubTabFromHash());
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

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
  return (
    <div className={styles.root}>
      <ArcanaSubTabs
        subTab={subTab}
        onSelect={handleSelectSubTab}
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
            saveCharacterData={onSave}
            adjustCharacterStats={adjustCharacterStats}
          />
        )}
      </Suspense>
    </div>
  );
};
