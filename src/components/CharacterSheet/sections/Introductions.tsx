import { useState, useEffect, useCallback, useMemo } from 'react';
import { CheckboxGroup, List, Text, useToast } from '@/components/primitives';
import { PlaybookSection } from '../PlaybookSection';
import type { CharacterData, IntroductionsConfig } from '@/types';
import styles from './Introductions.module.css';

interface IntroductionsProps {
  config?: IntroductionsConfig;
  data?: CharacterData;
  onSave?: (data: Partial<CharacterData>) => Promise<void>;
}

const STEP_1 = (
  <Text key="step-1" font="serif" color="muted" leading="tight">
    On your first turn, <strong>introduce yourself</strong> by name, pronouns, background,
    origin, and appearance.
  </Text>
);

const STEP_2 = (
  <Text key="step-2" font="serif" color="muted" leading="tight">
    On your second turn, <strong>describe your special possessions</strong> and how you
    contribute to the village (beyond working the fields).
  </Text>
);

const STEP_5 = (
  <Text key="step-5" font="serif" color="muted" leading="tight">
    Go around again. Answer another question from 4, or pass. When everyone has passed, go on.
  </Text>
);

const STEP_7 = (
  <Text key="step-7" font="serif" color="muted" leading="tight">
    Go around again. Ask another question from 6, or pass. When everyone has passed, go on.
  </Text>
);

const STEP_8 = (
  <Text key="step-8" font="serif" color="muted" leading="tight">
    Add your home to the steading playbook. When everyone is done, let spring break forth!
  </Text>
);

export const Introductions = ({ config, data, onSave }: IntroductionsProps = {}) => {
  const { addToast } = useToast();
  const [questions, setQuestions] = useState<Record<string, boolean>>(
    () => data?.introductionQuestions ?? {}
  );

  useEffect(() => {
    if (data?.introductionQuestions !== undefined) setQuestions(data.introductionQuestions);
  }, [data?.introductionQuestions]);

  const handleQuestion = useCallback((id: string, checked: boolean) => {
    setQuestions((prev) => {
      const next = { ...prev, [id]: checked };
      onSave?.({ introductionQuestions: next }).catch(() => { setQuestions(prev); addToast('Failed to save.', 'error'); });
      return next;
    });
  }, [onSave, addToast]);

  const items = useMemo(() => {
    if (!config) return [];
    const { step3, step4Questions, step6Questions } = config;
    return [
      STEP_1,
      STEP_2,
      <Text key="step-3" font="serif" color="muted" leading="tight">{step3}</Text>,
      <div key="step-4">
        <Text font="serif" color="muted" leading="tight">
          On your next turn, <strong>answer one of the following</strong>, naming one or more
          NPCs who live in Stonetop.
        </Text>
        <div className={styles.questionList}>
          <CheckboxGroup
            items={step4Questions.map(({ id, text }) => ({ id, label: <span className={styles.questionText}>{text}</span> }))}
            checked={questions}
            onChange={handleQuestion}
          />
        </div>
      </div>,
      STEP_5,
      <div key="step-6">
        <Text font="serif" color="muted" leading="tight">
          On your next turn, <strong>ask your fellow PCs one of these</strong>. When others ask
          you, answer as you like.
        </Text>
        <div className={styles.questionList}>
          <CheckboxGroup
            items={step6Questions.map(({ id, text }) => ({ id, label: <span className={styles.questionText}>{text}</span> }))}
            checked={questions}
            onChange={handleQuestion}
          />
        </div>
      </div>,
      STEP_7,
      STEP_8,
    ];
  }, [config, questions, handleQuestion]);

  if (!config) return <PlaybookSection title="Introductions" />;

  return (
    <PlaybookSection title="Introductions">
      <Text font="serif" color="muted" className={styles.intro}>
        Wait here for everyone else. When everyone&apos;s ready, take turns introducing your
        characters. When <strong>someone reveals something and you want to know more</strong>, ask
        them about it. When <strong>someone asks you a question</strong>, answer it truthfully.
      </Text>
      <List variant="numbered" items={items} />
    </PlaybookSection>
  );
};
