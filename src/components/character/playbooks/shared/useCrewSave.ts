import { useRef, useCallback, useEffect, useState } from 'react';
import { useLatest } from '@/hooks/useLatest';
import { featurePatch } from '@/lib/resolvePlaybookFeatures';
import type { CharacterData } from '@/types';

type Patch = Parameters<typeof featurePatch>[1];

export const useCrewSave = (data: CharacterData | undefined, onSave: (data: Partial<CharacterData>) => Promise<void>) => {
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const onSaveRef = useLatest(onSave);
  const dataRef = useLatest(data);
  // Tracks whether a write is in flight (debounce timer set or an immediate/flush
  // save not yet resolved) so callers can gate their Firestore-snapshot sync
  // effect and avoid clobbering optimistic local state with our own echo.
  const pendingRef = useRef(false);
  // Bumped whenever a save resolves, to force consumers' sync effects to
  // re-run and pick up a remote snapshot that arrived (and was skipped)
  // while the save was pending — otherwise that snapshot would never be
  // applied until some unrelated data change.
  const [resolvedTick, setResolvedTick] = useState(0);
  const isMountedRef = useRef(true);
  const clearPending = useCallback(() => {
    pendingRef.current = false;
    if (isMountedRef.current) setResolvedTick((t) => t + 1);
  }, []);

  useEffect(() => () => {
    isMountedRef.current = false;
    if (debounceRef.current) clearTimeout(debounceRef.current);
  }, []);

  const saveDebounced = useCallback((patch: Patch, onError?: (err: unknown) => void) => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    pendingRef.current = true;
    debounceRef.current = setTimeout(() => {
      debounceRef.current = null;
      onSaveRef.current(featurePatch(dataRef.current, patch))
        .catch((err: unknown) => { onError?.(err); })
        .finally(clearPending);
    }, 1000);
  }, [clearPending]);

  const saveImmediate = useCallback((patch: Patch) => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
      debounceRef.current = null;
    }
    pendingRef.current = true;
    return onSaveRef.current(featurePatch(dataRef.current, patch)).finally(clearPending);
  }, [clearPending]);

  // Only writes if a debounce is actually pending — if the timer already fired,
  // this is a no-op rather than a redundant duplicate write.
  const flushDebounce = useCallback((patch: Patch) => {
    if (!debounceRef.current) return Promise.resolve();
    clearTimeout(debounceRef.current);
    debounceRef.current = null;
    pendingRef.current = true;
    return onSaveRef.current(featurePatch(dataRef.current, patch)).finally(clearPending);
  }, [clearPending]);

  return { saveDebounced, saveImmediate, flushDebounce, dataRef, onSaveRef, pendingRef, resolvedTick };
};
