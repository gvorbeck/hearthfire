import { useState, useEffect, useCallback, useRef } from 'react';
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
  overrideNote?: string;
}

const syncTextareaHeight = (el: HTMLTextAreaElement) => {
  el.style.height = 'auto';
  el.style.height = `${el.scrollHeight}px`;
};

export const Instinct = ({ playbookKey, options, data, onSave, overrideNote }: InstinctProps = {}) => {
  const [selected, setSelected] = useState<string>(data?.instinct ?? '');
  const [customText, setCustomText] = useState<string>(data?.instinctCustom ?? '');
  const [isCollapsed, setIsCollapsed] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const customTextRef = useRef(customText);
  customTextRef.current = customText;
  const hasInitializedCollapse = useRef(false);

  useEffect(() => {
    if (data?.instinct !== undefined) setSelected(data.instinct);
  }, [data?.instinct]);

  // Collapse once on the first Firestore load that has a selection; never re-collapse after that.
  useEffect(() => {
    if (data?.instinct && !hasInitializedCollapse.current) {
      hasInitializedCollapse.current = true;
      setIsCollapsed(true);
    }
  }, [data?.instinct]);

  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    syncTextareaHeight(el);
  }, [customText]);

  // Sync height on mount when customText is pre-populated from Firestore.
  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    syncTextareaHeight(el);
  }, []);

  const handleToggleCollapse = useCallback(() => setIsCollapsed((v) => !v), []);

  const handleSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.currentTarget.dataset.value ?? '';
    setSelected(value);
    if (value !== CUSTOM_VALUE) {
      setIsCollapsed(true);
      onSave?.({ instinct: value, instinctCustom: '' });
    } else {
      onSave?.({ instinct: value, instinctCustom: '' });
    }
  }, [onSave]);

  const saveCustomText = useCallback(
    (value: string) => onSave?.({ instinct: CUSTOM_VALUE, instinctCustom: value }) ?? Promise.resolve(),
    [onSave]
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

  if (!options) return <PlaybookSection title="Instinct" overrideNote={overrideNote} />;

  const warn = !selected || (selected === CUSTOM_VALUE && !customText.trim());
  const hasSelection = !!selected && (selected !== CUSTOM_VALUE || !!customText.trim());

  const visibleOptions = isCollapsed && hasSelection
    ? options.filter((opt) => opt.value === selected)
    : options;

  const showCustom = !isCollapsed || selected === CUSTOM_VALUE;

  if (overrideNote) {
    return <PlaybookSection title="Instinct" overrideNote={overrideNote} />;
  }

  return (
    <PlaybookSection
      title="Instinct"
      choose={1}
      warn={warn}
      collapsible={hasSelection}
      isCollapsed={isCollapsed}
      onToggleCollapse={handleToggleCollapse}
      overrideNote={overrideNote}
    >
      <div className={styles.options}>
        {visibleOptions.map((opt) => (
          <div key={opt.value} className={styles.option}>
            <Radio
              name={`${playbookKey}-instinct`}
              value={opt.value}
              data-value={opt.value}
              checked={selected === opt.value}
              onChange={handleSelect}
              label={
                <span className={styles.optionLabel}>
                  <span className={styles.optionTitle}>{opt.label}</span>
                  <span className={styles.optionDesc}>{opt.description}</span>
                </span>
              }
            />
          </div>
        ))}
        {showCustom && (
          <div className={styles.option}>
            <Radio
              name={`${playbookKey}-instinct`}
              value={CUSTOM_VALUE}
              data-value={CUSTOM_VALUE}
              checked={selected === CUSTOM_VALUE}
              onChange={handleSelect}
              label={
                selected === CUSTOM_VALUE ? (
                  // stopPropagation prevents the label click from re-toggling the radio when the user clicks into the text field
                  <Input
                    multiline
                    ref={textareaRef}
                    value={customText}
                    aria-label="Custom instinct"
                    onChange={handleCustomChange}
                    onBlur={handleCustomBlur}
                    placeholder="Describe your instinct…"
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
      </div>
    </PlaybookSection>
  );
};
