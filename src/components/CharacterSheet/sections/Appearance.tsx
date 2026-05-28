import { useState, useRef, useEffect, useCallback } from 'react';
import { useDebouncedSave } from '@/hooks/useDebouncedSave';
import { Checkbox, Radio, Text, useToast } from '@/components/primitives';
import { PlaybookSection } from '../PlaybookSection';
import type { AppearanceRows } from '@/lib/appearanceOptions';
import type { CharacterData } from '@/types';
import styles from './Appearance.module.css';

const stopPropagation = (e: React.MouseEvent) => e.stopPropagation();

interface AppearanceProps {
  rows?: AppearanceRows;
  data?: CharacterData;
  onSave?: (data: Partial<CharacterData>) => Promise<void>;
}

export const Appearance = ({ rows, data, onSave }: AppearanceProps = {}) => {
  const { addToast } = useToast();
  const [selected, setSelected] = useState<Record<string, string>>(data?.appearance ?? {});
  const [isCustom, setIsCustom] = useState<boolean>(Boolean(data?.appearanceCustom));
  const [customText, setCustomText] = useState<string>(data?.appearanceCustom ?? '');
  const [isCollapsed, setIsCollapsed] = useState(false);
  const hasInitializedCollapse = useRef(false);
  const onSaveRef = useRef(onSave);
  const selectedRef = useRef(selected);
  const customTextRef = useRef(customText);
  onSaveRef.current = onSave;
  selectedRef.current = selected;
  customTextRef.current = customText;

  const saveCustomText = useCallback(
    (value: string) => onSaveRef.current?.({ appearance: selectedRef.current, appearanceCustom: value }) ?? Promise.resolve(),
    [],
  );
  const { onChange: debouncedCustomChange, flush: flushCustomOnBlur } = useDebouncedSave(saveCustomText, 1000);

  useEffect(() => {
    if (data?.appearance !== undefined) setSelected(data.appearance);
  }, [data?.appearance]);

  useEffect(() => {
    const appearance = data?.appearance ?? {};
    const allRowsFilled = rows ? rows.every((_, i) => Boolean(appearance[String(i)])) : false;
    const complete = Boolean(data?.appearanceCustom) || allRowsFilled;
    if (complete && !hasInitializedCollapse.current) {
      hasInitializedCollapse.current = true;
      setIsCollapsed(true);
    }
  }, [data?.appearance, rows]);

  const handleSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const rowIndex = Number(e.currentTarget.dataset.row);
    const value = e.currentTarget.value;
    const prev = selectedRef.current;
    const nextSelected = { ...prev, [String(rowIndex)]: value };
    setSelected(nextSelected);
    onSaveRef.current?.({ appearance: nextSelected, appearanceCustom: customTextRef.current })
      .catch(() => { setSelected(prev); addToast('Failed to save appearance.'); });
  }, []);

  const handleCustomToggle = useCallback(() => {
    const prevCustom = customTextRef.current;
    setIsCustom((prev) => {
      const next = !prev;
      if (!next) {
        setCustomText('');
        onSaveRef.current?.({ appearance: selectedRef.current, appearanceCustom: '' })
          .catch(() => { setIsCustom(true); setCustomText(prevCustom); addToast('Failed to save appearance.'); });
      } else {
        onSaveRef.current?.({ appearance: selectedRef.current, appearanceCustom: prevCustom })
          .catch(() => { setIsCustom(false); addToast('Failed to save appearance.'); });
      }
      return next;
    });
  }, [addToast]);

  const handleCustomChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setCustomText(value);
    debouncedCustomChange(value);
  }, [debouncedCustomChange]);

  const handleCustomBlur = useCallback((e: React.FocusEvent<HTMLInputElement>) => {
    flushCustomOnBlur(e.target.value);
  }, [flushCustomOnBlur]);

  const handleToggleCollapse = useCallback(() => setIsCollapsed((v) => !v), []);

  if (!rows) return <PlaybookSection title="Appearance" />;

  const warn = !isCustom && rows.some((_, i) => !selected[String(i)]);
  const isComplete = !warn;

  const summary = isCustom
    ? (customText.trim() || null)
    : rows.map((_, i) => selected[String(i)]).filter(Boolean).join(' • ');

  return (
    <PlaybookSection
      title="Appearance"
      chooseNote="1 on each line, or make something up"
      warn={warn}
      collapsible={isComplete}
      isCollapsed={isCollapsed}
      onToggleCollapse={handleToggleCollapse}
    >
      {isCollapsed && isComplete ? (
        <Text color="muted" className={styles.summary}>{summary}</Text>
      ) : (
        <div className={styles.rows}>
          {rows.map((options, rowIndex) => (
            <div key={rowIndex} className={styles.row}>
              <div className={styles.options}>
                {options.map((opt) => (
                  <Radio
                    key={opt}
                    name={`appearance-row-${rowIndex}`}
                    value={opt}
                    data-row={rowIndex}
                    checked={selected[String(rowIndex)] === opt}
                    disabled={isCustom}
                    onChange={handleSelect}
                    label={<span className={styles.optionLabel}>{opt}</span>}
                  />
                ))}
              </div>
            </div>
          ))}
          <div className={styles.row}>
            <Checkbox
              className={styles.customCheckbox}
              name="appearance-custom"
              value="custom"
              checked={isCustom}
              onChange={handleCustomToggle}
              label={
                isCustom ? (
                  <input
                    className={styles.customInput}
                    value={customText}
                    placeholder="Describe your appearance…"
                    aria-label="Custom appearance"
                    onChange={handleCustomChange}
                    onBlur={handleCustomBlur}
                    onClick={stopPropagation}
                  />
                ) : (
                  <span className={styles.customLabel}>Custom</span>
                )
              }
            />
          </div>
        </div>
      )}
    </PlaybookSection>
  );
};
