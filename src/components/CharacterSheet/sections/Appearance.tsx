import { useState, useRef, useEffect, useCallback } from 'react';
import { Checkbox, Radio } from '@/components/primitives';
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
  const [selected, setSelected] = useState<Record<string, string>>(data?.appearance ?? {});
  const [isCustom, setIsCustom] = useState<boolean>(Boolean(data?.appearanceCustom));
  const [customText, setCustomText] = useState<string>(data?.appearanceCustom ?? '');
  const [isCollapsed, setIsCollapsed] = useState(false);
  const hasInitializedCollapse = useRef(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const onSaveRef = useRef(onSave);
  const selectedRef = useRef(selected);
  const customTextRef = useRef(customText);
  onSaveRef.current = onSave;
  selectedRef.current = selected;
  customTextRef.current = customText;

  useEffect(() => {
    if (data?.appearance !== undefined) setSelected(data.appearance);
    if (data?.appearanceCustom !== undefined) {
      setCustomText(data.appearanceCustom);
      setIsCustom(Boolean(data.appearanceCustom));
    }
  }, [data?.appearance, data?.appearanceCustom]);

  useEffect(() => () => { if (debounceRef.current) clearTimeout(debounceRef.current); }, []);

  useEffect(() => {
    const appearance = data?.appearance ?? {};
    const allRowsFilled = rows ? rows.every((_, i) => Boolean(appearance[String(i)])) : false;
    const complete = Boolean(data?.appearanceCustom) || allRowsFilled;
    if (complete && !hasInitializedCollapse.current) {
      hasInitializedCollapse.current = true;
      setIsCollapsed(true);
    }
  }, [data?.appearance, data?.appearanceCustom, rows]);

  const flushSave = useCallback((nextSelected: Record<string, string>, nextCustom: string) => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    onSaveRef.current?.({ appearance: nextSelected, appearanceCustom: nextCustom });
  }, []);

  const debouncedSave = useCallback((nextSelected: Record<string, string>, nextCustom: string) => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      onSaveRef.current?.({ appearance: nextSelected, appearanceCustom: nextCustom });
    }, 1000);
  }, []);

  const handleSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const rowIndex = Number(e.currentTarget.dataset.row);
    const value = e.currentTarget.value;
    const nextSelected = { ...selectedRef.current, [String(rowIndex)]: value };
    setSelected(nextSelected);
    flushSave(nextSelected, customTextRef.current);
  }, [flushSave]);

  const handleCustomToggle = useCallback(() => {
    const next = !isCustom;
    setIsCustom(next);
    if (!next) {
      setCustomText('');
      flushSave(selectedRef.current, '');
    } else {
      flushSave(selectedRef.current, customTextRef.current);
    }
  }, [isCustom, flushSave]);

  const handleCustomChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setCustomText(value);
    debouncedSave(selectedRef.current, value);
  }, [debouncedSave]);

  const handleCustomBlur = useCallback((e: React.FocusEvent<HTMLInputElement>) => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    onSaveRef.current?.({ appearance: selectedRef.current, appearanceCustom: e.target.value });
  }, []);

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
        <p className={styles.summary}>{summary}</p>
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
