import { type MutableRefObject, useEffect, useRef } from 'react';

export const useFirestoreSync = <T>(
  firestoreValue: T,
  setter: (value: T) => void,
  pendingRef?: MutableRefObject<boolean>,
): void => {
  const lastRef = useRef<string | undefined>(undefined);

  useEffect(() => {
    const serialized = JSON.stringify(firestoreValue);
    if (serialized === lastRef.current) return;
    // Skip while a local save is pending, but don't record the skipped value —
    // otherwise it's never applied and the stale local state clobbers it on
    // the next save. The echo of our own write re-triggers this effect.
    if (pendingRef?.current) return;
    lastRef.current = serialized;
    setter(firestoreValue);
  }, [firestoreValue]); // eslint-disable-line react-hooks/exhaustive-deps
};
