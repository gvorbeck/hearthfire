import { useLatest } from './useLatest';
import { useOptimisticField } from './useOptimisticField';
import type { PlaybookFeatures } from '@/types';

export const usePlaybookField = <K extends keyof PlaybookFeatures>(
  key: K,
  firestoreValue: NonNullable<PlaybookFeatures[K]>,
  saveImmediate: (patch: Partial<PlaybookFeatures>) => Promise<void>,
  errorMsg: string,
) => {
  const saveImmediateRef = useLatest(saveImmediate);
  return useOptimisticField(
    firestoreValue,
    (next) => saveImmediateRef.current({ [key]: next } as Partial<PlaybookFeatures>),
    errorMsg,
  );
};
