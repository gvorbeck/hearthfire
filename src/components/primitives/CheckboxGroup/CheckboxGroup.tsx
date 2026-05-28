import { useMemo } from 'react';
import clsx from 'clsx';
import { Checkbox } from '../Checkbox/Checkbox';
import { Text } from '../Text/Text';
import styles from './CheckboxGroup.module.css';

export interface CheckboxGroupItem {
  id: string;
  label: React.ReactNode;
  disabled?: boolean;
}

interface CheckboxGroupProps {
  items: CheckboxGroupItem[] | string[];
  checked: Record<string, boolean>;
  onChange: (id: string, checked: boolean) => void;
  label?: string;
  pickNote?: string;
  max?: number;
  disabled?: boolean;
  columns?: 1 | 2 | 4 | 6 | 'responsive-2-4-6';
  itemGap?: 'sm' | 'md' | 'lg';
}

const normalizeItems = (items: CheckboxGroupItem[] | string[]): CheckboxGroupItem[] =>
  items.map((item) => typeof item === 'string' ? { id: item, label: item } : item);

export const CheckboxGroup = ({
  items: rawItems,
  checked,
  onChange,
  label,
  pickNote,
  max,
  disabled = false,
  columns = 1,
  itemGap,
}: CheckboxGroupProps) => {
  const items = useMemo(() => normalizeItems(rawItems), [rawItems]);
  const selectedCount = items.filter(({ id }) => checked[id]).length;
  const atMax = max !== undefined && selectedCount >= max;

  const gridClass = clsx(
    columns === 'responsive-2-4-6' ? styles.gridResponsive246
    : columns === 6 ? styles.grid6
    : columns === 4 ? styles.grid4
    : columns === 2 ? styles.grid2
    : styles.list,
    itemGap === 'md' && styles.gapMd,
    itemGap === 'lg' && styles.gapLg,
  );

  return (
    <div className={styles.root}>
      {label && <Text font="serif" color="muted" leading="normal">{label}</Text>}
      {pickNote && <Text size="xs" color="tertiary" italic>{pickNote}</Text>}
      <div className={gridClass}>
        {items.map(({ id, label: itemLabel, disabled: itemDisabled }) => {
          const isChecked = checked[id] ?? false;
          const isDisabled = disabled || itemDisabled || (!isChecked && atMax);
          return (
            <Checkbox
              key={id}
              checked={isChecked}
              disabled={isDisabled}
              onChange={(e) => onChange(id, e.target.checked)}
              label={itemLabel}
            />
          );
        })}
      </div>
    </div>
  );
};
