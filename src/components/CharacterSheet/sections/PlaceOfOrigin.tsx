import { useState, useEffect, useCallback, memo } from 'react';
import { Radio } from '@/components/primitives';
import { PlaybookSection } from '../PlaybookSection';
import type { PlaceOfOriginOptions } from '@/lib/placeOfOriginOptions';
import type { CharacterData } from '@/types';
import styles from './PlaceOfOrigin.module.css';

interface OriginOptionProps {
  opt: PlaceOfOriginOptions[number];
  isSelected: boolean;
  onSelect: (value: string) => void;
}

const OriginOption = memo(({ opt, isSelected, onSelect }: OriginOptionProps) => {
  const handleChange = useCallback(() => onSelect(opt.value), [onSelect, opt.value]);
  return (
    <div className={styles.option}>
      <Radio
        name="place-of-origin"
        value={opt.value}
        checked={isSelected}
        onChange={handleChange}
        label={
          <span className={styles.optionLabel}>
            <span className={styles.optionTitle}>{opt.label}</span>
            <span className={styles.optionNames}>{opt.names}</span>
          </span>
        }
      />
    </div>
  );
});

interface PlaceOfOriginProps {
  options?: PlaceOfOriginOptions;
  data?: CharacterData;
  onSave?: (data: Partial<CharacterData>) => Promise<void>;
}

export const PlaceOfOrigin = ({ options, data, onSave }: PlaceOfOriginProps = {}) => {
  const [selected, setSelected] = useState<string>(data?.placeOfOrigin ?? '');

  useEffect(() => {
    if (data?.placeOfOrigin !== undefined) setSelected(data.placeOfOrigin);
  }, [data?.placeOfOrigin]);

  const handleSelect = useCallback((value: string) => {
    setSelected(value);
    onSave?.({ placeOfOrigin: value });
  }, [onSave]);

  if (!options?.length) return <PlaybookSection title="Place of Origin" />;

  const warn = !selected;

  return (
    <PlaybookSection title="Place of Origin" choose={1} warn={warn}>
      <p className={styles.instruction}>
        Stonetop is your home, or close enough, but where are you (or your family) from originally?
        Pick an origin, then choose a matching name or make up your own — edit it in the header above.
      </p>
      <div className={styles.options}>
        {options.map((opt) => (
          <OriginOption
            key={opt.value}
            opt={opt}
            isSelected={selected === opt.value}
            onSelect={handleSelect}
          />
        ))}
      </div>
    </PlaybookSection>
  );
};
