import { useState, useRef, useCallback } from 'react';
import { useLatest } from './useLatest';
import { useFirestoreSync } from './useFirestoreSync';
import { useToast } from '@/components/app';

/**
 * Optimistic local-state field backed by a Firestore write. The single field
 * hook used across the PC, Steading, and GM playbook pages.
 *
 * `save` accepts EITHER a next value or a transform `(current) => next`. The
 * transform form computes the new value from the freshest state (so concurrent
 * edits don't clobber each other) and captures the pre-save snapshot from that
 * same callback for rollback. Value callers pass the value directly.
 *
 * Extra args after the value/transform are forwarded verbatim to `saveFn`, so a
 * caller can persist a narrower patch than the full value (e.g. only the toggled
 * key of a record) while still rolling the whole optimistic value back on failure.
 *
 * `save` returns the underlying promise so callers can chain off settlement.
 *
 * Concurrency: an internal counter tracks in-flight saves so overlapping writes
 * can't let a remote echo clobber in-flight local state. `pendingRef` (returned)
 * is a boolean mirror consumed by `useFirestoreSync` to defer remote echoes while
 * a save is pending; callers that drive combined saves may set it directly.
 */
export const useOptimisticField = <T, A extends unknown[] = []>(
  firestoreValue: T,
  saveFn: (value: T, ...args: A) => Promise<unknown>,
  errorMsg = 'Failed to save.',
) => {
  const { addToast } = useToast();
  const addToastRef = useLatest(addToast);
  const saveFnRef = useLatest(saveFn);
  const errorMsgRef = useLatest(errorMsg);
  // Counter: governs save bookkeeping and overlapping-save safety.
  const pendingCountRef = useRef(0);
  // Boolean mirror: what useFirestoreSync reads to defer remote echoes. Kept as
  // a separate boolean (not the counter) because some callers set it directly.
  const pendingRef = useRef(false);
  const [value, setValue] = useState<T>(firestoreValue);
  const ref = useLatest(value);
  // Bumped when a save resolves so the component re-renders and useFirestoreSync
  // can flush a remote value that arrived (and was deferred) mid-save.
  const [, setSaveTick] = useState(0);

  useFirestoreSync(firestoreValue, setValue, pendingRef);

  const save = useCallback((next: T | ((current: T) => T), ...args: A): Promise<void> => {
    // Compute from the freshest committed value via the ref — NOT inside the
    // setValue updater. React batches the updater and may run it after this
    // function returns (and twice under StrictMode), so reading `updated` off it
    // synchronously would pass `undefined` to saveFn.
    const prev = ref.current;
    const updated = typeof next === 'function' ? (next as (c: T) => T)(prev) : next;
    setValue(updated);
    pendingCountRef.current += 1;
    pendingRef.current = true;
    return saveFnRef.current(updated, ...args)
      .then(() => undefined)
      .catch(() => {
        // Only roll back if our optimistic write is still the current value; a
        // newer overlapping save may have superseded it, and reverting to this
        // save's `prev` would clobber that newer edit.
        setValue((current) => (current === updated ? prev : current));
        addToastRef.current(errorMsgRef.current, 'error');
      })
      .finally(() => {
        pendingCountRef.current -= 1;
        if (pendingCountRef.current === 0) pendingRef.current = false;
        setSaveTick((t) => t + 1);
      });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return { value, ref, setValue, save, pendingRef };
};
