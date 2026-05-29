import { Radio, Text, Input } from '@/components/primitives';
import { PlaybookSection } from '../../PlaybookSection';
import styles from './RangerAnimalCompanion.module.css';

export const INSTINCT_OPTIONS = [
  'To bully and threaten',
  'To fill its belly',
  'To get distracted',
  'To give chase',
  'To make mischief',
  'To startle and panic',
  'To run rampant',
];

interface AnimalInstinctProps {
  instinct: string;
  instinctCustom: string;
  instinctCollapsed: boolean;
  onInstinctChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onInstinctCustomFocus: () => void;
  onInstinctCustomChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onInstinctCustomBlur: () => void;
  onToggleCollapse: () => void;
}

export const AnimalInstinct = ({
  instinct,
  instinctCustom,
  instinctCollapsed,
  onInstinctChange,
  onInstinctCustomFocus,
  onInstinctCustomChange,
  onInstinctCustomBlur,
  onToggleCollapse,
}: AnimalInstinctProps) => (
  <PlaybookSection
    title="Instinct"
    choose={1}
    warn={!instinct}
    collapsible={!!instinct}
    isCollapsed={instinctCollapsed}
    onToggleCollapse={onToggleCollapse}
  >
    <div className={styles.radioList}>
      {INSTINCT_OPTIONS.map((opt) => (
        <Radio
          key={opt}
          className={styles.radioRow}
          name="animal-instinct"
          value={opt}
          checked={instinct === opt}
          onChange={onInstinctChange}
          label={<Text as="span" size="sm" color="muted">{opt}</Text>}
        />
      ))}
      <Radio
        className={styles.radioRow}
        name="animal-instinct"
        value="custom"
        checked={instinct === 'custom'}
        onChange={onInstinctChange}
        label={
          <Input
            className={styles.inlineTextInput}
            type="text"
            value={instinctCustom}
            placeholder="Custom instinct…"
            aria-label="Custom instinct"
            onFocus={onInstinctCustomFocus}
            onChange={onInstinctCustomChange}
            onBlur={onInstinctCustomBlur}
          />
        }
      />
    </div>
  </PlaybookSection>
);
