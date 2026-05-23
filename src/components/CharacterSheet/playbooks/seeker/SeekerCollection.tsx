import { CheckboxGroup, Divider } from '@/components/primitives';
import { PlaybookSection } from '../../PlaybookSection';
import { AnswerPrompts } from '../AnswerPrompts';
import { usePlaybookCheckedWithAnswers } from '@/hooks/usePlaybookChecked';
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
  const { checked, handleChange: handleCheck, answers, handleAnswer, flushAnswers } = usePlaybookCheckedWithAnswers(
    data, onSave, 'seekerCollection', 'seekerCollectionAnswers',
  );

  return (
    <PlaybookSection title="Collection">
      <p className={styles.prose}>
        In your travels and investigations you have acquired arcana—artifacts of power and mystery.
      </p>
      <Divider />
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
      <AnswerPrompts prompts={ANSWER_PROMPTS.slice(0, 1)} answers={answers} onAnswer={handleAnswer} onFlush={flushAnswers} />
      <Divider />
      <p className={styles.prose}>
        <strong>MINOR ARCANA</strong>
      </p>
      <p className={styles.prose}>
        Ask the GM for the minor arcana cards. Draw 3 at random and review both sides. Choose one
        whose secrets you have unlocked, one you have not yet mastered, and one you have not yet
        found.
      </p>
      <AnswerPrompts prompts={ANSWER_PROMPTS.slice(1)} answers={answers} onAnswer={handleAnswer} onFlush={flushAnswers} />
    </PlaybookSection>
  );
};
