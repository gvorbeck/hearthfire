import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { GmImprovement, SteadingData } from '@/types';
import { useToast } from '@/components/app';
import { ImprovementList } from './ImprovementList';

const FIXED_FORTIFICATIONS = [
  'Village militia',
  'The Ringwall (low, stone)',
  '3 watchtowers',
  'Spears & shields in every home',
  'Some bows',
];

const IMPROVEMENT_FORTIFICATIONS: { id: string; label: string; replaces?: string }[] = [
  { id: 'palisade', label: 'Palisade' },
  { id: 'standing-watch', label: 'Standing Watch' },
  { id: 'stone-wall', label: 'Stone Wall', replaces: 'palisade' },
  { id: 'weapons-of-war', label: 'Weapons of War' },
  { id: 'well-trained-militia', label: 'Well-Trained Militia' },
];

interface SteadingFortificationsProps {
  fortifications: string[] | undefined;
  improvements: Record<string, boolean> | undefined;
  gmImprovements: GmImprovement[] | undefined;
  onSave: (patch: Partial<SteadingData>) => Promise<void>;
}

export const SteadingFortifications = ({ fortifications, improvements = {}, gmImprovements, onSave }: SteadingFortificationsProps) => {
  const { addToast } = useToast();
  const pendingRef = useRef(0);
  const [localFortifications, setLocalFortifications] = useState<string[]>(() => fortifications ?? []);

  useEffect(() => {
    if (pendingRef.current === 0) setLocalFortifications(fortifications ?? []);
  }, [fortifications]);

  const handleSave = useCallback((items: string[]) => {
    const prev = localFortifications;
    setLocalFortifications(items);
    pendingRef.current += 1;
    return onSave({ fortifications: items })
      .catch(() => { setLocalFortifications(prev); addToast('Failed to save.', 'error'); })
      .finally(() => { pendingRef.current -= 1; });
  }, [onSave, addToast, localFortifications]);

  const improvementItems = useMemo(() => {
    const replaced = new Set(
      IMPROVEMENT_FORTIFICATIONS.filter((imp) => imp.replaces && improvements[imp.id]).map((imp) => imp.replaces!)
    );
    return IMPROVEMENT_FORTIFICATIONS.filter((imp) => improvements[imp.id] && !replaced.has(imp.id));
  }, [improvements]);

  const extraItems = useMemo(
    () => (gmImprovements ?? []).filter((g) => g.completed && g.category === 'fortification' && g.title).map((g) => g.title),
    [gmImprovements],
  );

  return (
    <ImprovementList
      fixedItems={FIXED_FORTIFICATIONS}
      improvementItems={improvementItems}
      extraItems={extraItems}
      customItems={localFortifications}
      improvements={improvements}
      onSave={handleSave}
      addLabel="Add fortification"
      itemLabel="Custom fortification"
    />
  );
};
