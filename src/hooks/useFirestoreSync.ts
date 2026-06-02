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
    lastRef.current = serialized;
    if (pendingRef?.current) return;
    setter(firestoreValue);
  }, [firestoreValue]); // eslint-disable-line react-hooks/exhaustive-deps
};
