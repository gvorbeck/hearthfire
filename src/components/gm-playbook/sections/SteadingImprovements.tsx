import { useCallback } from 'react';
import { Text } from '@/components/ui';
import type { SteadingData, GmImprovement } from '@/types';
import { useOptimisticField } from '@/hooks/useOptimisticField';
import { PredefinedImprovementsList } from './PredefinedImprovementsList';
import { GmImprovementSlots } from './GmImprovementSlots';
import styles from './SteadingImprovements.module.css';

interface SteadingImprovementsProps {
  improvements: Record<string, boolean> | undefined;
  gmImprovements: GmImprovement[] | undefined;
  onSave: (patch: Partial<SteadingData>) => Promise<void>;
}

export const SteadingImprovements = ({ improvements = {}, gmImprovements, onSave }: SteadingImprovementsProps) => {
  const { value: localImprovements, save } = useOptimisticField<Record<string, boolean>, [key: string]>(
    improvements,
    // Persist only the toggled key so a concurrent remote toggle of a different
    // key isn't clobbered; updateSteading merges it into the record dot-wise.
    (next, key) => onSave({ improvements: { [key]: next[key] } }),
  );

  const toggleKey = useCallback((key: string) => {
    save((current) => ({ ...current, [key]: !current[key] }), key);
  }, [save]);

  return (
    <div className={styles.root}>
      <Text size="xs" color="muted">Check an improvement when all requirements are met. The GM may reveal additional improvements in play.</Text>
      <PredefinedImprovementsList improvements={localImprovements} onToggleKey={toggleKey} />
      <GmImprovementSlots gmImprovements={gmImprovements} onSave={onSave} />
    </div>
  );
};
