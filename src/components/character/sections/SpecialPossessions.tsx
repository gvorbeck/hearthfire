import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useLatest } from '@/hooks/useLatest';
import { useOptimisticField } from '@/hooks/useOptimisticField';
import { useDebouncedTextField } from '@/hooks/useDebouncedTextField';
import clsx from 'clsx';
import { Checkbox, Input, Radio, Text, UseDots } from '@/components/ui';
import { useToast } from '@/components/app';
import { PlaybookSection } from '@/components/playbook/PlaybookSection';
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
        <Text as="span" className={styles.labelText}>{item}</Text>
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
            label={<Text as="span" className={styles.labelText}>{item.label}</Text>}
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
                <Text as="span" className={styles.labelText}>{item.label}</Text>
                <span className={styles.subItemDots}>
                  <UseDots total={item.uses} checked={uses[key] ?? 0} onChange={(n) => onUses(key, n)} disabled={!subChecked} />
                  {item.usesLabel && <Text as="span" font="serif" size="xs" color="muted">{item.usesLabel}</Text>}
                </span>
              </span>
            ) : (
              <Text as="span" className={styles.labelText}>{item.label}</Text>
            )
          }
        />
      </li>
    );
  }

  return (
    <li className={styles.subItem}>
      <span className={styles.subItemWithUses}>
        <Text as="span" className={styles.labelText}>{item.label}</Text>
        {item.uses !== undefined && (
          <span className={styles.subItemDots}>
            <UseDots total={item.uses} checked={uses[key] ?? 0} onChange={(n) => onUses(key, n)} disabled={!parentChecked} />
            {item.usesLabel && <Text as="span" font="serif" size="xs" color="muted">{item.usesLabel}</Text>}
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
    ? <Text as="span" className={styles.customPlaceholder}>{p.label}</Text>
    : <Text as="span" className={styles.labelText}>{p.label}</Text>;

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
        <Text as="span" className={styles.labelText}>{p.label}</Text>
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
          {p.usesLabel && <Text as="span" font="serif" size="xs" color="muted">{p.usesLabel}</Text>}
        </span>
      </span>
    );
  }

  return heading;
};

