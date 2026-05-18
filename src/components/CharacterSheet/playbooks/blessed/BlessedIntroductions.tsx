import { useState, useEffect, useCallback, useMemo } from 'react';
import { Checkbox, List } from '@/components/primitives';
import { PlaybookSection } from '../../PlaybookSection';
import type { CharacterData } from '@/types';
import styles from './BlessedIntroductions.module.css';

const STEP4_QUESTIONS = [
  { id: 'q4-kin', text: 'Who is your closest kin?' },
  { id: 'q4-heart', text: 'Whose heart & soul is entwined with yours?' },
  { id: 'q4-taught', text: 'Who taught you the secret ways?' },
  { id: 'q4-beloved', text: 'Who is beloved by the goddess, your charge to nurture/guide/protect/heal?' },
];

const STEP6_QUESTIONS = [
  { id: 'q6-whisper', text: 'Which one of you do the spirits whisper of?' },
  { id: 'q6-rite', text: 'Which one of you has joined me in a sacred rite?' },
  { id: 'q6-oath', text: 'Which of you has made a blood-oath with me?' },
  { id: 'q6-doubt', text: 'Which one of you doubts the power of Danu?' },
];

interface BlessedIntroductionsProps {
  data: CharacterData | undefined;
  onSave: (data: Partial<CharacterData>) => Promise<void>;
}

export const BlessedIntroductions = ({ data, onSave }: BlessedIntroductionsProps) => {
  const [questions, setQuestions] = useState<Record<string, boolean>>(
    () => data?.introductionQuestions ?? {}
  );

  useEffect(() => {
    if (data?.introductionQuestions !== undefined) setQuestions(data.introductionQuestions);
  }, [data?.introductionQuestions]);

  const handleQuestion = useCallback((id: string, checked: boolean) => {
    const prev = questions;
    const next = { ...questions, [id]: checked };
    setQuestions(next);
    onSave({ introductionQuestions: next }).catch(() => setQuestions(prev));
  }, [questions, onSave]);

  const items = useMemo(() => [
    <p className={styles.stepText}>
      On your first turn, <strong>introduce yourself</strong> by name, pronouns, background,
      origin, and appearance.
    </p>,
    <p className={styles.stepText}>
      On your second turn, <strong>describe your special possessions</strong> and how you
      contribute to the village (beyond working the fields).
    </p>,
    <p className={styles.stepText}>
      On your third turn, <strong>describe your sacred pouch</strong> and its remarkable
      trait. Then, <strong>tell us about Danu&apos;s shrine</strong> in Stonetop and how she
      is worshipped.
    </p>,
    <>
      <p className={styles.stepText}>
        On your next turn, <strong>answer one of the following</strong>, naming one or more
        NPCs who live in Stonetop.
      </p>
      <div className={styles.questionList}>
        {STEP4_QUESTIONS.map(({ id, text }) => (
          <Checkbox
            key={id}
            checked={questions[id] ?? false}
            onChange={(e) => handleQuestion(id, e.target.checked)}
            label={<span className={styles.questionText}>{text}</span>}
          />
        ))}
      </div>
    </>,
    <p className={styles.stepText}>
      Go around again. Answer another question from 4, or pass. When everyone has passed, go on.
    </p>,
    <>
      <p className={styles.stepText}>
        On your next turn, <strong>ask your fellow PCs one of these</strong>. When others ask
        you, answer as you like.
      </p>
      <div className={styles.questionList}>
        {STEP6_QUESTIONS.map(({ id, text }) => (
          <Checkbox
            key={id}
            checked={questions[id] ?? false}
            onChange={(e) => handleQuestion(id, e.target.checked)}
            label={<span className={styles.questionText}>{text}</span>}
          />
        ))}
      </div>
    </>,
    <p className={styles.stepText}>
      Go around again. Ask another question from 6, or pass. When everyone has passed, go on.
    </p>,
    <p className={styles.stepText}>
      Add your home to the steading playbook. When everyone is done, let spring break forth!
    </p>,
  ], [questions, handleQuestion]);

  return (
    <PlaybookSection title="Introductions">
      <p className={styles.intro}>
        Wait here for everyone else. When everyone&apos;s ready, take turns introducing your
        characters. When <strong>someone reveals something and you want to know more</strong>, ask
        them about it. When <strong>someone asks you a question</strong>, answer it truthfully.
      </p>
      <List variant="numbered" items={items} />
    </PlaybookSection>
  );
};
