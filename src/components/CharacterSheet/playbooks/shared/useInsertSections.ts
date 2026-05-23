import { useState, useEffect, useCallback, useRef } from 'react';
import { resolvePlaybookFeatures } from '@/lib/resolvePlaybookFeatures';
import { useCrewSave } from '../marshal/useCrewSave';
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

  const [instinct, setInstinct] = useState<string>(() => (features[keys.instinct] as string | undefined) ?? '');
  const [purpose, setPurpose] = useState<string>(() => (features[keys.purpose] as string | undefined) ?? '');
  const [purposeNames, setPurposeNames] = useState<Record<string, string>>(
    () => (features[keys.purposeName] as Record<string, string> | undefined) ?? {},
  );

  const purposeNamesRef = useRef(purposeNames);
  purposeNamesRef.current = purposeNames;

  const [instinctCollapsed, setInstinctCollapsed] = useState(false);
  const hasInitInstinctCollapse = useRef(false);
  const [purposeCollapsed, setPurposeCollapsed] = useState(false);
  const hasInitPurposeCollapse = useRef(false);

  useEffect(() => {
    const f = resolvePlaybookFeatures(data);
    const fi = f[keys.instinct] as string | undefined;
    const fp = f[keys.purpose] as string | undefined;
    const fpn = f[keys.purposeName] as Record<string, string> | undefined;
    if (fi !== undefined) setInstinct(fi);
    if (fp !== undefined) setPurpose(fp);
    if (fpn !== undefined) setPurposeNames(fpn);
  }, [data, keys.instinct, keys.purpose, keys.purposeName]);

  useEffect(() => {
    if (instinct && !hasInitInstinctCollapse.current) {
      hasInitInstinctCollapse.current = true;
      setInstinctCollapsed(true);
    }
  }, [instinct]);

  useEffect(() => {
    if (purpose && !hasInitPurposeCollapse.current) {
      hasInitPurposeCollapse.current = true;
      setPurposeCollapsed(true);
    }
  }, [purpose]);

  const handleToggleInstinctCollapse = useCallback(() => setInstinctCollapsed((v) => !v), []);
  const handleTogglePurposeCollapse = useCallback(() => setPurposeCollapsed((v) => !v), []);

  const handleInstinctChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setInstinct(val);
    setInstinctCollapsed(true);
    saveImmediate({ [keys.instinct]: val });
  }, [saveImmediate, keys.instinct]);

  const handlePurposeChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setPurpose(val);
    setPurposeCollapsed(true);
    saveImmediate({ [keys.purpose]: val });
  }, [saveImmediate, keys.purpose]);

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
    purpose,
    purposeNames,
    instinctCollapsed,
    purposeCollapsed,
    handleToggleInstinctCollapse,
    handleTogglePurposeCollapse,
    handleInstinctChange,
    handlePurposeChange,
    handlePurposeNameChange,
    handlePurposeNameBlur,
    saveImmediate,
    saveDebounced,
    flushDebounce,
  };
};
