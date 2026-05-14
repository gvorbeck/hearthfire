import { useState, useEffect, useRef, useCallback, useId } from 'react';
import styles from './Playbook.module.css';

interface TextareaFieldProps {
  value: string;
  label: string;
  note?: string;
  onSave: (value: string) => Promise<void>;
  rows?: number;
}

export const TextareaField = ({ value, label, note, onSave, rows = 6 }: TextareaFieldProps) => {
  const [local, setLocal] = useState(value);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const savedTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastSavedRef = useRef(value);
  const id = useId();

  useEffect(() => {
    setLocal(value);
  }, [value]);

  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      if (savedTimerRef.current) clearTimeout(savedTimerRef.current);
    };
  }, []);

  const save = useCallback(async (text: string) => {
    if (text === lastSavedRef.current) return;
    setSaving(true);
    try {
      await onSave(text);
      lastSavedRef.current = text;
      setSaved(true);
      if (savedTimerRef.current) clearTimeout(savedTimerRef.current);
      savedTimerRef.current = setTimeout(() => setSaved(false), 2000);
    } finally {
      setSaving(false);
    }
  }, [onSave]);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const text = e.target.value;
    setLocal(text);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => save(text), 1500);
  }, [save]);

  const handleBlur = useCallback(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    save(local);
  }, [save, local]);

  return (
    <div className={styles.contentField}>
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
