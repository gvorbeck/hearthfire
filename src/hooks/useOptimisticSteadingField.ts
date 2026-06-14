import { useCallback, useEffect, useRef, useState } from 'react';
import { useToast } from '@/components/app';

/**
 * Optimistic local-state field for GM Steading sections that write list/record
 * fields to Firestore. Unlike `useOptimisticField`, this variant uses a
 * ref-*counter* (not a boolean) so overlapping saves can't let a remote echo
 * clobber in-flight local state, and `save` returns the underlying promise so
 * callers can chain off settlement.
 *
 * `save` takes a transform applied via a functional updater, so the new value
 * builds on the freshest state and the pre-save snapshot used for rollback is
 * captured from that same callback — neither relies on a stale closed-over
 * value a concurrent edit could clobber. Value-shaped callers pass `() => next`.
 *
 * Extra args after the transform are forwarded verbatim to `saveFn`, so a caller
 * can persist a narrower patch than the full value (e.g. only the toggled key of
 * a record) while still rolling the whole optimistic value back on failure.
 */
export const useOptimisticSteadingField = <T, A extends unknown[] = []>(
  firestoreValue: T,
  saveFn: (value: T, ...args: A) => Promise<unknown>,
) => {
  const { addToast } = useToast();
  const pendingRef = useRef(0);
  const [value, setValue] = useState<T>(() => firestoreValue);

  const addToastRef = useRef(addToast);
  addToastRef.current = addToast;
  const saveFnRef = useRef(saveFn);
  saveFnRef.current = saveFn;

  // Track the last value we synced from Firestore by content, not reference.
  // Callers commonly pass a fresh `items ?? []` / `npcs = []` each render, so a
  // reference check would re-sync (and re-render) forever while the field is empty.
  const lastSyncedRef = useRef<string | undefined>(undefined);
  useEffect(() => {
    if (pendingRef.current !== 0) return;
    const serialized = JSON.stringify(firestoreValue);
    if (serialized === lastSyncedRef.current) return;
    lastSyncedRef.current = serialized;
    setValue(firestoreValue);
  }, [firestoreValue]);

  const save = useCallback((transform: (current: T) => T, ...args: A): Promise<void> => {
    let prev: T;
    let updated: T;
    setValue((current) => { prev = current; updated = transform(current); return updated; });
    pendingRef.current += 1;
    return saveFnRef.current(updated!, ...args)
      .then(() => undefined)
      .catch(() => { setValue(prev!); addToastRef.current('Failed to save.', 'error'); })
      .finally(() => { pendingRef.current -= 1; });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return { value, save };
};
