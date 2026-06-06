import { useCallback, useMemo } from 'react';
import { useLatest } from '@/hooks/useLatest';
import { useOptimisticField } from '@/hooks/useOptimisticField';
import { CheckboxGroup, List, Text } from '@/components/ui';
import { parseInlineMarkdown } from '@/lib/parseMarkdown';
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
    {parseInlineMarkdown('On your first turn, **introduce yourself** by name, pronouns, background, origin, and appearance.')}
  </Text>
);

const STEP_2 = (
  <Text key="step-2" font="serif" color="muted" leading="tight">
    {parseInlineMarkdown('On your second turn, **describe your special possessions** and how you contribute to the village (beyond working the fields).')}
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
  const onSaveRef = useLatest(onSave);
  const { value: questions, ref: questionsRef, save: saveQuestions } = useOptimisticField(
    data?.introductionQuestions ?? {},
    (next) => onSaveRef.current?.({ introductionQuestions: next }) ?? Promise.resolve(),
    'Failed to save.',
  );

  const handleQuestion = useCallback((id: string, checked: boolean) => {
    saveQuestions({ ...questionsRef.current, [id]: checked });
  }, [saveQuestions]);

  const items = useMemo(() => {
    if (!config) return [];
    const { step3, step4Questions, step6Questions } = config;
    return [
      STEP_1,
      STEP_2,
      <Text key="step-3" font="serif" color="muted" leading="tight">{step3}</Text>,
      <div key="step-4">
        <Text font="serif" color="muted" leading="tight">
          {parseInlineMarkdown('On your next turn, **answer one of the following**, naming one or more NPCs who live in Stonetop.')}
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
          {parseInlineMarkdown('On your next turn, **ask your fellow PCs one of these**. When others ask you, answer as you like.')}
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
        {parseInlineMarkdown("Wait here for everyone else. When everyone's ready, take turns introducing your characters. When **someone reveals something and you want to know more**, ask them about it. When **someone asks you a question**, answer it truthfully.")}
      </Text>
      <List variant="numbered" items={items} />
    </PlaybookSection>
  );
};
