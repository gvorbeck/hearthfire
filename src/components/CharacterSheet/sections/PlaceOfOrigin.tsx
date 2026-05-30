import { useState, useRef, useEffect, useCallback, memo } from 'react';
import { Radio, RadioGroup, Text, useToast } from '@/components/primitives';
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
  const { addToast } = useToast();
  const [selected, setSelected] = useState<string>(data?.placeOfOrigin ?? '');
  const [isCollapsed, setIsCollapsed] = useState(false);
  const hasInitializedCollapse = useRef(false);
  const selectedRef = useRef(selected);
  selectedRef.current = selected;

  useEffect(() => {
    if (data?.placeOfOrigin !== undefined) setSelected(data.placeOfOrigin);
  }, [data?.placeOfOrigin]);

  useEffect(() => {
    if (data?.placeOfOrigin && !hasInitializedCollapse.current) {
      hasInitializedCollapse.current = true;
      setIsCollapsed(true);
    }
  }, [data?.placeOfOrigin]);

  const handleSelect = useCallback((value: string) => {
    const prev = selectedRef.current;
    setSelected(value);
    setIsCollapsed(true);
    onSave?.({ placeOfOrigin: value }).catch(() => {
      setSelected(prev);
      setIsCollapsed(false);
      addToast('Failed to save place of origin.');
    });
  }, [onSave, addToast]);

  const handleToggleCollapse = useCallback(() => setIsCollapsed((v) => !v), []);

  if (!options?.length) return <PlaybookSection title="Place of Origin" />;

  const warn = !selected;
  const selectedOption = options.find((opt) => opt.value === selected);

  return (
    <PlaybookSection
      title="Place of Origin"
      choose={1}
      warn={warn}
      collapsible={!!selected}
      isCollapsed={isCollapsed}
      onToggleCollapse={handleToggleCollapse}
    >
      {isCollapsed && selectedOption ? (
        <Text color="muted" className={styles.summary}>
          <span className={styles.optionTitle}>{selectedOption.label}</span>
        </Text>
      ) : (
        <>
          <Text color="muted" className={styles.instruction}>
            Stonetop is your home, or close enough, but where are you (or your family) from originally?
            Pick an origin, then choose a matching name or make up your own — edit it in the header above.
          </Text>
          <RadioGroup legend="Place of Origin" legendHidden className={styles.options}>
            {options.map((opt) => (
              <OriginOption
                key={opt.value}
                opt={opt}
                isSelected={selected === opt.value}
                onSelect={handleSelect}
              />
            ))}
          </RadioGroup>
        </>
      )}
    </PlaybookSection>
  );
};
