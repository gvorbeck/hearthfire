import { useCallback, useId } from 'react';
import clsx from 'clsx';
import { Heading, Text, Checkbox, Button, Radio } from '@/components/ui';
import { useOptimisticField } from '@/hooks/useOptimisticField';
import type { SteadingData, SteadingSize } from '@/types';
import styles from './SteadingStats.module.css';

const SIZES: { value: SteadingSize; label: string; description: string }[] = [
  { value: 'hamlet', label: 'Hamlet', description: '<50 people' },
  { value: 'village', label: 'Village', description: '150–350 people' },
  { value: 'town', label: 'Town', description: '500–1500 people' },
  { value: 'city', label: 'City', description: '2500+ people' },
];

interface StatStepperProps {
  label: string;
  description: string;
  value: number;
  min?: number;
  max?: number;
  onChange: (value: number) => void;
}

const StatStepper = ({ label, description, value, min = -1, max = 3, onChange }: StatStepperProps) => {
  const descId = useId();
  const handleDecrement = useCallback(() => onChange(Math.max(min, value - 1)), [onChange, min, value]);
  const handleIncrement = useCallback(() => onChange(Math.min(max, value + 1)), [onChange, max, value]);
  const valueCx = clsx(styles.statValue, value > 0 && styles.statValuePositive, value < 0 && styles.statValueNegative);
  return (
    <div className={styles.stat}>
      <div className={styles.statTop}>
        <div className={styles.statMeta}>
          <span className={styles.statLabel}>{label}</span>
        </div>
        <div className={styles.statControl} role="group" aria-label={`${label} rating`} aria-describedby={descId}>
          <Button
            variant="ghost"
            size="sm"
            icon="minus"
            onClick={handleDecrement}
            disabled={value <= min}
            aria-label={`Decrease ${label}`}
          />
          <span className={valueCx}>
            {value > 0 ? `+${value}` : value}
          </span>
          <Button
            variant="ghost"
            size="sm"
            icon="plus"
            onClick={handleIncrement}
            disabled={value >= max}
            aria-label={`Increase ${label}`}
          />
        </div>
      </div>
      <Text as="span" size="xs" color="muted" leading="normal" id={descId}>{description}</Text>
    </div>
  );
};

interface SteadingStatsProps {
  steading: SteadingData;
  onSave: (patch: Partial<SteadingData>) => Promise<void>;
}

type NumericStatKey = 'fortunes' | 'population' | 'prosperity' | 'defenses' | 'surplus';


const readStats = (s: SteadingData): Record<NumericStatKey, number> => ({
  fortunes: s.fortunes ?? 1,
  population: s.population ?? 0,
  prosperity: s.prosperity ?? 0,
  defenses: s.defenses ?? 0,
  surplus: s.surplus ?? 1,
});

