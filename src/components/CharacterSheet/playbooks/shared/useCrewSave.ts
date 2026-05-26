import { useRef, useCallback, useEffect } from 'react';
import { featurePatch } from '@/lib/resolvePlaybookFeatures';
import type { CharacterData } from '@/types';

type Patch = Parameters<typeof featurePatch>[1];

export const useCrewSave = (data: CharacterData | undefined, onSave: (data: Partial<CharacterData>) => Promise<void>) => {
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const onErrorRef = useRef<(() => void) | undefined>(undefined);
  const onSaveRef = useRef(onSave);
  const dataRef = useRef(data);
  onSaveRef.current = onSave;
  dataRef.current = data;

  useEffect(() => () => { if (debounceRef.current) clearTimeout(debounceRef.current); }, []);

  const saveDebounced = useCallback((patch: Patch, onError?: () => void) => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    onErrorRef.current = onError;
    debounceRef.current = setTimeout(() => {
      debounceRef.current = null;
      onErrorRef.current = undefined;
      onSaveRef.current(featurePatch(dataRef.current, patch)).catch(() => { onError?.(); });
    }, 1000);
  }, []);

  const saveImmediate = useCallback((patch: Patch) => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
      debounceRef.current = null;
      onErrorRef.current = undefined;
    }
    return onSaveRef.current(featurePatch(dataRef.current, patch));
  }, []);

  // Only writes if a debounce is actually pending — if the timer already fired,
  // this is a no-op rather than a redundant duplicate write.
  const flushDebounce = useCallback((patch: Patch) => {
    if (!debounceRef.current) return Promise.resolve();
    clearTimeout(debounceRef.current);
    debounceRef.current = null;
    onErrorRef.current = undefined;
    return onSaveRef.current(featurePatch(dataRef.current, patch));
  }, []);

  return { saveDebounced, saveImmediate, flushDebounce, dataRef, onSaveRef };
};
