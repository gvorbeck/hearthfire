import { useState, useEffect, useRef, useCallback } from 'react';
import clsx from 'clsx';
import { Button } from '../Button/Button';
import { useDebouncedSave } from '@/hooks/useDebouncedSave';
import styles from './RepeaterField.module.css';

interface RepeaterItem {
  id: number;
  value: string;
}

interface RepeaterFieldProps {
  items: string[];
  onSave: (items: string[]) => Promise<void>;
  addLabel: string;
  itemLabel: string;
}

interface RowProps {
  item: RepeaterItem;
  position: number;
  itemLabel: string;
  pendingFocusId: number | null;
  onPendingFocusConsumed: () => void;
  onChange: (id: number, value: string) => void;
  onBlur: (id: number) => void;
  onRemove: (id: number) => void;
}

const Row = ({ item, position, itemLabel, pendingFocusId, onPendingFocusConsumed, onChange, onBlur, onRemove }: RowProps) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => onChange(item.id, e.target.value);
  const handleBlur = () => onBlur(item.id);
  const handleRemove = () => onRemove(item.id);

  return (
    <li className={styles.item}>
      <span className={styles.bullet} aria-hidden="true">☉</span>
      <input
        type="text"
        className={styles.input}
        value={item.value}
        aria-label={`${itemLabel} ${position}`}
        ref={(el) => { if (el && pendingFocusId === item.id) { el.focus(); onPendingFocusConsumed(); } }}
        onChange={handleChange}
        onBlur={handleBlur}
      />
      <Button
        variant="ghost"
        size="sm"
        icon="close"
        onClick={handleRemove}
        aria-label={`Remove ${itemLabel.toLowerCase()} ${position}`}
        className={styles.removeBtn}
      />
    </li>
  );
};

const toItems = (values: string[], startId: number): RepeaterItem[] =>
  values.map((value, i) => ({ id: startId + i, value }));

const toValues = (items: RepeaterItem[]): string[] => items.map((r) => r.value);

export const RepeaterField = ({ items, onSave, addLabel, itemLabel }: RepeaterFieldProps) => {
  const nextId = useRef(items.length);
  const [local, setLocal] = useState<RepeaterItem[]>(() => toItems(items, 0));
  const [pendingFocusId, setPendingFocusId] = useState<number | null>(null);
  const isDirtyRef = useRef(false);
  const onSaveRef = useRef(onSave);
  onSaveRef.current = onSave;

  useEffect(() => {
    if (!isDirtyRef.current) {
      setLocal(toItems(items, nextId.current));
    }
  }, [items]);

  const wrappedSave = useCallback(async (next: RepeaterItem[]) => {
    await onSaveRef.current(toValues(next));
    isDirtyRef.current = false;
  }, []);

  const { onChange: debouncedChange, flush } = useDebouncedSave(wrappedSave, 1500);

  const handleChange = useCallback((id: number, value: string) => {
    isDirtyRef.current = true;
    const next = local.map((r) => (r.id === id ? { ...r, value } : r));
    setLocal(next);
    debouncedChange(next);
  }, [local, debouncedChange]);

  const handleBlur = useCallback((id: number) => {
    const next = local.map((r) => (r.id === id ? { ...r, value: r.value.trim() } : r));
    setLocal(next);
    flush(next);
  }, [local, flush]);

  const handleAdd = useCallback(() => {
    isDirtyRef.current = true;
    const id = nextId.current++;
    setPendingFocusId(id);
    const next = [...local, { id, value: '' }];
    setLocal(next);
    debouncedChange(next);
  }, [local, debouncedChange]);

  const handleRemove = useCallback((id: number) => {
    isDirtyRef.current = true;
    const next = local.filter((r) => r.id !== id);
    setLocal(next);
    debouncedChange(next);
  }, [local, debouncedChange]);

  const handlePendingFocusConsumed = useCallback(() => setPendingFocusId(null), []);

  return (
    <div className={styles.root}>
      {local.length > 0 && (
        <ul className={styles.list} aria-label={addLabel}>
          {local.map((item, i) => (
            <Row
              key={item.id}
              item={item}
              position={i + 1}
              itemLabel={itemLabel}
              pendingFocusId={pendingFocusId}
              onPendingFocusConsumed={handlePendingFocusConsumed}
              onChange={handleChange}
              onBlur={handleBlur}
              onRemove={handleRemove}
            />
          ))}
        </ul>
      )}

      <Button
        variant="ghost"
        size="sm"
        icon="plus"
        onClick={handleAdd}
        className={clsx(styles.addBtn, local.length > 0 && styles.addBtnOffset)}
      >
        {addLabel}
      </Button>
    </div>
  );
};
