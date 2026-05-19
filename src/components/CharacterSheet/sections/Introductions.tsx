import { useState, useEffect, useCallback, useMemo } from 'react';
import { Checkbox, List } from '@/components/primitives';
import { PlaybookSection } from '../PlaybookSection';
import type { CharacterData } from '@/types';
import styles from './Introductions.module.css';

export interface IntroductionQuestion {
  id: string;
  text: string;
}

export interface IntroductionsConfig {
  step3: React.ReactNode;
  step4Questions: IntroductionQuestion[];
  step6Questions: IntroductionQuestion[];
}

interface IntroductionsProps {
  config?: IntroductionsConfig;
  data?: CharacterData;
  onSave?: (data: Partial<CharacterData>) => Promise<void>;
}

export const Introductions = ({ config, data, onSave }: IntroductionsProps = {}) => {
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
    onSave?.({ introductionQuestions: next }).catch(() => setQuestions(prev));
  }, [questions, onSave]);

  const items = useMemo(() => {
    if (!config) return [];
    const { step3, step4Questions, step6Questions } = config;
    return [
      <p key="step-1" className={styles.stepText}>
        On your first turn, <strong>introduce yourself</strong> by name, pronouns, background,
        origin, and appearance.
      </p>,
      <p key="step-2" className={styles.stepText}>
        On your second turn, <strong>describe your special possessions</strong> and how you
        contribute to the village (beyond working the fields).
      </p>,
      <p key="step-3" className={styles.stepText}>{step3}</p>,
      <div key="step-4">
        <p className={styles.stepText}>
          On your next turn, <strong>answer one of the following</strong>, naming one or more
          NPCs who live in Stonetop.
        </p>
        <div className={styles.questionList}>
          {step4Questions.map(({ id, text }) => (
            <Checkbox
              key={id}
              checked={questions[id] ?? false}
              onChange={(e) => handleQuestion(id, e.target.checked)}
              label={<span className={styles.questionText}>{text}</span>}
            />
          ))}
        </div>
      </div>,
      <p key="step-5" className={styles.stepText}>
        Go around again. Answer another question from 4, or pass. When everyone has passed, go on.
      </p>,
      <div key="step-6">
        <p className={styles.stepText}>
          On your next turn, <strong>ask your fellow PCs one of these</strong>. When others ask
          you, answer as you like.
        </p>
        <div className={styles.questionList}>
          {step6Questions.map(({ id, text }) => (
            <Checkbox
              key={id}
              checked={questions[id] ?? false}
              onChange={(e) => handleQuestion(id, e.target.checked)}
              label={<span className={styles.questionText}>{text}</span>}
            />
          ))}
        </div>
      </div>,
      <p key="step-7" className={styles.stepText}>
        Go around again. Ask another question from 6, or pass. When everyone has passed, go on.
      </p>,
      <p key="step-8" className={styles.stepText}>
        Add your home to the steading playbook. When everyone is done, let spring break forth!
      </p>,
    ];
  }, [config, questions, handleQuestion]);

  if (!config) return <PlaybookSection title="Introductions" />;

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
