import { useState, useCallback, useEffect } from 'react';
import { useDebouncedSave } from './useDebouncedSave';

// Shared state for a single free-text field backed by a debounced Firestore
// write: local optimistic value, debounce-on-change, flush-on-blur, and a
// pending guard so remote echoes don't clobber in-flight edits.
export const useDebouncedTextField = (
  firestoreValue: string,
  save: (value: string) => Promise<void>,
  delay = 1500,
) => {
  const [value, setValue] = useState(firestoreValue);
  const { onChange: debouncedChange, flush, isPendingRef } = useDebouncedSave(save, delay);

  useEffect(() => {
    if (isPendingRef.current) return;
    setValue(firestoreValue);
  }, [firestoreValue, isPendingRef]);

  const onChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setValue(e.target.value);
    debouncedChange(e.target.value);
  }, [debouncedChange]);

  const onBlur = useCallback((e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    flush(e.target.value);
  }, [flush]);

  return { value, onChange, onBlur };
};
