import { useRef, useCallback, useEffect, useState } from 'react';

export const useDebouncedSave = <T>(onSave: (value: T) => Promise<void>, delay = 1500) => {
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastSavedRef = useRef<string | null>(null);
  const onSaveRef = useRef(onSave);
  onSaveRef.current = onSave;

  const [isPending, setIsPending] = useState(false);

  useEffect(() => () => { if (debounceRef.current) clearTimeout(debounceRef.current); }, []);

  const save = useCallback(async (value: T) => {
    const key = JSON.stringify(value);
    if (key === lastSavedRef.current) {
      setIsPending(false);
      return;
    }
    lastSavedRef.current = key;
    try {
      await onSaveRef.current(value);
    } catch {
      // swallow: onSave owns error handling; this prevents unhandled rejection from setTimeout
    } finally {
      setIsPending(false);
    }
  }, []);

  const onChange = useCallback((value: T) => {
    if (JSON.stringify(value) !== lastSavedRef.current) setIsPending(true);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => save(value), delay);
  }, [save, delay]);

  const flush = useCallback((value: T) => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (JSON.stringify(value) !== lastSavedRef.current) setIsPending(true);
    return save(value);
  }, [save]);

  return { onChange, flush, isPending };
};
