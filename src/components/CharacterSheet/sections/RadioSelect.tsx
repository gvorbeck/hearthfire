import { useState, useEffect, useCallback, useRef } from 'react';
import { Radio, RadioGroup, Input, Text } from '@/components/primitives';
import { useDebouncedSave } from '@/hooks/useDebouncedSave';
import { PlaybookSection } from '../PlaybookSection';
import type { RadioOption } from '@/lib/instinctOptions';
import type { CharacterData } from '@/types';
import styles from './RadioSelect.module.css';

const CUSTOM_VALUE = '__custom__';

interface RadioSelectProps {
  playbookKey?: string;
  title?: string;
  header?: React.ReactNode;
  instruction?: React.ReactNode;
  options?: RadioOption[];
  data?: CharacterData;
  onSave?: (data: Partial<CharacterData>) => Promise<void>;
  overrideNote?: string;
  dataKey?: keyof CharacterData;
  customKey?: keyof CharacterData;
  noCustom?: boolean;
}

const syncTextareaHeight = (el: HTMLTextAreaElement) => {
  el.style.height = 'auto';
  el.style.height = `${el.scrollHeight}px`;
};

export const RadioSelect = ({
  playbookKey,
  title = 'Instinct',
  header,
  instruction,
  options,
  data,
  onSave,
  overrideNote,
  dataKey = 'instinct',
  customKey = 'instinctCustom',
  noCustom = false,
}: RadioSelectProps = {}) => {
  const [selected, setSelected] = useState<string>('');
  const [customText, setCustomText] = useState<string>('');
  const [isCollapsed, setIsCollapsed] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const customTextRef = useRef(customText);
  customTextRef.current = customText;
  const hasInitializedCollapse = useRef(false);

  useEffect(() => {
    if (data?.[dataKey] !== undefined) setSelected(data[dataKey] as string);
  }, [data, dataKey]);

  useEffect(() => {
    if (data?.[customKey] !== undefined) setCustomText(data[customKey] as string);
  }, [data, customKey]);

  useEffect(() => {
    if (data?.[dataKey] && !hasInitializedCollapse.current) {
      hasInitializedCollapse.current = true;
      setIsCollapsed(true);
    }
  }, [data, dataKey]);

  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    syncTextareaHeight(el);
  }, [customText]);

  const handleToggleCollapse = useCallback(() => setIsCollapsed((v) => !v), []);

  const handleSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.currentTarget.value;
    setSelected(value);
    if (value !== CUSTOM_VALUE) setIsCollapsed(true);
    onSave?.({ [dataKey]: value, [customKey]: '' } as Partial<CharacterData>);
  }, [onSave, dataKey, customKey]);

  const saveCustomText = useCallback(
    (value: string) => onSave?.({ [dataKey]: CUSTOM_VALUE, [customKey]: value } as Partial<CharacterData>) ?? Promise.resolve(),
    [onSave, dataKey, customKey]
  );
  const { onChange: debouncedChange, flush: flushOnBlur } = useDebouncedSave(saveCustomText, 1000);

  const handleCustomChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setCustomText(value);
    debouncedChange(value);
  }, [debouncedChange]);

  const handleCustomBlur = useCallback(() => {
    flushOnBlur(customTextRef.current);
  }, [flushOnBlur]);

  if (!options) return <PlaybookSection title={title} overrideNote={overrideNote} />;
  if (overrideNote) return <PlaybookSection title={title} overrideNote={overrideNote} />;

  const warn = !selected || (!noCustom && selected === CUSTOM_VALUE && !customText.trim());
  const hasSelection = !!selected && (noCustom || selected !== CUSTOM_VALUE || !!customText.trim());

  const selectedOption = options.find((opt) => opt.value === selected);
  const visibleOptions = isCollapsed && hasSelection
    ? options.filter((opt) => opt.value === selected)
    : options;
  const showCustom = !noCustom && (!isCollapsed || selected === CUSTOM_VALUE);

  return (
    <PlaybookSection
      title={title}
      choose={1}
      warn={warn}
      collapsible={hasSelection}
      isCollapsed={isCollapsed}
      onToggleCollapse={handleToggleCollapse}
      forceChildren={!noCustom}
      overrideNote={overrideNote}
    >
      {header}
      {noCustom && isCollapsed && selectedOption ? (
        <Text color="muted" className={styles.summary}>
          <span className={styles.optionTitle}>{selectedOption.label}</span>
        </Text>
      ) : (
        <>
          {instruction && (
            <Text color="muted" className={styles.instruction}>{instruction}</Text>
          )}
          <RadioGroup legend={title} legendHidden className={styles.options}>
            {visibleOptions.map((opt) => (
              <div key={opt.value} className={styles.option}>
                <Radio
                  name={`${playbookKey}-${String(dataKey)}`}
                  value={opt.value}
                  checked={selected === opt.value}
                  onChange={handleSelect}
                  label={
                    <span className={styles.optionLabel}>
                      <span className={styles.optionTitle}>{opt.label}</span>
                      {opt.description && <span className={styles.optionDesc}>{opt.description}</span>}
                      {opt.subtitle && <span className={styles.optionDesc}>{opt.subtitle}</span>}
                    </span>
                  }
                />
              </div>
            ))}
            {showCustom && (
              <div className={styles.option}>
                <Radio
                  name={`${playbookKey}-${String(dataKey)}`}
                  value={CUSTOM_VALUE}
                  checked={selected === CUSTOM_VALUE}
                  onChange={handleSelect}
                  label={
                    selected === CUSTOM_VALUE ? (
                      <Input
                        multiline
                        ref={textareaRef}
                        value={customText}
                        aria-label={`Custom ${title.toLowerCase()}`}
                        onChange={handleCustomChange}
                        onBlur={handleCustomBlur}
                        placeholder={`Describe your ${title.toLowerCase()}…`}
                        onClick={(e) => e.stopPropagation()}
                        className={styles.customTextarea}
                        rows={1}
                      />
                    ) : (
                      <span className={styles.customLabel}>Custom…</span>
                    )
                  }
                />
              </div>
            )}
          </RadioGroup>
        </>
      )}
    </PlaybookSection>
  );
};
