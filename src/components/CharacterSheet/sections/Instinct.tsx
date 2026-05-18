import { useState, useEffect, useCallback } from 'react';
import { Radio, Input } from '@/components/primitives';
import { useDebouncedSave } from '@/hooks/useDebouncedSave';
import { PlaybookSection } from '../PlaybookSection';
import type { InstinctOption } from '@/lib/instinctOptions';
import type { CharacterData } from '@/types';
import styles from './Instinct.module.css';

const CUSTOM_VALUE = '__custom__';

interface InstinctProps {
  playbookKey?: string;
  options?: InstinctOption[];
  data?: CharacterData;
  onSave?: (data: Partial<CharacterData>) => Promise<void>;
}

export const Instinct = ({ playbookKey, options, data, onSave }: InstinctProps = {}) => {
  const [selected, setSelected] = useState<string>(data?.instinct ?? '');
  const [customText, setCustomText] = useState<string>(data?.instinctCustom ?? '');

  useEffect(() => {
    if (data?.instinct !== undefined) setSelected(data.instinct);
    if (data?.instinctCustom !== undefined) setCustomText(data.instinctCustom);
  }, [data?.instinct, data?.instinctCustom]);

  const handleSelect = useCallback((value: string) => {
    setSelected(value);
    if (value !== CUSTOM_VALUE) {
      onSave?.({ instinct: value, instinctCustom: '' });
    } else {
      onSave?.({ instinct: value, instinctCustom: customText });
    }
  }, [onSave, customText]);

  const saveCustomText = useCallback(
    (value: string) => onSave?.({ instinct: CUSTOM_VALUE, instinctCustom: value }) ?? Promise.resolve(),
    [onSave]
  );
  const { onChange: debouncedChange, onBlur: flushOnBlur } = useDebouncedSave(saveCustomText, 1000);

  const handleCustomChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setCustomText(value);
    debouncedChange(value);
  }, [debouncedChange]);

  const handleCustomBlur = useCallback(() => {
    flushOnBlur(customText);
  }, [flushOnBlur, customText]);

  if (!options) return <PlaybookSection title="Instinct" />;

  return (
    <PlaybookSection title="Instinct" choose={1}>
      <div className={styles.options}>
        {options.map((opt) => (
          <div key={opt.value} className={styles.option}>
            <Radio
              name={`${playbookKey}-instinct`}
              value={opt.value}
              checked={selected === opt.value}
              onChange={() => handleSelect(opt.value)}
              label={
                <span className={styles.optionLabel}>
                  <span className={styles.optionTitle}>{opt.label}</span>
                  <span className={styles.optionDesc}>{opt.description}</span>
                </span>
              }
            />
          </div>
        ))}
        <div className={styles.option}>
          <Radio
            name={`${playbookKey}-instinct`}
            value={CUSTOM_VALUE}
            checked={selected === CUSTOM_VALUE}
            onChange={() => handleSelect(CUSTOM_VALUE)}
            label={
              selected === CUSTOM_VALUE ? (
                // stopPropagation prevents the label click from re-toggling the radio when the user clicks into the text field
                <Input
                  value={customText}
                  aria-label="Custom instinct"
                  onChange={handleCustomChange}
                  onBlur={handleCustomBlur}
                  placeholder="Describe your instinct…"
                  onClick={(e) => e.stopPropagation()}
                />
              ) : (
                <span className={styles.customLabel}>Custom…</span>
              )
            }
          />
        </div>
      </div>
    </PlaybookSection>
  );
};
