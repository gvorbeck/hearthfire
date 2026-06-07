import { useRef, useCallback, useEffect, useState, type MutableRefObject } from 'react';

interface UseDebouncedSaveReturn<T> {
  onChange: (value: T) => void;
  flush: (value: T) => Promise<void>;
  isPending: boolean;
  isPendingRef: MutableRefObject<boolean>;
}

export const useDebouncedSave = <T>(onSave: (value: T) => Promise<void>, delay = 1500): UseDebouncedSaveReturn<T> => {
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastSavedRef = useRef<string | null>(null);
  const onSaveRef = useRef(onSave);
  onSaveRef.current = onSave;

  const [isPending, setIsPending] = useState(false);
  const isPendingRef = useRef(false);

  const setPending = useCallback((value: boolean) => {
    isPendingRef.current = value;
    setIsPending(value);
  }, []);

  useEffect(() => () => { if (debounceRef.current) clearTimeout(debounceRef.current); }, []);

  const save = useCallback(async (value: T) => {
    const key = JSON.stringify(value);
    if (key === lastSavedRef.current) {
      setPending(false);
      return;
    }
    lastSavedRef.current = key;
    try {
      await onSaveRef.current(value);
    } catch {
      // swallow: onSave owns error handling; this prevents unhandled rejection from setTimeout
    } finally {
      setPending(false);
    }
  }, [setPending]);

  const onChange = useCallback((value: T) => {
    if (JSON.stringify(value) !== lastSavedRef.current) setPending(true);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => save(value), delay);
  }, [save, delay, setPending]);

  const flush = useCallback((value: T) => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (JSON.stringify(value) !== lastSavedRef.current) setPending(true);
    return save(value);
  }, [save, setPending]);

  return { onChange, flush, isPending, isPendingRef };
};
