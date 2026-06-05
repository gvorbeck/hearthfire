import { useCallback, useEffect, useId, useRef, useState } from 'react';
import clsx from 'clsx';
import { Heading, Text, Checkbox, Button, Radio } from '@/components/ui';
import { useToast } from '@/components/app';
import { parseInlineMarkdown } from '@/lib/parseMarkdown';
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
      <span className={styles.statDesc} id={descId}>{description}</span>
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
  const { addToast } = useToast();
  const pendingRef = useRef(0);
  const [stats, setStats] = useState<Record<NumericStatKey, number>>(() => readStats(steading));
  const [size, setSize] = useState<SteadingSize>(() => steading.size ?? 'village');
  const [debilities, setDebilities] = useState(() => steading.debilities ?? {});

  useEffect(() => {
    if (pendingRef.current > 0) return;
    setStats(readStats(steading));
    setSize(steading.size ?? 'village');
    setDebilities(steading.debilities ?? {});
  }, [steading]);

  const saveStat = useCallback((key: NumericStatKey, v: number) => {
    const prev = stats[key];
    setStats((s) => ({ ...s, [key]: v }));
    pendingRef.current += 1;
    onSave({ [key]: v })
      .catch(() => { setStats((s) => ({ ...s, [key]: prev })); addToast('Failed to save.', 'error'); })
      .finally(() => { pendingRef.current -= 1; });
  }, [onSave, addToast, stats]);

  const saveFortunes = useCallback((v: number) => saveStat('fortunes', v), [saveStat]);
  const savePopulation = useCallback((v: number) => saveStat('population', v), [saveStat]);
  const saveProsperity = useCallback((v: number) => saveStat('prosperity', v), [saveStat]);
  const saveDefenses = useCallback((v: number) => saveStat('defenses', v), [saveStat]);

  const saveSize = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const next = e.target.value as SteadingSize;
    const prev = size;
    setSize(next);
    pendingRef.current += 1;
    onSave({ size: next })
      .catch(() => { setSize(prev); addToast('Failed to save.', 'error'); })
      .finally(() => { pendingRef.current -= 1; });
  }, [onSave, addToast, size]);

  const handleDecrementSurplus = useCallback(() => {
    const prev = stats.surplus;
    const next = Math.max(0, prev - 1);
    setStats((s) => ({ ...s, surplus: next }));
    pendingRef.current += 1;
    onSave({ surplus: next })
      .catch(() => { setStats((s) => ({ ...s, surplus: prev })); addToast('Failed to save.', 'error'); })
      .finally(() => { pendingRef.current -= 1; });
  }, [onSave, addToast, stats.surplus]);

  const handleIncrementSurplus = useCallback(() => {
    const prev = stats.surplus;
    const next = prev + 1;
    setStats((s) => ({ ...s, surplus: next }));
    pendingRef.current += 1;
    onSave({ surplus: next })
      .catch(() => { setStats((s) => ({ ...s, surplus: prev })); addToast('Failed to save.', 'error'); })
      .finally(() => { pendingRef.current -= 1; });
  }, [onSave, addToast, stats.surplus]);

  const toggleDebility = useCallback((key: keyof NonNullable<SteadingData['debilities']>) => {
    const next = { ...debilities, [key]: !debilities[key] };
    const prev = debilities;
    setDebilities(next);
    pendingRef.current += 1;
    onSave({ debilities: next })
      .catch(() => { setDebilities(prev); addToast('Failed to save.', 'error'); })
      .finally(() => { pendingRef.current -= 1; });
  }, [onSave, addToast, debilities]);

  const toggleDiminished = useCallback(() => toggleDebility('diminished'), [toggleDebility]);
  const toggleLacking = useCallback(() => toggleDebility('lacking'), [toggleDebility]);
  const toggleMalcontent = useCallback(() => toggleDebility('malcontent'), [toggleDebility]);

  return (
    <div className={styles.root}>
      <div className={styles.stat}>
        <div className={styles.statTop}>
          <div className={styles.statMeta}>
            <span className={styles.statLabel}>Size</span>
            <span className={styles.statDesc}>Starts at village</span>
          </div>
          <div className={styles.sizeOptions} role="group" aria-label="Size">
            {SIZES.map((s) => (
              <Radio
                key={s.value}
                name="steading-size"
                value={s.value}
                label={<span className={styles.sizeLabel}>{s.label} <span className={styles.sizeDesc}>({s.description})</span></span>}
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
        <span className={styles.statDesc}>Food in the granary, livestock ready to slaughter, whisky to drink or trade. Starts at 1; no upper limit.</span>
      </div>

      <div className={styles.debilities}>
        <Heading as="h3" size="label">Debilities</Heading>
        <div className={styles.debilityList}>
          <div className={styles.debility}>
            <Checkbox
              label={parseInlineMarkdown('**Diminished**, by injury/sickness/doubt')}
              checked={!!debilities.diminished}
              onChange={toggleDiminished}
            />
            <Text size="xs" color="muted">Disadvantage to Deploy, Muster, or Pull Together.</Text>
          </div>
          <div className={styles.debility}>
            <Checkbox
              label={parseInlineMarkdown('**Lacking**, due to shortages/hoarding/distrust')}
              checked={!!debilities.lacking}
              onChange={toggleLacking}
            />
            <Text size="xs" color="muted">Treat Prosperity as if it's 1 lower than it is.</Text>
          </div>
          <div className={styles.debility}>
            <Checkbox
              label={parseInlineMarkdown('**Malcontent**, from fear/anger/despair')}
              checked={!!debilities.malcontent}
              onChange={toggleMalcontent}
            />
            <Text size="xs" color="muted">Fortunes reset to +0 each season, not +1; folks need Persuading more often than usual.</Text>
          </div>
        </div>
      </div>
    </div>
  );
};
