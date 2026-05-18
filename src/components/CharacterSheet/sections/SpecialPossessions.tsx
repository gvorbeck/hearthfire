import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import clsx from 'clsx';
import { Checkbox, Input, Radio } from '@/components/primitives';
import { UseDots } from '@/components/CharacterSheet/Move';
import { parseInlineMarkdown } from '@/lib/parseMarkdown';
import { PlaybookSection } from '../PlaybookSection';
import type { Possession, PossessionSubItem } from '@/lib/specialPossessionsOptions';
import type { CharacterData } from '@/types';
import styles from './SpecialPossessions.module.css';

const PICK_COUNT = 2;

const stopPropagation = (e: React.MouseEvent) => e.stopPropagation();

interface SpecialPossessionsProps {
  config?: { pickNote?: string; items: Possession[] };
  data?: CharacterData;
  onSave?: (data: Partial<CharacterData>) => Promise<void>;
  level?: number;
}

const subItemKey = (possessionId: string, item: PossessionSubItem, idx: number): string => {
  if (typeof item === 'string') return `${possessionId}-${idx}`;
  return item.id ? `${possessionId}-${item.id}` : `${possessionId}-${idx}`;
};

interface SubItemProps {
  item: PossessionSubItem;
  possessionId: string;
  idx: number;
  parentChecked: boolean;
  selectOne: boolean;
  atSubMax: boolean;
  selected: Record<string, boolean>;
  uses: Record<string, number>;
  onToggle: (id: string, checked: boolean) => void;
  onRadioSelect: (possessionId: string, key: string) => void;
  onUses: (id: string, count: number) => void;
}

const SubItem = ({ item, possessionId, idx, parentChecked, selectOne, atSubMax, selected, uses, onToggle, onRadioSelect, onUses }: SubItemProps) => {
  const liCx = clsx(styles.subItem, styles.subItemSelectable);

  if (typeof item === 'string') {
    return (
      <li className={styles.subItem}>
        <span className={styles.labelText}>{parseInlineMarkdown(item)}</span>
      </li>
    );
  }

  const key = subItemKey(possessionId, item, idx);

  if (item.selectable) {
    const subChecked = parentChecked && (selected[key] ?? false);

    if (selectOne) {
      return (
        <li className={liCx}>
          <Radio
            name={possessionId}
            checked={subChecked}
            disabled={!parentChecked}
            onChange={() => onRadioSelect(possessionId, key)}
            className={styles.subItemCheckbox}
            label={<span className={styles.labelText}>{parseInlineMarkdown(item.label)}</span>}
          />
        </li>
      );
    }

    return (
      <li className={liCx}>
        <Checkbox
          aria-label={item.label}
          checked={subChecked}
          disabled={!parentChecked || (!subChecked && atSubMax)}
          onChange={(e) => onToggle(key, e.target.checked)}
          className={styles.subItemCheckbox}
          label={
            item.uses !== undefined ? (
              <span className={styles.subItemWithUses}>
                <span className={styles.labelText}>{parseInlineMarkdown(item.label)}</span>
                <span className={styles.subItemDots}>
                  <UseDots total={item.uses} checked={uses[key] ?? 0} onChange={(n) => onUses(key, n)} disabled={!subChecked} />
                  {item.usesLabel && <span className={styles.usesLabel}>{item.usesLabel}</span>}
                </span>
              </span>
            ) : (
              <span className={styles.labelText}>{parseInlineMarkdown(item.label)}</span>
            )
          }
        />
      </li>
    );
  }

  return (
    <li className={styles.subItem}>
      <span className={styles.subItemWithUses}>
        <span className={styles.labelText}>{parseInlineMarkdown(item.label)}</span>
        {item.uses !== undefined && (
          <span className={styles.subItemDots}>
            <UseDots total={item.uses} checked={uses[key] ?? 0} onChange={(n) => onUses(key, n)} disabled={!parentChecked} />
            {item.usesLabel && <span className={styles.usesLabel}>{item.usesLabel}</span>}
          </span>
        )}
      </span>
    </li>
  );
};

interface PossessionLabelProps {
  p: Possession;
  checked: boolean;
  selected: Record<string, boolean>;
  uses: Record<string, number>;
  onToggle: (id: string, checked: boolean) => void;
  onRadioSelect: (possessionId: string, key: string) => void;
  onUses: (id: string, count: number) => void;
  renderExtra?: React.ReactNode;
}

