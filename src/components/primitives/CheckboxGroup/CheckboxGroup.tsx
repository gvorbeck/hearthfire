import { Checkbox } from '../Checkbox/Checkbox';
import styles from './CheckboxGroup.module.css';

export interface CheckboxGroupItem {
  id: string;
  label: React.ReactNode;
  disabled?: boolean;
}

interface CheckboxGroupProps {
  items: CheckboxGroupItem[];
  checked: Record<string, boolean>;
  onChange: (id: string, checked: boolean) => void;
  label?: string;
  pickNote?: string;
  max?: number;
  disabled?: boolean;
  columns?: 1 | 2 | 4 | 6 | 'responsive-2-4-6';
}

export const CheckboxGroup = ({
  items,
  checked,
  onChange,
  label,
  pickNote,
  max,
  disabled = false,
  columns = 1,
}: CheckboxGroupProps) => {
  const selectedCount = items.filter(({ id }) => checked[id]).length;
  const atMax = max !== undefined && selectedCount >= max;

  const gridClass =
    columns === 'responsive-2-4-6' ? styles.gridResponsive246
    : columns === 6 ? styles.grid6
    : columns === 4 ? styles.grid4
    : columns === 2 ? styles.grid2
    : styles.list;

  return (
    <div className={styles.root}>
      {label && <p className={styles.label}>{label}</p>}
      {pickNote && <p className={styles.pickNote}>{pickNote}</p>}
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
