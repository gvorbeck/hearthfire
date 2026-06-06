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
  const pendingRef = useRef(false);
  const [value, setValue] = useState<T>(firestoreValue);
  const ref = useLatest(value);

  useFirestoreSync(firestoreValue, setValue, pendingRef);

  const save = useCallback((next: T) => {
    const prev = ref.current;
    pendingRef.current = true;
    setValue(next);
    saveFnRef.current(next)
      .catch(() => {
        setValue(prev);
        addToastRef.current(errorMsg, 'error');
      })
      .finally(() => { pendingRef.current = false; });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return { value, ref, setValue, save, pendingRef };
};
