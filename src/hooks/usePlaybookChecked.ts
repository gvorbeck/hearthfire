import { useState, useEffect, useCallback, useRef } from 'react';
import { resolvePlaybookFeatures, featurePatch } from '@/lib/resolvePlaybookFeatures';
import { useDebouncedAnswers } from './useDebouncedAnswers';
import type { CharacterData, PlaybookFeatures } from '@/types';

// Intentionally broad — callers are responsible for passing the right key type.
// A narrower mapped type resolves to `never` for optional keys in strict mode.
type FeatureKey = keyof PlaybookFeatures;

export const usePlaybookChecked = (
  data: CharacterData | undefined,
  onSave: (data: Partial<CharacterData>) => Promise<void>,
  checkedKey: FeatureKey,
) => {
  const [checked, setChecked] = useState<Record<string, boolean>>(
    () => (resolvePlaybookFeatures(data)[checkedKey] as Record<string, boolean> | undefined) ?? {},
  );

  useEffect(() => {
    const val = resolvePlaybookFeatures(data)[checkedKey] as Record<string, boolean> | undefined;
    if (val !== undefined) setChecked(val);
  }, [data, checkedKey]);

  const handleChange = useCallback((id: string, value: boolean) => {
    const prev = checked;
    const next = { ...checked, [id]: value };
    setChecked(next);
    onSave(featurePatch(data, { [checkedKey]: next })).catch(() => setChecked(prev));
  }, [checked, onSave, data, checkedKey]);

  return { checked, handleChange };
};

export const usePlaybookCheckedWithAnswers = (
  data: CharacterData | undefined,
  onSave: (data: Partial<CharacterData>) => Promise<void>,
  checkedKey: FeatureKey,
  answersKey: FeatureKey,
) => {
  const dataRef = useRef(data);
  dataRef.current = data;

  const [checked, setChecked] = useState<Record<string, boolean>>(
    () => (resolvePlaybookFeatures(data)[checkedKey] as Record<string, boolean> | undefined) ?? {},
  );

  const buildPatch = useCallback(
    (a: Record<string, string>) => featurePatch(dataRef.current, { [answersKey]: a }),
    [answersKey],
  );

  // Pass undefined so useDebouncedAnswers initializes empty; the useEffect below
  // syncs the real value once data arrives, matching how checked state is handled.
  const { answers, setAnswers, handleAnswer } = useDebouncedAnswers(
    undefined,
    onSave,
    buildPatch,
  );

  useEffect(() => {
    const f = resolvePlaybookFeatures(data);
    const cv = f[checkedKey] as Record<string, boolean> | undefined;
    const av = f[answersKey] as Record<string, string> | undefined;
    if (cv !== undefined) setChecked(cv);
    if (av !== undefined) setAnswers(av);
  }, [data, checkedKey, answersKey, setAnswers]);

  const handleChange = useCallback((id: string, value: boolean) => {
    const prev = checked;
    const next = { ...checked, [id]: value };
    setChecked(next);
    onSave(featurePatch(dataRef.current, { [checkedKey]: next })).catch(() => setChecked(prev));
  }, [checked, onSave, checkedKey]);

  return { checked, handleChange, answers, handleAnswer };
};