export const SpecialPossessions = ({ config, data, onSave, level = 1, chooseOverride }: SpecialPossessionsProps = {}) => {
  const { addToast } = useToast();
  const onSaveRef = useLatest(onSave);
  const { value: selected, ref: selectedRef, save: saveSelected } = useOptimisticField(
    data?.specialPossessions ?? {},
    (next) => onSaveRef.current?.({ specialPossessions: next }) ?? Promise.resolve(),
    'Failed to save possession.',
  );
  const { value: uses, ref: usesRef, save: saveUses } = useOptimisticField(
    data?.specialPossessionUses ?? {},
    (next) => onSaveRef.current?.({ specialPossessionUses: next }) ?? Promise.resolve(),
    'Failed to save.',
  );
  const [isCollapsed, setIsCollapsed] = useState(false);
  const hasInitializedCollapse = useRef(false);
  const background = data?.background;

  const saveCustom = useCallback(
    (next: string) => onSaveRef.current?.({ specialPossessionCustom: next }) ?? Promise.resolve(),
    [onSaveRef],
  );
  const customField = useDebouncedTextField(data?.specialPossessionCustom ?? '', saveCustom, 1000);

  const alwaysSelectedIds = useMemo(() => {
    const ids = new Set<string>();
    for (const p of config?.items ?? []) {
      if (p.isAlwaysSelected || (p.alwaysSelectedForBackground && p.alwaysSelectedForBackground === background)) {
        ids.add(p.id);
      }
    }
    return ids;
  }, [config?.items, background]);

  useEffect(() => {
    if (!config?.items.length) return;
    const topIds = new Set(config.items.map(p => p.id));
    const count = Object.entries(selected).filter(([k, v]) => v && topIds.has(k) && !alwaysSelectedIds.has(k)).length;
    const pc = config.pickCount ?? PICK_COUNT;
    if (count >= pc && !hasInitializedCollapse.current) {
      hasInitializedCollapse.current = true;
      setIsCollapsed(true);
    }
  }, [selected, config, alwaysSelectedIds]);

  const handleToggle = useCallback((id: string, checked: boolean) => {
    saveSelected({ ...selectedRef.current, [id]: checked });
  }, [saveSelected]);

  const handleRadioSelect = useCallback((possessionId: string, key: string) => {
    const prev = selectedRef.current;
    const next = { ...prev };
    for (const k of Object.keys(next)) {
      if (k.startsWith(`${possessionId}-`)) next[k] = false;
    }
    next[key] = true;
    saveSelected(next);
  }, [saveSelected]);

  const handleUses = useCallback((id: string, count: number) => {
    saveUses({ ...usesRef.current, [id]: count });
  }, [saveUses]);

  const handleStock = useCallback((stockKey: Extract<keyof CharacterData, 'sacredPouchStock' | 'herbGardenStock'>, stock: number) => {
    onSaveRef.current?.({ [stockKey]: stock })?.catch(() => addToast('Failed to save.', 'error'));
  }, [addToast]);

  const stockExtras = useMemo(() => {
    const map: Record<string, React.ReactNode> = {};
    for (const stockItem of config?.items ?? []) {
      if (!stockItem.stockKey) continue;
      const stock = data?.[stockItem.stockKey] ?? 0;
      const capacity = stockItem.stockCapacity?.(level) ?? 0;
      const visibleLabel = stockItem.stockLabel ?? 'Stock:';
      map[stockItem.id] = (
        <span className={styles.stockRow}>
          <Text as="span" className={styles.stockLabel}>{visibleLabel}</Text>
          <UseDots
            total={capacity}
            checked={stock}
            onChange={(n) => handleStock(stockItem.stockKey!, n)}
            label={stockItem.stockLabel ? undefined : `Stock: ${stock} of ${capacity}`}
          />
        </span>
      );
    }
    return map;
  }, [config?.items, data, level, handleStock]);

  const handleToggleCollapse = useCallback(() => setIsCollapsed((v) => !v), []);

  if (!config?.items.length) return <PlaybookSection title="Special Possessions" />;

  const topLevelIds = new Set(config.items.map(p => p.id));
  const basePick = config.pickCount ?? PICK_COUNT;
  const pickCount = chooseOverride?.count ?? basePick;
  const selectedCount = Object.entries(selected).filter(([k, v]) => v && topLevelIds.has(k) && !alwaysSelectedIds.has(k)).length;
  const atMax = selectedCount >= basePick;
  const warn = selectedCount < basePick;
  const isComplete = !warn;
  const visibleItems = isCollapsed && isComplete
    ? config.items.filter((p) => alwaysSelectedIds.has(p.id) || selected[p.id])
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
      forceChildren
    >
      <div className={styles.list}>
        {visibleItems.map((p) => {
          const alwaysSelected = alwaysSelectedIds.has(p.id);
          const checked = alwaysSelected ? true : (selected[p.id] ?? false);
          return (
            <div key={p.id} className={styles.possessionRow}>
              <Checkbox
                aria-label={p.name}
                checked={checked}
                disabled={alwaysSelected || (!checked && atMax)}
                aria-disabled={alwaysSelected ? 'true' : undefined}
                readOnly={alwaysSelected}
                onChange={alwaysSelected ? undefined : (e) => handleToggle(p.id, e.target.checked)}
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
                    renderExtra={stockExtras[p.id]}
                  />
                }
              />
              {p.isCustom && checked && (
                <div className={styles.customInputWrapper}>
                  <Input
                    aria-label="Custom possession name"
                    placeholder="Describe possession…"
                    onClick={stopPropagation}
                    {...customField}
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
