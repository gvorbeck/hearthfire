import { useRef, useCallback, useEffect } from 'react';

export const useDebouncedSave = <T>(onSave: (value: T) => Promise<void>, delay = 1500) => {
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastSavedRef = useRef<string | null>(null);
  const onSaveRef = useRef(onSave);
  onSaveRef.current = onSave;

  useEffect(() => () => { if (debounceRef.current) clearTimeout(debounceRef.current); }, []);

  const save = useCallback(async (value: T) => {
    const key = JSON.stringify(value);
    if (key === lastSavedRef.current) return;
    lastSavedRef.current = key;
    await onSaveRef.current(value);
  }, []);

  const onChange = useCallback((value: T) => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => save(value), delay);
  }, [save, delay]);

  const flush = useCallback((value: T) => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    return save(value);
  }, [save]);

  return { onChange, flush };
};
