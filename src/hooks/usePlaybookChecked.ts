import { useState, useEffect, useCallback, useRef } from 'react';
import { useLatest } from './useLatest';
import { resolvePlaybookFeatures, featurePatch } from '@/lib/resolvePlaybookFeatures';
import { useDebouncedSave } from './useDebouncedSave';
import { useToast } from '@/components/app';
import type { CharacterData, PlaybookFeatures } from '@/types';

// Intentionally broad — callers are responsible for passing the right key type.
// A narrower mapped type resolves to `never` for optional keys in strict mode.
type FeatureKey = keyof PlaybookFeatures;

interface UsePlaybookCheckedReturn {
  checked: Record<string, boolean>;
  handleChange: (id: string, value: boolean) => void;
}

interface UsePlaybookCheckedWithAnswersReturn extends UsePlaybookCheckedReturn {
  answers: Record<string, string>;
  handleAnswer: (key: string, value: string) => void;
  flushAnswers: () => void;
}

export const usePlaybookChecked = (
  data: CharacterData | undefined,
  onSave: (data: Partial<CharacterData>) => Promise<void>,
  checkedKey: FeatureKey,
): UsePlaybookCheckedReturn => {
  const { addToast } = useToast();
  // Counter, not a boolean: overlapping saves must each keep the guard raised
  // until they individually settle, or an early-resolving save would let a
  // remote echo clobber a still-in-flight optimistic write.
  const pendingCountRef = useRef(0);

  const [checked, setChecked] = useState<Record<string, boolean>>(
    () => (resolvePlaybookFeatures(data)[checkedKey] as Record<string, boolean> | undefined) ?? {},
  );

  useEffect(() => {
    if (pendingCountRef.current > 0) return;
    const val = resolvePlaybookFeatures(data)[checkedKey] as Record<string, boolean> | undefined;
    // Optimistic store-sync guarded by pendingCountRef; necessary, not derivable.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (val !== undefined) setChecked(val);
  }, [data, checkedKey]);

  const handleChange = useCallback((id: string, value: boolean) => {
    const prev = checked;
    const next = { ...checked, [id]: value };
    pendingCountRef.current += 1;
    setChecked(next);
    onSave(featurePatch(data, { [checkedKey]: next }))
      .catch(() => { setChecked(prev); addToast('Failed to save. Try again.', 'error'); })
      .finally(() => { pendingCountRef.current -= 1; });
  }, [checked, onSave, data, checkedKey, addToast]);

  return { checked, handleChange };
};

export const usePlaybookCheckedWithAnswers = (
  data: CharacterData | undefined,
  onSave: (data: Partial<CharacterData>) => Promise<void>,
  checkedKey: FeatureKey,
  answersKey: FeatureKey,
): UsePlaybookCheckedWithAnswersReturn => {
  const { addToast } = useToast();
  // Counter, not a boolean — see usePlaybookChecked above.
  const pendingCountRef = useRef(0);
  const dataRef = useLatest(data);

  const [checked, setChecked] = useState<Record<string, boolean>>(
    () => (resolvePlaybookFeatures(data)[checkedKey] as Record<string, boolean> | undefined) ?? {},
  );

  const [answers, setAnswers] = useState<Record<string, string>>(
    () => (resolvePlaybookFeatures(data)[answersKey] as Record<string, string> | undefined) ?? {},
  );
  const answersRef = useLatest(answers);

  const saveAnswers = useCallback(
    (a: Record<string, string>) => onSave(featurePatch(dataRef.current, { [answersKey]: a })),
    [onSave, answersKey],
  );
  const { onChange: debouncedAnswers, flush: flushAnswers, isPendingRef: answersPendingRef } = useDebouncedSave(saveAnswers);

  useEffect(() => {
    if (pendingCountRef.current > 0) return;
    const cv = resolvePlaybookFeatures(data)[checkedKey] as Record<string, boolean> | undefined;
    // Optimistic store-sync guarded by pendingCountRef; necessary, not derivable.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (cv !== undefined) setChecked(cv);
  }, [data, checkedKey]);

  useEffect(() => {
    if (answersPendingRef.current) return;
    const av = resolvePlaybookFeatures(data)[answersKey] as Record<string, string> | undefined;
    // Optimistic store-sync guarded by answersPendingRef; necessary, not derivable.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (av !== undefined) setAnswers(av);
  // Keyed on data + answersKey only; answersPendingRef is a stable ref.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data, answersKey]);

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
    pendingCountRef.current += 1;
    setChecked(next);
    onSave(featurePatch(dataRef.current, { [checkedKey]: next }))
      .catch(() => { setChecked(prev); addToast('Failed to save. Try again.', 'error'); })
      .finally(() => { pendingCountRef.current -= 1; });
  }, [checked, onSave, checkedKey, addToast]);

  return { checked, handleChange, answers, handleAnswer, flushAnswers: handleFlushAnswers };
};
