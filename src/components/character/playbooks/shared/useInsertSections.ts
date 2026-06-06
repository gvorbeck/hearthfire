import { useCallback } from 'react';
import { useLatest } from '@/hooks/useLatest';
import { useOptimisticField } from '@/hooks/useOptimisticField';
import { resolvePlaybookFeatures } from '@/lib/resolvePlaybookFeatures';
import { useCrewSave } from './useCrewSave';
import type { CharacterData, PlaybookFeatures } from '@/types';

interface InsertSectionKeys {
  instinct: keyof PlaybookFeatures;
  purpose: keyof PlaybookFeatures;
  purposeName: keyof PlaybookFeatures;
}

export const useInsertSections = (
  data: CharacterData | undefined,
  onSave: (data: Partial<CharacterData>) => Promise<void>,
  keys: InsertSectionKeys,
) => {
  const { saveDebounced, saveImmediate, flushDebounce } = useCrewSave(data, onSave);
  const features = resolvePlaybookFeatures(data);
  const keysRef = useLatest(keys);

  const { value: instinct, save: saveInstinct } = useOptimisticField(
    (features[keys.instinct] as string | undefined) ?? '',
    (next) => saveImmediate({ [keysRef.current.instinct]: next }),
    'Failed to save.',
  );
  const { value: purpose, save: savePurpose } = useOptimisticField(
    (features[keys.purpose] as string | undefined) ?? '',
    (next) => saveImmediate({ [keysRef.current.purpose]: next }),
    'Failed to save.',
  );
  const { value: purposeNames, ref: purposeNamesRef, setValue: setPurposeNames } = useOptimisticField(
    (features[keys.purposeName] as Record<string, string> | undefined) ?? {},
    (next) => saveImmediate({ [keysRef.current.purposeName]: next }),
    'Failed to save.',
  );

  const handlePurposeNameChange = useCallback((purposeValue: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const next = { ...purposeNamesRef.current, [purposeValue]: e.target.value };
    setPurposeNames(next);
    saveDebounced({ [keysRef.current.purposeName]: next });
  }, [saveDebounced, setPurposeNames]);

  const handlePurposeNameBlur = useCallback(() => {
    flushDebounce({ [keysRef.current.purposeName]: purposeNamesRef.current });
  }, [flushDebounce]);

  return {
    instinct,
    saveInstinct,
    purpose,
    savePurpose,
    purposeNames,
    handlePurposeNameChange,
    handlePurposeNameBlur,
    saveImmediate,
    saveDebounced,
    flushDebounce,
  };
};
