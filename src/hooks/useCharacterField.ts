import { useLatest } from './useLatest';
import { useOptimisticField } from './useOptimisticField';
import type { CharacterData } from '@/types';

export const useCharacterField = <K extends keyof CharacterData>(
  key: K,
  firestoreValue: NonNullable<CharacterData[K]>,
  onSave: (data: Partial<CharacterData>) => Promise<void>,
  errorMsg: string,
) => {
  const onSaveRef = useLatest(onSave);
  return useOptimisticField(
    firestoreValue,
    (next) => onSaveRef.current({ [key]: next } as Partial<CharacterData>),
    errorMsg,
  );
};
