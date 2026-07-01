import { useState, useEffect, useCallback, useRef } from 'react';
import { useLatest } from '@/hooks/useLatest';
import type { ReactNode } from 'react';
import { Radio, RadioGroup, Input, Text } from '@/components/ui';
import { useDebouncedSave } from '@/hooks/useDebouncedSave';
import { useCollapsibleSection } from '@/hooks/useCollapsibleSection';
import { PlaybookSection } from '@/components/playbook/PlaybookSection';
import type { RadioOption } from '@/types';
import type { CharacterData } from '@/types';
import styles from './RadioSelect.module.css';

const CUSTOM_VALUE = '__custom__';

interface RadioSelectProps {
  playbookKey?: string;
  title?: string;
  header?: ReactNode;
  instruction?: ReactNode;
  options?: RadioOption[];
  data?: CharacterData;
  onSave?: (data: Partial<CharacterData>) => Promise<void>;
  overrideNote?: string;
  chooseNote?: string;
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
  chooseNote,
  dataKey = 'instinct',
  customKey = 'instinctCustom',
  noCustom = false,
}: RadioSelectProps = {}) => {
  const [selected, setSelected] = useState<string>('');
  const [customText, setCustomText] = useState<string>('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const customTextRef = useLatest(customText);
  const selectPendingRef = useRef(false);

  const saveCustomText = useCallback(
    (value: string) => onSave?.({ [dataKey]: CUSTOM_VALUE, [customKey]: value } as Partial<CharacterData>) ?? Promise.resolve(),
    [onSave, dataKey, customKey]
  );
  const { onChange: debouncedChange, flush: flushOnBlur, isPendingRef: customPendingRef } = useDebouncedSave(saveCustomText, 1000);

  useEffect(() => {
    if (selectPendingRef.current) return;
    // Mirror the remote value into optimistic local state (guarded by the pending
    // ref); a necessary store-sync, not a derivable value.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (data?.[dataKey] !== undefined) setSelected(data[dataKey] as string);
  }, [data, dataKey]);

  useEffect(() => {
    if (customPendingRef.current) return;
    // Same optimistic store-sync, guarded by customPendingRef.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (data?.[customKey] !== undefined) setCustomText(data[customKey] as string);
  }, [data, customKey, customPendingRef]);

  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    syncTextareaHeight(el);
  }, [customText]);

  const hasSelection = !!selected && (noCustom || selected !== CUSTOM_VALUE || !!customText.trim());
  const { isCollapsed, handleToggleCollapse } = useCollapsibleSection(hasSelection);

  const handleSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.currentTarget.value;
    selectPendingRef.current = true;
    setSelected(value);
    Promise.resolve()
      .then(() => onSave?.({ [dataKey]: value, [customKey]: '' } as Partial<CharacterData>))
      .finally(() => { selectPendingRef.current = false; });
  }, [onSave, dataKey, customKey]);

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
      forceChildren
      chooseNote={chooseNote}
      overrideNote={overrideNote}
    >
      {header}
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
                  {opt.description && <Text as="span" size="sm" color="muted">{opt.description}</Text>}
                  {opt.subtitle && <Text as="span" size="sm" color="muted">{opt.subtitle}</Text>}
                </span>
              }
            />
            {(opt.detailAlways || selected === opt.value) && opt.detail}
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
    </PlaybookSection>
  );
};
