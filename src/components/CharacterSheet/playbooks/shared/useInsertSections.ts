import { useState, useEffect, useCallback } from 'react';
import { useLatest } from '@/hooks/useLatest';
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

  const [instinct, setInstinct] = useState<string>(() => (resolvePlaybookFeatures(data)[keys.instinct] as string | undefined) ?? '');
  const [purpose, setPurpose] = useState<string>(() => (resolvePlaybookFeatures(data)[keys.purpose] as string | undefined) ?? '');
  const [purposeNames, setPurposeNames] = useState<Record<string, string>>(
    () => (resolvePlaybookFeatures(data)[keys.purposeName] as Record<string, string> | undefined) ?? {},
  );

  const purposeNamesRef = useLatest(purposeNames);

  useEffect(() => {
    const f = resolvePlaybookFeatures(data);
    const fi = f[keys.instinct] as string | undefined;
    const fp = f[keys.purpose] as string | undefined;
    const fpn = f[keys.purposeName] as Record<string, string> | undefined;
    if (fi !== undefined) setInstinct(fi);
    if (fp !== undefined) setPurpose(fp);
    if (fpn !== undefined) setPurposeNames(fpn);
  }, [data, keys.instinct, keys.purpose, keys.purposeName]);

  const handlePurposeNameChange = useCallback((purposeValue: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setPurposeNames((prev) => {
      const next = { ...prev, [purposeValue]: val };
      saveDebounced({ [keys.purposeName]: next });
      return next;
    });
  }, [saveDebounced, keys.purposeName]);

  const handlePurposeNameBlur = useCallback(() => {
    flushDebounce({ [keys.purposeName]: purposeNamesRef.current });
  }, [flushDebounce, keys.purposeName]);

  return {
    instinct,
    setInstinct,
    purpose,
    setPurpose,
    purposeNames,
    handlePurposeNameChange,
    handlePurposeNameBlur,
    saveImmediate,
    saveDebounced,
    flushDebounce,
  };
};
