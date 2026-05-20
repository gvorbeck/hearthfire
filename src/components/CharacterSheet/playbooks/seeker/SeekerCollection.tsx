import { useState, useEffect, useCallback, useRef } from 'react';
import { CheckboxGroup } from '@/components/primitives';
import { PlaybookSection } from '../../PlaybookSection';
import { AnswerPrompts } from '../AnswerPrompts';
import { useDebouncedAnswers } from '@/hooks/useDebouncedAnswers';
import { resolvePlaybookFeatures, featurePatch } from '@/lib/resolvePlaybookFeatures';
import type { CharacterData } from '@/types';
import styles from '../playbookSection.module.css';

const MAJOR_ARCANA_ITEMS = [
  { id: 'major-acquired', label: 'Where did you acquire it?' },
  { id: 'major-wrest', label: 'From whose grasp did you wrest it?' },
  { id: 'major-wants', label: 'Who else wants it?' },
  { id: 'major-cost', label: 'What did it cost you?' },
];

const ANSWER_PROMPTS = [
  { key: 'major-unlocked', label: 'When and how did you begin to unlock its mysteries?' },
  { key: 'minor-mastered', label: 'Minor arcana — mastered: Where is it now? How did you come to master it?' },
  { key: 'minor-unmastered', label: 'Minor arcana — unmastered: Where is it? How did you find it?' },
  { key: 'minor-unfound', label: 'Minor arcana — not yet found: What do you know about it?' },
];

interface SeekerCollectionProps {
  data: CharacterData | undefined;
  onSave: (data: Partial<CharacterData>) => Promise<void>;
}

export const SeekerCollection = ({ data, onSave }: SeekerCollectionProps) => {
  const dataRef = useRef(data);
  dataRef.current = data;

  const features = resolvePlaybookFeatures(data);
  const [checked, setChecked] = useState<Record<string, boolean>>(
    () => features.seekerCollection ?? {}
  );
  const buildPatch = useCallback(
    (a: Record<string, string>) => featurePatch(dataRef.current, { seekerCollectionAnswers: a }),
    [],
  );
  const { answers, setAnswers, handleAnswer } = useDebouncedAnswers(
    features.seekerCollectionAnswers,
    onSave,
    buildPatch,
  );

  useEffect(() => {
    const f = resolvePlaybookFeatures(data);
    if (f.seekerCollection !== undefined) setChecked(f.seekerCollection);
    if (f.seekerCollectionAnswers !== undefined) setAnswers(f.seekerCollectionAnswers);
  }, [data, setAnswers]);

  const handleCheck = useCallback((id: string, value: boolean) => {
    const prev = checked;
    const next = { ...checked, [id]: value };
    setChecked(next);
    onSave(featurePatch(dataRef.current, { seekerCollection: next })).catch(() => setChecked(prev));
  }, [checked, onSave]);

  return (
    <PlaybookSection title="Collection">
      <p className={styles.prose}>
        In your travels and investigations you have acquired arcana—artifacts of power and mystery.
      </p>
      <hr className={styles.divider} />
      <p className={styles.prose}>
        <strong>MAJOR ARCANA</strong>
      </p>
      <p className={styles.prose}>
        Your Background grants you 1 major arcanum. Answer at least 2 questions about it:
      </p>
      <CheckboxGroup
        items={MAJOR_ARCANA_ITEMS}
        checked={checked}
        onChange={handleCheck}
      />
      <AnswerPrompts prompts={ANSWER_PROMPTS.slice(0, 1)} answers={answers} onAnswer={handleAnswer} />
      <hr className={styles.divider} />
      <p className={styles.prose}>
        <strong>MINOR ARCANA</strong>
      </p>
      <p className={styles.prose}>
        Ask the GM for the minor arcana cards. Draw 3 at random and review both sides. Choose one
        whose secrets you have unlocked, one you have not yet mastered, and one you have not yet
        found.
      </p>
      <AnswerPrompts prompts={ANSWER_PROMPTS.slice(1)} answers={answers} onAnswer={handleAnswer} />
    </PlaybookSection>
  );
};
