import { useState, useEffect, useCallback, useRef } from 'react';
import { CheckboxGroup } from '@/components/primitives';
import { PlaybookSection } from '../../PlaybookSection';
import { AnswerPrompts } from '../AnswerPrompts';
import { useDebouncedAnswers } from '@/hooks/useDebouncedAnswers';
import { resolvePlaybookFeatures, featurePatch } from '@/lib/resolvePlaybookFeatures';
import type { CharacterData } from '@/types';
import styles from '../playbookSection.module.css';

const FEAR_ITEMS = [
  { id: 'fear-fire', label: 'Fire, burning, the smell of charred flesh' },
  { id: 'fear-seriously', label: "That they won't take you seriously" },
  { id: 'fear-cutout', label: "That you really aren't cut out for this" },
  { id: 'fear-death', label: 'The death of your family or loved ones' },
  { id: 'fear-alone', label: 'Being alone and helpless' },
  { id: 'fear-violence', label: 'Violence, bloodshed, and pain' },
  { id: 'fear-monsters', label: 'Monsters' },
  { id: 'fear-capable', label: "What you're capable of" },
  { id: 'fear-must', label: 'What you must do' },
];

const ANGER_ITEMS = [
  { id: 'anger-bullying', label: 'Bullying, slavery, and oppression' },
  { id: 'anger-cruelty', label: 'Wanton cruelty and unnecessary suffering' },
  { id: 'anger-injustice', label: 'Injustice and inequality' },
  { id: 'anger-cowardice', label: 'Cowardice, treachery, and selfishness' },
  { id: 'anger-beauty', label: 'The despoiling of beauty and innocence' },
  { id: 'anger-loved', label: 'Threats to your loved ones' },
  { id: 'anger-innocent', label: 'Violence to children, animals, the innocent' },
  { id: 'anger-nature', label: 'Perversions of nature' },
];

const ANSWER_PROMPTS = [
  { key: 'when', label: 'When did your fear or anger last cause you trouble?' },
  { key: 'what', label: 'What did you do?' },
  { key: 'outcome', label: 'How did it turn out?' },
];

interface WouldBeHeroFearAngerProps {
  data: CharacterData | undefined;
  onSave: (data: Partial<CharacterData>) => Promise<void>;
}

export const WouldBeHeroFearAnger = ({ data, onSave }: WouldBeHeroFearAngerProps) => {
  const dataRef = useRef(data);
  dataRef.current = data;

  const features = resolvePlaybookFeatures(data);
  const [checked, setChecked] = useState<Record<string, boolean>>(
    () => features.wouldBeHeroFearAnger ?? {}
  );
  const buildPatch = useCallback(
    (a: Record<string, string>) => featurePatch(dataRef.current, { wouldBeHeroFearAngerAnswers: a }),
    [],
  );
  const { answers, setAnswers, handleAnswer } = useDebouncedAnswers(
    features.wouldBeHeroFearAngerAnswers,
    onSave,
    buildPatch,
  );

  useEffect(() => {
    const f = resolvePlaybookFeatures(data);
    if (f.wouldBeHeroFearAnger !== undefined) setChecked(f.wouldBeHeroFearAnger);
    if (f.wouldBeHeroFearAngerAnswers !== undefined) setAnswers(f.wouldBeHeroFearAngerAnswers);
  }, [data, setAnswers]);

  const handleCheck = useCallback((id: string, value: boolean) => {
    const prev = checked;
    const next = { ...checked, [id]: value };
    setChecked(next);
    onSave(featurePatch(dataRef.current, { wouldBeHeroFearAnger: next })).catch(() => setChecked(prev));
  }, [checked, onSave]);

  return (
    <PlaybookSection title="Fear & Anger">
      <CheckboxGroup
        label="What do you fear most? (choose 1, maybe 2)"
        items={FEAR_ITEMS}
        checked={checked}
        onChange={handleCheck}
        max={2}
      />
      <hr className={styles.divider} />
      <CheckboxGroup
        label="What makes you burn with righteous anger? (choose 2, maybe 3)"
        items={ANGER_ITEMS}
        checked={checked}
        onChange={handleCheck}
        max={3}
      />
      <hr className={styles.divider} />
      <AnswerPrompts prompts={ANSWER_PROMPTS} answers={answers} onAnswer={handleAnswer} />
    </PlaybookSection>
  );
};