const PossessionLabel = ({ p, checked, selected, uses, onToggle, onRadioSelect, onUses, renderExtra }: PossessionLabelProps) => {
  const heading = p.isCustom
    ? <span className={styles.customPlaceholder}>{p.label}</span>
    : <span className={styles.labelText}>{parseInlineMarkdown(p.label)}</span>;

  if (p.subItems) {
    const subSelectedCount = p.maxSubItems
      ? p.subItems.filter((item, i) => selected[subItemKey(p.id, item, i)]).length
      : 0;
    const atSubMax = p.maxSubItems !== undefined && subSelectedCount >= p.maxSubItems;
    return (
      <span className={styles.labelWithSubItems}>
        {heading}
        <ul className={styles.subItemList}>
          {p.subItems.map((item, idx) => (
            <SubItem
              key={subItemKey(p.id, item, idx)}
              item={item}
              possessionId={p.id}
              idx={idx}
              parentChecked={checked}
              selectOne={!!p.selectOneSubItem}
              atSubMax={atSubMax}
              selected={selected}
              uses={uses}
              onToggle={onToggle}
              onRadioSelect={onRadioSelect}
              onUses={onUses}
            />
          ))}
        </ul>
      </span>
    );
  }

  if (renderExtra) {
    return (
      <span className={styles.labelBody}>
        <span className={styles.labelText}>{parseInlineMarkdown(p.label)}</span>
        {renderExtra}
      </span>
    );
  }

  if (p.uses !== undefined) {
    return (
      <span className={styles.labelWithUses}>
        {heading}
        <span className={styles.subItemDots}>
          <UseDots total={p.uses} checked={uses[p.id] ?? 0} onChange={(n) => onUses(p.id, n)} disabled={!checked} />
          {p.usesLabel && <span className={styles.usesLabel}>{p.usesLabel}</span>}
        </span>
      </span>
    );
  }

  return heading;
};

export const SpecialPossessions = ({ config, data, onSave, level = 1 }: SpecialPossessionsProps = {}) => {
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

  const topLevelIds = new Set(config?.items.map(p => p.id) ?? []);
  const selectedCount = Object.entries(selected).filter(([k, v]) => v && topLevelIds.has(k)).length;
  const atMax = selectedCount >= PICK_COUNT;

  const handleToggle = useCallback((id: string, checked: boolean) => {
    setSelected(prev => {
      const next = { ...prev, [id]: checked };
      onSave?.({ specialPossessions: next }).catch(() => setSelected(prev));
      return next;
    });
  }, [onSave]);

  const handleRadioSelect = useCallback((possessionId: string, key: string) => {
    setSelected(prev => {
      const next = { ...prev };
      for (const k of Object.keys(next)) {
        if (k.startsWith(`${possessionId}-`)) next[k] = false;
      }
      next[key] = true;
      onSave?.({ specialPossessions: next }).catch(() => setSelected(prev));
      return next;
    });
  }, [onSave]);

  const handleUses = useCallback((id: string, count: number) => {
    setUses(prev => {
      const next = { ...prev, [id]: count };
      onSave?.({ specialPossessionUses: next }).catch(() => setUses(prev));
      return next;
    });
  }, [onSave]);

  const handleStock = useCallback((stockKey: Extract<keyof CharacterData, 'sacredPouchStock'>, stock: number) => {
    onSave?.({ [stockKey]: stock });
  }, [onSave]);

  const stockExtra = useMemo(() => {
    const stockItem = config?.items.find(p => p.stockKey);
    if (!stockItem?.stockKey) return undefined;
    const stock = data?.[stockItem.stockKey] ?? 0;
    const capacity = stockItem.stockCapacity?.(level) ?? 0;
    return {
      possessionId: stockItem.id,
      node: (
        <span className={styles.stockRow}>
          <span className={styles.stockLabel}>Stock:</span>
          {Array.from({ length: capacity }, (_, i) => {
            const filled = i < stock;
            const dotCx = clsx(styles.dot, filled && styles.dotFilled);
            return (
              <button
                key={i}
                type="button"
                className={dotCx}
                aria-label={filled ? `Clear stock ${i + 1}` : `Mark stock ${i + 1}`}
                onClick={() => handleStock(stockItem.stockKey!, filled ? i : i + 1)}
              />
            );
          })}
        </span>
      ),
    };
  }, [config?.items, data, level, handleStock]);

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

  if (!config?.items.length) return <PlaybookSection title="Special Possessions" />;

  return (
    <PlaybookSection title="Special Possessions" choose={PICK_COUNT} chooseNote={config.pickNote}>
      <div className={styles.list}>
        {config.items.map((p) => {
          const checked = p.isAlwaysSelected ? true : (selected[p.id] ?? false);
          return (
            <div key={p.id} className={styles.possessionRow}>
              <Checkbox
                aria-label={p.name}
                checked={checked}
                disabled={p.isAlwaysSelected || (!checked && atMax)}
                aria-disabled={p.isAlwaysSelected ? 'true' : undefined}
                readOnly={p.isAlwaysSelected}
                onChange={p.isAlwaysSelected ? undefined : (e) => handleToggle(p.id, e.target.checked)}
                className={styles.checkbox}
                label={
                  <PossessionLabel
                    p={p}
                    checked={checked}
                    selected={selected}
                    uses={uses}
                    onToggle={handleToggle}
                    onRadioSelect={handleRadioSelect}
                    onUses={handleUses}
                    renderExtra={stockExtra?.possessionId === p.id ? stockExtra.node : undefined}
                  />
                }
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
