import { useState, useEffect, useCallback, useRef } from 'react';
import { CheckboxGroup } from '@/components/primitives';
import { PlaybookSection } from '../../PlaybookSection';
import { AnswerPrompts } from '../AnswerPrompts';
import { useDebouncedAnswers } from '@/hooks/useDebouncedAnswers';
import { resolvePlaybookFeatures, featurePatch } from '@/lib/resolvePlaybookFeatures';
import type { CharacterData } from '@/types';
import styles from '../playbookSection.module.css';

const ACTION_ITEMS = [
  { id: 'action-crinwin', label: '…to repel a nighttime raid by crinwin from the Great Wood.' },
  { id: 'action-bandits', label: '…to drive off bandits who\'d taken up near the Ruined Tower.' },
  { id: 'action-hillfolk', label: '…to fend off Hillfolk pursuing a blood feud.' },
  { id: 'action-brennan', label: '…against Brennan and his Claws, before they settled in Marshedge.' },
  { id: 'action-hagr', label: '…to face a brutish hagr, come down from the Foothills to wreak havoc.' },
  { id: 'action-beasts', label: '…to hunt down beasts (wolves, drakes, or bears maybe?) who\'d been preying on the village.' },
];

const ANSWER_PROMPTS = [
  { key: 'when', label: 'When exactly did it happen?' },
  { key: 'lost', label: 'Who lost their life, and who mourns them?' },
  { key: 'maimed', label: 'Who from Stonetop was maimed, and how?' },
  { key: 'saved', label: 'Who saved the day, and how?' },
  { key: 'escape', label: 'How did the enemy get away, and whom do you still blame for it?' },
  { key: 'honor', label: 'Who comported themselves with honor?' },
  { key: 'bugging', label: "What's been bugging you about it ever since?" },
  { key: 'worried', label: "What's got you even more worried now?" },
];

interface MarshalWarStoriesProps {
  data: CharacterData | undefined;
  onSave: (data: Partial<CharacterData>) => Promise<void>;
}

export const MarshalWarStories = ({ data, onSave }: MarshalWarStoriesProps) => {
  const dataRef = useRef(data);
  dataRef.current = data;

  const features = resolvePlaybookFeatures(data);
  const [checked, setChecked] = useState<Record<string, boolean>>(
    () => features.marshalWarStories ?? {}
  );
  const buildPatch = useCallback(
    (a: Record<string, string>) => featurePatch(dataRef.current, { marshalWarStoriesAnswers: a }),
    [],
  );
  const { answers, setAnswers, handleAnswer } = useDebouncedAnswers(
    features.marshalWarStoriesAnswers,
    onSave,
    buildPatch,
  );

  useEffect(() => {
    const f = resolvePlaybookFeatures(data);
    if (f.marshalWarStories !== undefined) setChecked(f.marshalWarStories);
    if (f.marshalWarStoriesAnswers !== undefined) setAnswers(f.marshalWarStoriesAnswers);
  }, [data, setAnswers]);

  const handleCheck = useCallback((id: string, value: boolean) => {
    const prev = checked;
    const next = { ...checked, [id]: value };
    setChecked(next);
    onSave(featurePatch(dataRef.current, { marshalWarStories: next })).catch(() => setChecked(prev));
  }, [checked, onSave]);

  return (
    <PlaybookSection title="War Stories">
      <p className={styles.prose}>
        The last time the militia saw serious action, it was… (pick 1)
      </p>
      <CheckboxGroup
        items={ACTION_ITEMS}
        checked={checked}
        onChange={handleCheck}
        max={1}
      />
      <hr className={styles.divider} />
      <p className={styles.prose}>
        Answer at least 3 of the following questions about that action:
      </p>
      <AnswerPrompts prompts={ANSWER_PROMPTS} answers={answers} onAnswer={handleAnswer} />
    </PlaybookSection>
  );
};
