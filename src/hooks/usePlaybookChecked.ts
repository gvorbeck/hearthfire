import { useState, useEffect, useCallback, useRef } from 'react';
import { resolvePlaybookFeatures, featurePatch } from '@/lib/resolvePlaybookFeatures';
import { useDebouncedSave } from './useDebouncedSave';
import { useToast } from '@/components/app';
import type { CharacterData, PlaybookFeatures } from '@/types';

// Intentionally broad — callers are responsible for passing the right key type.
// A narrower mapped type resolves to `never` for optional keys in strict mode.
type FeatureKey = keyof PlaybookFeatures;

export const usePlaybookChecked = (
  data: CharacterData | undefined,
  onSave: (data: Partial<CharacterData>) => Promise<void>,
  checkedKey: FeatureKey,
) => {
  const { addToast } = useToast();

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
    onSave(featurePatch(data, { [checkedKey]: next })).catch(() => { setChecked(prev); addToast('Failed to save. Try again.', 'error'); });
  }, [checked, onSave, data, checkedKey, addToast]);

  return { checked, handleChange };
};

export const usePlaybookCheckedWithAnswers = (
  data: CharacterData | undefined,
  onSave: (data: Partial<CharacterData>) => Promise<void>,
  checkedKey: FeatureKey,
  answersKey: FeatureKey,
) => {
  const { addToast } = useToast();
  const dataRef = useRef(data);
  dataRef.current = data;

  const [checked, setChecked] = useState<Record<string, boolean>>(
    () => (resolvePlaybookFeatures(data)[checkedKey] as Record<string, boolean> | undefined) ?? {},
  );

  const [answers, setAnswers] = useState<Record<string, string>>(
    () => (resolvePlaybookFeatures(data)[answersKey] as Record<string, string> | undefined) ?? {},
  );
  const answersRef = useRef(answers);
  answersRef.current = answers;

  const saveAnswers = useCallback(
    (a: Record<string, string>) => onSave(featurePatch(dataRef.current, { [answersKey]: a })),
    [onSave, answersKey],
  );
  const { onChange: debouncedAnswers, flush: flushAnswers } = useDebouncedSave(saveAnswers);

  useEffect(() => {
    const f = resolvePlaybookFeatures(data);
    const cv = f[checkedKey] as Record<string, boolean> | undefined;
    const av = f[answersKey] as Record<string, string> | undefined;
    if (cv !== undefined) setChecked(cv);
    if (av !== undefined) setAnswers(av);
  }, [data, checkedKey, answersKey]);

  const handleAnswer = useCallback((key: string, value: string) => {
    const next = { ...answersRef.current, [key]: value };
    setAnswers(next);
    debouncedAnswers(next);
  }, [debouncedAnswers]);

  const handleFlushAnswers = useCallback(() => {
    flushAnswers(answersRef.current);
  }, [flushAnswers]);

  const handleChange = useCallback((id: string, value: boolean) => {
    const prev = checked;
    const next = { ...checked, [id]: value };
    setChecked(next);
    onSave(featurePatch(dataRef.current, { [checkedKey]: next })).catch(() => { setChecked(prev); addToast('Failed to save. Try again.', 'error'); });
  }, [checked, onSave, checkedKey, addToast]);

  return { checked, handleChange, answers, handleAnswer, flushAnswers: handleFlushAnswers };
};
