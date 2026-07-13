import { useRef, useCallback, useEffect, useState, useInsertionEffect, type MutableRefObject } from 'react';
import { useToastOptional } from '@/components/app/Toast/ToastContext';
import { useLatest } from './useLatest';
import { DOC_TOO_LARGE_MESSAGE, SAVE_ERROR_MESSAGE } from '@/lib/constants';

interface UseDebouncedSaveReturn<T> {
  onChange: (value: T) => void;
  flush: (value: T) => Promise<void>;
  isPending: boolean;
  isPendingRef: MutableRefObject<boolean>;
  // Tell the hook the authoritative remote value. If it differs from what this
  // client last saved, the dedupe key is cleared so re-submitting the old value
  // is no longer skipped. See noteRemoteValue below.
  noteRemoteValue: (value: T) => void;
}

// One automatic retry per failed value, delayed long enough for a transient
// connection blip to clear.
const RETRY_DELAY_MS = 4000;

// A write over Firestore's 1 MiB doc ceiling rejects with `invalid-argument`.
const isDocTooLarge = (error: unknown): boolean =>
  typeof error === 'object' && error !== null &&
  (error as { code?: unknown }).code === 'invalid-argument';

export const useDebouncedSave = <T>(
  onSave: (value: T) => Promise<void>,
  delay = 1500,
  // Overrides the default error toast for callers that surface failures themselves.
  onError?: (error: unknown) => void,
  // Fires with the value once it is known persisted (a successful write, or a
  // dedup against an already-saved value). Lets callers release per-field
  // ownership so stale local state can't ride along on a later multi-field save.
  onSuccess?: (value: T) => void,
): UseDebouncedSaveReturn<T> => {
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastSavedRef = useRef<string | null>(null);
  // Saves run strictly one at a time on this chain — concurrent writes can
  // commit out of order on the server, letting an older value win.
  const chainRef = useRef<Promise<void>>(Promise.resolve());
  const activeSavesRef = useRef(0);
  const failedKeyRef = useRef<string | null>(null);
  const retryTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  // The value waiting on the debounce timer, so unmount/pagehide can flush it
  // instead of silently discarding it.
  const queuedRef = useRef<{ value: T } | null>(null);
  const onSaveRef = useLatest(onSave);
  const onErrorRef = useLatest(onError);
  const onSuccessRef = useLatest(onSuccess);

  const addToast = useToastOptional()?.addToast;

  const [isPending, setIsPending] = useState(false);
  const isPendingRef = useRef(false);

  const setPending = useCallback((value: boolean) => {
    isPendingRef.current = value;
    setIsPending(value);
  }, []);

  // Lets the retry timer call the latest save without a circular useCallback dependency.
  const saveRef = useRef<(value: T) => Promise<void>>(() => Promise.resolve());

  const save = useCallback((value: T): Promise<void> => {
    queuedRef.current = null;
    // Any new save supersedes a scheduled retry — its payload reflects newer state.
    if (retryTimerRef.current) {
      clearTimeout(retryTimerRef.current);
      retryTimerRef.current = null;
    }
    activeSavesRef.current += 1;
    const run = chainRef.current.then(async () => {
      const key = JSON.stringify(value);
      // Already persisted — skip the write, but still report success so callers
      // can release ownership of fields a redundant flush re-submitted.
      if (key === lastSavedRef.current) { onSuccessRef.current?.(value); return; }
      try {
        await onSaveRef.current(value);
        // Only mark saved on success — after a failure, the next flush/change
        // must not be deduped away, or the edit is lost for good.
        lastSavedRef.current = key;
        onSuccessRef.current?.(value);
        if (failedKeyRef.current !== null) {
          failedKeyRef.current = null;
          if (!onErrorRef.current) addToast?.('Changes saved.', 'success');
        }
      } catch (error) {
        const isFirstFailure = failedKeyRef.current !== key;
        failedKeyRef.current = key;
        if (onErrorRef.current) onErrorRef.current(error);
        // The 1 MiB doc-size rejection gets its own actionable line; every other
        // failure uses the generic message. Both strings match the ones useGame's
        // reportSave emits, so the Toast dedupe collapses the two paths to one.
        else addToast?.(isDocTooLarge(error) ? DOC_TOO_LARGE_MESSAGE : SAVE_ERROR_MESSAGE, 'error');
        if (isFirstFailure) {
          retryTimerRef.current = setTimeout(() => { void saveRef.current(value); }, RETRY_DELAY_MS);
        }
      }
    }).finally(() => {
      activeSavesRef.current -= 1;
      if (activeSavesRef.current === 0) setPending(false);
    });
    chainRef.current = run;
    return run;
  }, [setPending, addToast]);
  // Mirror the latest `save` into a ref so the retry timer can call it without a
  // circular useCallback dependency. Written in an insertion effect (not during
  // render) to satisfy react-hooks/refs; the retry timer only fires post-commit.
  useInsertionEffect(() => {
    saveRef.current = save;
  });

  // Called by consumers when a fresh remote value arrives. The dedupe check in
  // `save` skips any write whose serialized value equals `lastSavedRef` — correct
  // while we're the only writer, but if another client changed the field after
  // our last save, the server no longer holds our value. Re-typing that value
  // would then be silently skipped and the field would snap back to the remote
  // one on the next echo. Clearing `lastSavedRef` once we see the remote diverge
  // lets that legitimate revert write go through.
  const noteRemoteValue = useCallback((value: T) => {
    if (JSON.stringify(value) !== lastSavedRef.current) lastSavedRef.current = null;
  }, []);

  const onChange = useCallback((value: T) => {
    if (JSON.stringify(value) !== lastSavedRef.current) setPending(true);
    queuedRef.current = { value };
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => save(value), delay);
  }, [save, delay, setPending]);

  const flush = useCallback((value: T) => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (JSON.stringify(value) !== lastSavedRef.current) setPending(true);
    return save(value);
  }, [save, setPending]);

  // Flush a queued save when the component unmounts or the page is hidden
  // (tab close, mobile app-switch) — timers don't survive either, so without
  // this the edit is dropped. A scheduled retry is left running on purpose:
  // it persists the user's edit even after they navigate away.
  useEffect(() => {
    const flushQueued = () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
        debounceRef.current = null;
      }
      if (queuedRef.current) void save(queuedRef.current.value);
    };
    const handleVisibility = () => {
      if (document.visibilityState === 'hidden') flushQueued();
    };
    window.addEventListener('pagehide', flushQueued);
    document.addEventListener('visibilitychange', handleVisibility);
    return () => {
      window.removeEventListener('pagehide', flushQueued);
      document.removeEventListener('visibilitychange', handleVisibility);
      flushQueued();
    };
  }, [save]);

  return { onChange, flush, isPending, isPendingRef, noteRemoteValue };
};