export const SteadingStats = ({ steading, onSave }: SteadingStatsProps) => {
  // Each stat persists only its own key (a narrow patch) so a concurrent edit to
  // another stat isn't clobbered, while the optimistic value holds the full record.
  const { value: stats, save: saveStats } = useOptimisticField<Record<NumericStatKey, number>, [key: NumericStatKey]>(
    readStats(steading),
    (next, key) => onSave({ [key]: next[key] }),
  );
  const { value: size, save: saveSizeField } = useOptimisticField<SteadingSize>(
    steading.size ?? 'village',
    (next) => onSave({ size: next }),
  );
  const { value: debilities, save: saveDebilities } = useOptimisticField<NonNullable<SteadingData['debilities']>>(
    steading.debilities ?? {},
    (next) => onSave({ debilities: next }),
  );

  const saveStat = useCallback((key: NumericStatKey, v: number) => {
    saveStats((s) => ({ ...s, [key]: v }), key);
  }, [saveStats]);

  const saveFortunes = useCallback((v: number) => saveStat('fortunes', v), [saveStat]);
  const savePopulation = useCallback((v: number) => saveStat('population', v), [saveStat]);
  const saveProsperity = useCallback((v: number) => saveStat('prosperity', v), [saveStat]);
  const saveDefenses = useCallback((v: number) => saveStat('defenses', v), [saveStat]);

  const saveSize = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    saveSizeField(e.target.value as SteadingSize);
  }, [saveSizeField]);

  const handleDecrementSurplus = useCallback(() => {
    saveStats((s) => ({ ...s, surplus: Math.max(0, s.surplus - 1) }), 'surplus');
  }, [saveStats]);

  const handleIncrementSurplus = useCallback(() => {
    saveStats((s) => ({ ...s, surplus: s.surplus + 1 }), 'surplus');
  }, [saveStats]);

  const toggleDebility = useCallback((key: keyof NonNullable<SteadingData['debilities']>) => {
    saveDebilities((d) => ({ ...d, [key]: !d[key] }));
  }, [saveDebilities]);

  return (
    <div className={styles.root}>
      <div className={styles.stat}>
        <div className={styles.statTop}>
          <div className={styles.statMeta}>
            <span className={styles.statLabel}>Size</span>
            <Text as="span" size="xs" color="muted" leading="normal">Starts at village</Text>
          </div>
          <div className={styles.sizeOptions} role="group" aria-label="Size">
            {SIZES.map((s) => (
              <Radio
                key={s.value}
                name="steading-size"
                value={s.value}
                label={<span className={styles.sizeLabel}>{s.label} <Text as="span" color="muted">({s.description})</Text></span>}
                checked={size === s.value}
                onChange={saveSize}
              />
            ))}
          </div>
        </div>
      </div>

      <div className={styles.statsGrid}>
        <StatStepper
          label="Fortunes"
          description="Morale & social cohesion. Rolls for Seasons Change & Requisition. Resets to +1 each season."
          value={stats.fortunes}
          onChange={saveFortunes}
        />
        <StatStepper
          label="Population"
          description="Able bodies relative to Size. Adds to Muster & Pull Together — and to Surplus consumed each winter."
          value={stats.population}
          onChange={savePopulation}
        />
        <StatStepper
          label="Prosperity"
          description="Quality of goods, tools, and services. Rolls for Trade & Barter; adds to supply uses, HP recovery, and weapon piercing."
          value={stats.prosperity}
          onChange={saveProsperity}
        />
        <StatStepper
          label="Defenses"
          description="Martial readiness of the steading. Rolls for Deploy."
          value={stats.defenses}
          onChange={saveDefenses}
        />
      </div>

      <div className={styles.surplusRow}>
        <div className={styles.statTop}>
          <span className={styles.statLabel}>Surplus</span>
          <div className={styles.statControl} role="group" aria-label="Surplus amount">
            <Button
              variant="ghost"
              size="sm"
              icon="minus"
              onClick={handleDecrementSurplus}
              disabled={stats.surplus <= 0}
              aria-label="Decrease Surplus"
            />
            <span className={styles.statValue}>{stats.surplus}</span>
            <Button
              variant="ghost"
              size="sm"
              icon="plus"
              onClick={handleIncrementSurplus}
              aria-label="Increase Surplus"
            />
          </div>
        </div>
        <Text as="span" size="xs" color="muted" leading="normal">Food in the granary, livestock ready to slaughter, whisky to drink or trade. Starts at 1; no upper limit.</Text>
      </div>

      <div className={styles.debilities}>
        <Heading as="h3" size="label">Debilities</Heading>
        <div className={styles.debilityList}>
          <div className={styles.debility}>
            <Checkbox
              label="**Diminished**, by injury/sickness/doubt"
              checked={!!debilities.diminished}
              onChange={() => toggleDebility('diminished')}
            />
            <Text size="xs" color="muted">Disadvantage to Deploy, Muster, or Pull Together.</Text>
          </div>
          <div className={styles.debility}>
            <Checkbox
              label="**Lacking**, due to shortages/hoarding/distrust"
              checked={!!debilities.lacking}
              onChange={() => toggleDebility('lacking')}
            />
            <Text size="xs" color="muted">Treat Prosperity as if it's 1 lower than it is.</Text>
          </div>
          <div className={styles.debility}>
            <Checkbox
              label="**Malcontent**, from fear/anger/despair"
              checked={!!debilities.malcontent}
              onChange={() => toggleDebility('malcontent')}
            />
            <Text size="xs" color="muted">Fortunes reset to +0 each season, not +1; folks need Persuading more often than usual.</Text>
          </div>
        </div>
      </div>
    </div>
  );
};
