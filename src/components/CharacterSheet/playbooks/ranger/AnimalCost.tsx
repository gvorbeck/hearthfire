import { Radio, Text, Input, UseDots } from '@/components/primitives';
import { PlaybookSection } from '../../PlaybookSection';
import styles from './RangerAnimalCompanion.module.css';

export const COST_OPTIONS = [
  'Play, grooming, training, affection',
  'Time off on its own, free to roam',
  'Cozy quarters, comfort, ample food',
];

interface AnimalCostProps {
  cost: string;
  costCustom: string;
  loyalty: number;
  costCollapsed: boolean;
  onCostChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onCostCustomFocus: () => void;
  onCostCustomChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onCostCustomBlur: () => void;
  onLoyaltyChange: (n: number) => void;
  onToggleCollapse: () => void;
}

export const AnimalCost = ({
  cost,
  costCustom,
  loyalty,
  costCollapsed,
  onCostChange,
  onCostCustomFocus,
  onCostCustomChange,
  onCostCustomBlur,
  onLoyaltyChange,
  onToggleCollapse,
}: AnimalCostProps) => (
  <PlaybookSection
    title="Cost"
    choose={1}
    warn={!cost}
    collapsible={!!cost}
    isCollapsed={costCollapsed}
    onToggleCollapse={onToggleCollapse}
  >
    <div className={styles.loyaltyRow}>
      <Text as="span" size="sm" color="muted" className={styles.loyaltyLabel}>Loyalty</Text>
      <UseDots total={3} checked={loyalty} onChange={onLoyaltyChange} />
    </div>
    <div className={styles.radioList}>
      {COST_OPTIONS.map((opt) => (
        <Radio
          key={opt}
          className={styles.radioRow}
          name="animal-cost"
          value={opt}
          checked={cost === opt}
          onChange={onCostChange}
          label={<Text as="span" size="sm" color="muted">{opt}</Text>}
        />
      ))}
      <Radio
        className={styles.radioRow}
        name="animal-cost"
        value="custom"
        checked={cost === 'custom'}
        onChange={onCostChange}
        label={
          <Input
            className={styles.inlineTextInput}
            type="text"
            value={costCustom}
            placeholder="Custom cost…"
            aria-label="Custom cost"
            onFocus={onCostCustomFocus}
            onChange={onCostCustomChange}
            onBlur={onCostCustomBlur}
          />
        }
      />
    </div>
  </PlaybookSection>
);
