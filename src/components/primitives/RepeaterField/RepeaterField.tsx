import { useState, useEffect, useRef, useCallback } from 'react';
import clsx from 'clsx';
import { Button } from '../Button/Button';
import { useDebouncedSave } from '@/hooks/useDebouncedSave';
import styles from './RepeaterField.module.css';

interface RepeaterFieldProps {
  items: string[];
  onSave: (items: string[]) => Promise<void>;
  addLabel: string;
  itemLabel: string;
}

export const RepeaterField = ({ items, onSave, addLabel, itemLabel }: RepeaterFieldProps) => {
  const [local, setLocal] = useState(items);
  const isDirtyRef = useRef(false);
  const pendingFocusRef = useRef(false);
  const onSaveRef = useRef(onSave);
  onSaveRef.current = onSave;

  useEffect(() => {
    if (!isDirtyRef.current) setLocal(items);
  }, [items]);

  const wrappedSave = useCallback(async (next: string[]) => {
    await onSaveRef.current(next);
    isDirtyRef.current = false;
  }, []);

  const { onChange: debouncedChange, flush } = useDebouncedSave(wrappedSave, 1500);

  const handleChange = useCallback((index: number, value: string) => {
    isDirtyRef.current = true;
    const next = local.map((r, i) => (i === index ? value : r));
    setLocal(next);
    debouncedChange(next);
  }, [local, debouncedChange]);

  const handleBlur = useCallback((index: number) => {
    const trimmed = local[index].trim();
    const next = local.map((r, i) => (i === index ? trimmed : r));
    setLocal(next);
    flush(next);
  }, [local, flush]);

  const handleAdd = useCallback(() => {
    isDirtyRef.current = true;
    pendingFocusRef.current = true;
    const next = [...local, ''];
    setLocal(next);
    debouncedChange(next);
  }, [local, debouncedChange]);

  const handleRemove = useCallback((index: number) => {
    isDirtyRef.current = true;
    const next = local.filter((_, i) => i !== index);
    setLocal(next);
    debouncedChange(next);
  }, [local, debouncedChange]);

  return (
    <div className={styles.root}>
      {local.length > 0 && (
        <ul className={styles.list} aria-label={addLabel}>
          {local.map((value, i) => (
            <li key={i} className={styles.item}>
              <span className={styles.bullet} aria-hidden="true">☉</span>
              <input
                type="text"
                className={styles.input}
                value={value}
                aria-label={`${itemLabel} ${i + 1}`}
                ref={i === local.length - 1 ? (el) => { if (el && pendingFocusRef.current) { el.focus(); pendingFocusRef.current = false; } } : undefined}
                onChange={(e) => handleChange(i, e.target.value)}
                onBlur={() => handleBlur(i)}
              />
              <Button
                variant="ghost"
                size="sm"
                icon="close"
                onClick={() => handleRemove(i)}
                aria-label={`Remove ${itemLabel.toLowerCase()} ${i + 1}`}
                className={styles.removeBtn}
              />
            </li>
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
