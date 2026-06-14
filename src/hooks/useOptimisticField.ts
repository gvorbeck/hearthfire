import { useState, useRef, useCallback } from 'react';
import { useLatest } from './useLatest';
import { useFirestoreSync } from './useFirestoreSync';
import { useToast } from '@/components/app';

export const useOptimisticField = <T>(
  firestoreValue: T,
  saveFn: (value: T) => Promise<unknown>,
  errorMsg: string,
) => {
  const { addToast } = useToast();
  const addToastRef = useLatest(addToast);
  const saveFnRef = useLatest(saveFn);
  const errorMsgRef = useLatest(errorMsg);
  const pendingRef = useRef(false);
  const [value, setValue] = useState<T>(firestoreValue);
  const ref = useLatest(value);
  // Bumped when a save resolves so the component re-renders and useFirestoreSync
  // can flush a remote value that arrived (and was deferred) mid-save.
  const [, setSaveTick] = useState(0);

  useFirestoreSync(firestoreValue, setValue, pendingRef);

  const save = useCallback((next: T) => {
    const prev = ref.current;
    pendingRef.current = true;
    setValue(next);
    saveFnRef.current(next)
      .catch(() => {
        setValue(prev);
        addToastRef.current(errorMsgRef.current, 'error');
      })
      .finally(() => {
        pendingRef.current = false;
        setSaveTick((t) => t + 1);
      });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return { value, ref, setValue, save, pendingRef };
};
