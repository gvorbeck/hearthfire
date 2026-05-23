import { useRef, useCallback, useEffect } from 'react';
import { featurePatch } from '@/lib/resolvePlaybookFeatures';
import type { CharacterData } from '@/types';

export const useCrewSave = (data: CharacterData | undefined, onSave: (data: Partial<CharacterData>) => Promise<void>) => {
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const onSaveRef = useRef(onSave);
  const dataRef = useRef(data);
  onSaveRef.current = onSave;
  dataRef.current = data;

  useEffect(() => () => { if (debounceRef.current) clearTimeout(debounceRef.current); }, []);

  const saveDebounced = useCallback((patch: Parameters<typeof featurePatch>[1]) => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => onSaveRef.current(featurePatch(dataRef.current, patch)), 1000);
  }, []);

  const saveImmediate = useCallback((patch: Parameters<typeof featurePatch>[1]) => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    return onSaveRef.current(featurePatch(dataRef.current, patch));
  }, []);

  const flushDebounce = useCallback((patch: Parameters<typeof featurePatch>[1]) => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
      debounceRef.current = null;
    }
    return onSaveRef.current(featurePatch(dataRef.current, patch));
  }, []);

  return { saveDebounced, saveImmediate, flushDebounce, dataRef, onSaveRef };
};
