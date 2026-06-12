import { useCallback, useEffect, useRef, useState } from 'react';
import { Text } from '@/components/ui';
import { useToast } from '@/components/app';
import type { SteadingData, GmImprovement } from '@/types';
import { PredefinedImprovementsList } from './PredefinedImprovementsList';
import { GmImprovementSlots } from './GmImprovementSlots';
import styles from './SteadingImprovements.module.css';

interface SteadingImprovementsProps {
  improvements: Record<string, boolean> | undefined;
  gmImprovements: GmImprovement[] | undefined;
  onSave: (patch: Partial<SteadingData>) => Promise<void>;
}

export const SteadingImprovements = ({ improvements = {}, gmImprovements, onSave }: SteadingImprovementsProps) => {
  const { addToast } = useToast();
  const pendingImprovementsRef = useRef(0);
  const [localImprovements, setLocalImprovements] = useState<Record<string, boolean>>(() => improvements);

  const onSaveRef = useRef(onSave);
  onSaveRef.current = onSave;

  useEffect(() => {
    if (pendingImprovementsRef.current === 0) setLocalImprovements(improvements);
  }, [improvements]);

  const toggleKey = useCallback((key: string) => {
    const next = { ...localImprovements, [key]: !localImprovements[key] };
    const prev = localImprovements;
    setLocalImprovements(next);
    pendingImprovementsRef.current += 1;
    onSaveRef.current({ improvements: { [key]: next[key] } })
      .catch(() => { setLocalImprovements(prev); addToast('Failed to save.', 'error'); })
      .finally(() => { pendingImprovementsRef.current -= 1; });
  }, [addToast, localImprovements]);

  return (
    <div className={styles.root}>
      <Text size="xs" color="muted">Check an improvement when all requirements are met. The GM may reveal additional improvements in play.</Text>
      <PredefinedImprovementsList improvements={localImprovements} onToggleKey={toggleKey} />
      <GmImprovementSlots gmImprovements={gmImprovements} onSave={onSave} />
    </div>
  );
};
