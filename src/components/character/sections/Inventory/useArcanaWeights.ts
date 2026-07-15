import { useEffect, useState } from 'react';
import { useToastOptional } from '@/components/app/Toast/ToastContext';
import type { ArcanaMinorEntry, ArcanaMajorEntry } from '@/types';

// Inventory needs each carried arcanum's name and weight, but those live in the large
// arcana datasets (~163 kB). Importing them statically would ship that chunk on every
// character-page load, defeating the lazy ArcanaTab boundary. Instead we dynamically
// import the datasets only when the character actually has arcana entries, projecting
// out just the id -> { name, weight } we need. Characters with no arcana (the common
// case) never download anything.
export interface ArcanaWeight {
  name: string;
  weight?: 1 | 2;
}

export type ArcanaWeights = Record<string, ArcanaWeight>;

interface LoadedArcanaWeights {
  minor: ArcanaWeights;
  major: ArcanaWeights;
}

const toWeightMap = (arcana: { id: string; name: string; weight?: 1 | 2 }[]): ArcanaWeights =>
  arcana.reduce<ArcanaWeights>((acc, { id, name, weight }) => {
    acc[id] = { name, weight };
    return acc;
  }, {});

// Returns the loaded weight maps, or null while the dynamic import is in flight. When the
// character has no arcana at all, resolves to empty maps without importing the datasets.
export const useArcanaWeights = (
  arcanaMinor: ArcanaMinorEntry[],
  arcanaMajor: ArcanaMajorEntry[],
): LoadedArcanaWeights | null => {
  const hasArcana = arcanaMinor.length > 0 || arcanaMajor.length > 0;
  const [weights, setWeights] = useState<LoadedArcanaWeights | null>(
    hasArcana ? null : { minor: {}, major: {} },
  );
  const addToast = useToastOptional()?.addToast;

  useEffect(() => {
    if (!hasArcana) {
      // Early branch of an effect whose main job is a dynamic import(); fires only
      // when arcana is removed after mount, not a per-render cascade.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setWeights({ minor: {}, major: {} });
      return;
    }
    let active = true;
    Promise.all([import('@/lib/arcana/minor'), import('@/lib/arcana/major')])
      .then(([minor, major]) => {
        if (!active) return;
        setWeights({
          minor: toWeightMap(minor.MINOR_ARCANA),
          major: toWeightMap(major.MAJOR_ARCANA),
        });
      })
      .catch(() => {
        if (!active) return;
        // The data failed to download (e.g. offline). Fall back to empty maps so the load total
        // resolves instead of hanging on the pending indicator; carried arcana are simply omitted.
        setWeights({ minor: {}, major: {} });
        addToast?.('Could not load arcana weights; load total may be incomplete.', 'error');
      });
    return () => {
      active = false;
    };
  }, [hasArcana, addToast]);

  return weights;
};
