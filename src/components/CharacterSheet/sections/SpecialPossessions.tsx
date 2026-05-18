import { useState, useEffect, useCallback, useRef } from 'react';
import clsx from 'clsx';
import { Checkbox, Input } from '@/components/primitives';
import { UseDots } from '@/components/CharacterSheet/Move';
import { parseInlineMarkdown } from '@/lib/parseMarkdown';
import { PlaybookSection } from '../PlaybookSection';
import type { Possession, PossessionSubItem } from '@/lib/specialPossessionsOptions';
import type { CharacterData } from '@/types';
import styles from './SpecialPossessions.module.css';

const PICK_COUNT = 2;

const stockCapacity = (level: number) => 3 + Math.floor(level / 2);

const stopPropagation = (e: React.MouseEvent) => e.stopPropagation();

interface SpecialPossessionsProps {
  options?: Possession[];
  data?: CharacterData;
  onSave?: (data: Partial<CharacterData>) => Promise<void>;
  sacredPouchStock?: number;
  onStockChange?: (stock: number) => void;
  level?: number;
}

export const SpecialPossessions = ({
  options,
  data,
  onSave,
  sacredPouchStock,
  onStockChange,
  level = 1,
}: SpecialPossessionsProps = {}) => {
  const [selected, setSelected] = useState<Record<string, boolean>>(() => data?.specialPossessions ?? {});
  const [uses, setUses] = useState<Record<string, number>>(() => data?.specialPossessionUses ?? {});
  const [customText, setCustomText] = useState<string>(() => data?.specialPossessionCustom ?? '');

  const customTextRef = useRef(customText);
  customTextRef.current = customText;
  const customDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setSelected(data?.specialPossessions ?? {});
    setUses(data?.specialPossessionUses ?? {});
    if (data?.specialPossessionCustom !== undefined) setCustomText(data.specialPossessionCustom);
  }, [data?.specialPossessions, data?.specialPossessionUses, data?.specialPossessionCustom]);

  useEffect(() => () => { if (customDebounceRef.current) clearTimeout(customDebounceRef.current); }, []);

  const selectedCount = Object.values(selected).filter(Boolean).length;
  const atMax = selectedCount >= PICK_COUNT;

  const handleToggle = useCallback((id: string, checked: boolean) => {
    const prev = selected;
    const next = { ...selected, [id]: checked };
    setSelected(next);
    onSave?.({ specialPossessions: next }).catch(() => setSelected(prev));
  }, [selected, onSave]);

  const handleUses = useCallback((id: string, count: number) => {
    const prev = uses;
    const next = { ...uses, [id]: count };
    setUses(next);
    onSave?.({ specialPossessionUses: next }).catch(() => setUses(prev));
  }, [uses, onSave]);

  const handleCustomChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setCustomText(value);
    if (customDebounceRef.current) clearTimeout(customDebounceRef.current);
    customDebounceRef.current = setTimeout(() => {
      onSave?.({ specialPossessionCustom: customTextRef.current });
    }, 1000);
  }, [onSave]);

  const handleCustomBlur = useCallback((e: React.FocusEvent<HTMLInputElement>) => {
    if (customDebounceRef.current) clearTimeout(customDebounceRef.current);
    onSave?.({ specialPossessionCustom: e.target.value });
  }, [onSave]);

  if (!options?.length) return <PlaybookSection title="Special Possessions" />;

  const hasSacredPouch = sacredPouchStock !== undefined;
  const stock = sacredPouchStock ?? 0;
  const capacity = stockCapacity(level);

  const renderSubItem = (item: PossessionSubItem, possessionId: string, idx: number, checked: boolean): React.ReactNode => {
    if (typeof item === 'string') {
      return <li key={idx} className={styles.subItem}><span className={styles.labelText}>{parseInlineMarkdown(item)}</span></li>;
    }
    const key = `${possessionId}-${idx}`;
    return (
      <li key={idx} className={styles.subItem}>
        <span className={styles.subItemWithUses}>
          <span className={styles.labelText}>{parseInlineMarkdown(item.label)}</span>
          {item.uses !== undefined && (
            <span className={styles.subItemDots}>
              <UseDots total={item.uses} checked={uses[key] ?? 0} onChange={(n) => handleUses(key, n)} disabled={!checked} />
              {item.usesLabel && <span className={styles.usesLabel}>{item.usesLabel}</span>}
            </span>
          )}
        </span>
      </li>
    );
  };

  const renderLabel = (p: Possession, checked: boolean): React.ReactNode => {
    const heading = p.isCustom
      ? <span className={styles.customPlaceholder}>{p.label}</span>
      : <span className={styles.labelText}>{parseInlineMarkdown(p.label)}</span>;
    if (p.subItems) {
      return (
        <span className={styles.labelWithSubItems}>
          {heading}
          <ul className={styles.subItemList}>
            {p.subItems.map((item, idx) => renderSubItem(item, p.id, idx, checked))}
          </ul>
        </span>
      );
    }
    if (p.uses !== undefined) {
      return (
        <span className={styles.labelWithUses}>
          {heading}
          <UseDots total={p.uses} checked={uses[p.id] ?? 0} onChange={(n) => handleUses(p.id, n)} disabled={!checked} />
        </span>
      );
    }
    return heading;
  };

  return (
    <PlaybookSection title="Special Possessions" choose={PICK_COUNT} chooseNote={hasSacredPouch ? 'in addition to your sacred pouch' : undefined}>
      <div className={styles.list}>
        {hasSacredPouch && (
          <Checkbox
            aria-label="Sacred pouch"
            checked
            aria-disabled="true"
            readOnly
            className={styles.checkbox}
            label={
              <span className={styles.labelBody}>
                <span className={styles.labelText}>{parseInlineMarkdown('**Sacred pouch** (*magical*): see Sacred Pouch section.')}</span>
                <span className={styles.stockRow}>
                  <span className={styles.stockLabel}>Stock:</span>
                  {Array.from({ length: capacity }, (_, i) => {
                    const filled = i < stock;
                    const dotCx = clsx(styles.dot, filled && styles.dotFilled);
                    return (
                      <button
                        key={`stock-${i}`}
                        type="button"
                        className={dotCx}
                        aria-label={filled ? `Clear stock ${i + 1}` : `Mark stock ${i + 1}`}
                        onClick={() => onStockChange?.(filled ? i : i + 1)}
                      />
                    );
                  })}
                </span>
              </span>
            }
          />
        )}
        {options.map((p) => {
          const checked = selected[p.id] ?? false;
          return (
            <div key={p.id} className={styles.possessionRow}>
              <Checkbox
                aria-label={p.name}
                checked={checked}
                disabled={!checked && atMax}
                onChange={(e) => handleToggle(p.id, e.target.checked)}
                className={styles.checkbox}
                label={renderLabel(p, checked)}
              />
              {p.isCustom && checked && (
                <div className={styles.customInputWrapper}>
                  <Input
                    aria-label="Custom possession name"
                    value={customText}
                    placeholder="Describe possession…"
                    onChange={handleCustomChange}
                    onBlur={handleCustomBlur}
                    onClick={stopPropagation}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </PlaybookSection>
  );
};
