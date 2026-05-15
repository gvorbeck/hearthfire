import { useRef, useCallback, useEffect } from 'react';

export const useDebouncedSave = (onSave: (value: string) => Promise<void>, delay = 1500, initialValue?: string) => {
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastSavedRef = useRef<string | null>(initialValue ?? null);
  const onSaveRef = useRef(onSave);
  onSaveRef.current = onSave;

  useEffect(() => () => { if (debounceRef.current) clearTimeout(debounceRef.current); }, []);

  const save = useCallback(async (value: string) => {
    if (value === lastSavedRef.current) return;
    await onSaveRef.current(value);
    lastSavedRef.current = value;
  }, []);

  const onChange = useCallback((value: string) => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => save(value), delay);
  }, [save, delay]);

  const onBlur = useCallback((value: string) => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    save(value);
  }, [save]);

  return { onChange, onBlur };
};
