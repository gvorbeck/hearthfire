import { useCallback, useId } from 'react';
import clsx from 'clsx';
import { Heading, Text, Checkbox, Button, Radio } from '@/components/primitives';
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

export const SteadingStats = ({ steading, onSave }: SteadingStatsProps) => {
  const fortunes = steading.fortunes ?? 1;
  const population = steading.population ?? 0;
  const prosperity = steading.prosperity ?? 0;
  const defenses = steading.defenses ?? 0;
  const surplus = steading.surplus ?? 1;
  const debilities = steading.debilities ?? {};

  const size = steading.size ?? 'village';
  const saveSize = useCallback((e: React.ChangeEvent<HTMLInputElement>) => onSave({ size: e.target.value as SteadingSize }), [onSave]);

  const saveFortunes = useCallback((v: number) => onSave({ fortunes: v }), [onSave]);
  const savePopulation = useCallback((v: number) => onSave({ population: v }), [onSave]);
  const saveProsperity = useCallback((v: number) => onSave({ prosperity: v }), [onSave]);
  const saveDefenses = useCallback((v: number) => onSave({ defenses: v }), [onSave]);
  const saveSurplus = useCallback((v: number) => onSave({ surplus: v }), [onSave]);
  const handleDecrementSurplus = useCallback(() => saveSurplus(Math.max(0, surplus - 1)), [saveSurplus, surplus]);
  const handleIncrementSurplus = useCallback(() => saveSurplus(surplus + 1), [saveSurplus, surplus]);

  const toggleDebility = useCallback((key: keyof NonNullable<SteadingData['debilities']>) => {
    onSave({ debilities: { ...debilities, [key]: !debilities[key] } });
  }, [onSave, debilities]);

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
          value={fortunes}
          onChange={saveFortunes}
        />
        <StatStepper
          label="Population"
          description="Able bodies relative to Size. Adds to Muster & Pull Together — and to Surplus consumed each winter."
          value={population}
          onChange={savePopulation}
        />
        <StatStepper
          label="Prosperity"
          description="Quality of goods, tools, and services. Rolls for Trade & Barter; adds to supply uses, HP recovery, and weapon piercing."
          value={prosperity}
          onChange={saveProsperity}
        />
        <StatStepper
          label="Defenses"
          description="Martial readiness of the steading. Rolls for Deploy."
          value={defenses}
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
              disabled={surplus <= 0}
              aria-label="Decrease Surplus"
            />
            <span className={styles.statValue}>{surplus}</span>
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
              label={<span><strong>Diminished</strong>, by injury/sickness/doubt</span>}
              checked={!!debilities.diminished}
              onChange={toggleDiminished}
            />
            <Text size="sm" color="muted">Disadvantage to Deploy, Muster, or Pull Together.</Text>
          </div>
          <div className={styles.debility}>
            <Checkbox
              label={<span><strong>Lacking</strong>, due to shortages/hoarding/distrust</span>}
              checked={!!debilities.lacking}
              onChange={toggleLacking}
            />
            <Text size="sm" color="muted">Treat Prosperity as if it's 1 lower than it is.</Text>
          </div>
          <div className={styles.debility}>
            <Checkbox
              label={<span><strong>Malcontent</strong>, from fear/anger/despair</span>}
              checked={!!debilities.malcontent}
              onChange={toggleMalcontent}
            />
            <Text size="sm" color="muted">Fortunes reset to +0 each season, not +1; folks need Persuading more often than usual.</Text>
          </div>
        </div>
      </div>
    </div>
  );
};
