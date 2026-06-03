import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useLatest } from '@/hooks/useLatest';
import clsx from 'clsx';
import { Checkbox, Input, Radio, UseDots } from '@/components/ui';
import { useToast } from '@/components/app';
import { parseInlineMarkdown } from '@/lib/parseMarkdown';
import { PlaybookSection } from '../PlaybookSection';
import type { Possession, PossessionSubItem, PlaybookSpecialPossessions } from '@/lib/specialPossessionsOptions';
import type { CharacterData } from '@/types';
import styles from './SpecialPossessions.module.css';

const PICK_COUNT = 2;

const stopPropagation = (e: React.MouseEvent) => e.stopPropagation();

type ChooseOverride = { count: number; note?: string };

interface SpecialPossessionsProps {
  config?: PlaybookSpecialPossessions;
  data?: CharacterData;
  onSave?: (data: Partial<CharacterData>) => Promise<void>;
  level?: number;
  chooseOverride?: ChooseOverride;
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
        <ul
          className={styles.subItemList}
          {...(p.selectOneSubItem ? { role: 'radiogroup', 'aria-label': p.label.replace(/\*+/g, '') } : {})}
        >
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

export const SpecialPossessions = ({ config, data, onSave, level = 1, chooseOverride }: SpecialPossessionsProps = {}) => {
  const { addToast } = useToast();
  const [selected, setSelected] = useState<Record<string, boolean>>(() => data?.specialPossessions ?? {});
  const [uses, setUses] = useState<Record<string, number>>(() => data?.specialPossessionUses ?? {});
  const [customText, setCustomText] = useState<string>(() => data?.specialPossessionCustom ?? '');
  const [isCollapsed, setIsCollapsed] = useState(false);
  const hasInitializedCollapse = useRef(false);
  const selectedRef = useLatest(selected);
  const usesRef = useLatest(uses);
  const customTextRef = useLatest(customText);
  const customDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setSelected(data?.specialPossessions ?? {});
    setUses(data?.specialPossessionUses ?? {});
  }, [data?.specialPossessions, data?.specialPossessionUses]);

  useEffect(() => () => { if (customDebounceRef.current) clearTimeout(customDebounceRef.current); }, []);

  useEffect(() => {
    if (!config?.items.length) return;
    const topIds = new Set(config.items.map(p => p.id));
    const count = Object.entries(selected).filter(([k, v]) => v && topIds.has(k)).length;
    const pc = config.pickCount ?? PICK_COUNT;
    if (count >= pc && !hasInitializedCollapse.current) {
      hasInitializedCollapse.current = true;
      setIsCollapsed(true);
    }
  }, [selected, config]);

  const handleToggle = useCallback((id: string, checked: boolean) => {
    const prev = selectedRef.current;
    const next = { ...prev, [id]: checked };
    setSelected(next);
    onSave?.({ specialPossessions: next }).catch(() => { setSelected(prev); addToast('Failed to save possession.', 'error'); });
  }, [onSave, addToast]);

  const handleRadioSelect = useCallback((possessionId: string, key: string) => {
    const prev = selectedRef.current;
    const next = { ...prev };
    for (const k of Object.keys(next)) {
      if (k.startsWith(`${possessionId}-`)) next[k] = false;
    }
    next[key] = true;
    setSelected(next);
    onSave?.({ specialPossessions: next }).catch(() => { setSelected(prev); addToast('Failed to save possession.', 'error'); });
  }, [onSave, addToast]);

  const handleUses = useCallback((id: string, count: number) => {
    const prev = usesRef.current;
    const next = { ...prev, [id]: count };
    setUses(next);
    onSave?.({ specialPossessionUses: next }).catch(() => { setUses(prev); addToast('Failed to save.', 'error'); });
  }, [onSave, addToast]);

  const handleStock = useCallback((stockKey: Extract<keyof CharacterData, 'sacredPouchStock'>, stock: number) => {
    onSave?.({ [stockKey]: stock })?.catch(() => addToast('Failed to save.', 'error'));
  }, [onSave, addToast]);

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
          <UseDots
            total={capacity}
            checked={stock}
            onChange={(n) => handleStock(stockItem.stockKey!, n)}
            label={`Stock: ${stock} of ${capacity}`}
          />
        </span>
      ),
    };
  }, [config?.items, data, level, handleStock]);

  const handleToggleCollapse = useCallback(() => setIsCollapsed((v) => !v), []);

  const handleCustomChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setCustomText(value);
    if (customDebounceRef.current) clearTimeout(customDebounceRef.current);
    customDebounceRef.current = setTimeout(() => {
      onSave?.({ specialPossessionCustom: customTextRef.current })
        ?.catch(() => addToast('Failed to save.', 'error'));
    }, 1000);
  }, [onSave, addToast]);

  const handleCustomBlur = useCallback((e: React.FocusEvent<HTMLInputElement>) => {
    if (customDebounceRef.current) clearTimeout(customDebounceRef.current);
    onSave?.({ specialPossessionCustom: e.target.value })?.catch(() => addToast('Failed to save.', 'error'));
  }, [onSave, addToast]);

  if (!config?.items.length) return <PlaybookSection title="Special Possessions" />;

  const topLevelIds = new Set(config.items.map(p => p.id));
  const basePick = config.pickCount ?? PICK_COUNT;
  const pickCount = chooseOverride?.count ?? basePick;
  const selectedCount = Object.entries(selected).filter(([k, v]) => v && topLevelIds.has(k)).length;
  const atMax = selectedCount >= basePick;
  const warn = selectedCount < basePick;
  const isComplete = !warn;
  const visibleItems = isCollapsed && isComplete
    ? config.items.filter((p) => p.isAlwaysSelected || selected[p.id])
    : config.items;

  return (
    <PlaybookSection
      title="Special Possessions"
      choose={pickCount}
      chooseNote={chooseOverride?.note ?? config.pickNote}
      warn={warn}
      collapsible={isComplete}
      isCollapsed={isCollapsed}
      onToggleCollapse={handleToggleCollapse}
    >
      <div className={styles.list}>
        {visibleItems.map((p) => {
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
