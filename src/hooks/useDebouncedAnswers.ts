import { useState, useEffect, useLayoutEffect, useCallback, useRef } from 'react';
import type { CharacterData } from '@/types';

export const useDebouncedAnswers = (
  initial: Record<string, string> | undefined,
  onSave: (data: Partial<CharacterData>) => Promise<void>,
  buildPatch: (answers: Record<string, string>) => Partial<CharacterData>,
  delay = 1000,
) => {
  const [answers, setAnswers] = useState<Record<string, string>>(() => initial ?? {});
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const onSaveRef = useRef(onSave);
  const answersRef = useRef(answers);
  useLayoutEffect(() => { onSaveRef.current = onSave; });
  useLayoutEffect(() => { answersRef.current = answers; });

  useEffect(() => () => { if (debounceRef.current) clearTimeout(debounceRef.current); }, []);

  const handleAnswer = useCallback((key: string, value: string) => {
    const next = { ...answersRef.current, [key]: value };
    setAnswers(next);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => onSaveRef.current(buildPatch(next)), delay);
  }, [buildPatch, delay]);

  const flushAnswers = useCallback(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
      debounceRef.current = null;
      onSaveRef.current(buildPatch(answersRef.current));
    }
  }, [buildPatch]);

  return { answers, setAnswers, handleAnswer, flushAnswers };
};
