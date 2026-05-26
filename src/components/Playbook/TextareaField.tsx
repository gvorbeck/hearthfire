import { useState, useEffect, useRef, useCallback, useId } from 'react';
import clsx from 'clsx';
import { useDebouncedSave } from '@/hooks/useDebouncedSave';
import styles from './Playbook.module.css';

interface TextareaFieldProps {
  value: string;
  label: string;
  note?: string;
  onSave: (value: string) => Promise<void>;
  rows?: number;
  noBorderTop?: boolean;
}

export const TextareaField = ({ value, label, note, onSave, rows = 6, noBorderTop }: TextareaFieldProps) => {
  const [local, setLocal] = useState(value);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const savedTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const onSaveRef = useRef(onSave);
  onSaveRef.current = onSave;
  const isDirtyRef = useRef(false);
  const id = useId();

  // Only sync incoming prop value when the user has no unsaved edits in flight.
  useEffect(() => {
    if (!isDirtyRef.current) setLocal(value);
  }, [value]);

  useEffect(() => () => { if (savedTimerRef.current) clearTimeout(savedTimerRef.current); }, []);

  const wrappedSave = useCallback(async (text: string) => {
    setSaving(true);
    try {
      await onSaveRef.current(text);
      isDirtyRef.current = false;
      setSaved(true);
      if (savedTimerRef.current) clearTimeout(savedTimerRef.current);
      savedTimerRef.current = setTimeout(() => setSaved(false), 2000);
    } finally {
      setSaving(false);
    }
  }, []);

  const { onChange: debouncedChange, flush: flushOnBlur } = useDebouncedSave(wrappedSave, 1500);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const text = e.target.value;
    isDirtyRef.current = true;
    setLocal(text);
    debouncedChange(text);
  }, [debouncedChange]);

  const handleBlur = useCallback(() => {
    flushOnBlur(local);
  }, [flushOnBlur, local]);

  const fieldCx = clsx(styles.contentField, noBorderTop && styles.contentFieldNoBorderTop);

  return (
    <div className={fieldCx}>
      <div className={styles.contentFieldHeader}>
        <label className={styles.contentFieldLabel} htmlFor={id}>{label}</label>
        {note && <span className={styles.contentFieldNote}>{note}</span>}
        <span className={styles.contentFieldStatus}>
          {saving ? 'Saving…' : saved ? 'Saved' : ''}
        </span>
      </div>
      <textarea
        id={id}
        className={styles.contentFieldTextarea}
        value={local}
        onChange={handleChange}
        onBlur={handleBlur}
        rows={rows}
      />
    </div>
  );
};
