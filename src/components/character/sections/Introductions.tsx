import { useCallback, useMemo } from 'react';
import { useLatest } from '@/hooks/useLatest';
import { useDebouncedSave } from '@/hooks/useDebouncedSave';
import { useOptimisticField } from '@/hooks/useOptimisticField';
import { CheckboxGroup, Input, List, Text } from '@/components/ui';
import { PlaybookSection } from '@/components/playbook/PlaybookSection';
import type { CharacterData, IntroductionsConfig } from '@/types';
import styles from './Introductions.module.css';

interface IntroductionsProps {
  config?: IntroductionsConfig;
  data?: CharacterData;
  onSave?: (data: Partial<CharacterData>) => Promise<void>;
}

interface StepAnswerProps {
  stepId: string;
  value: string;
  onChange: (stepId: string, value: string) => void;
  onBlur: (stepId: string, value: string) => void;
}

// One answer box per introductions step, so players can write out their
// response right under the prompt.
const StepAnswer = ({ stepId, value, onChange, onBlur }: StepAnswerProps) => (
  <Input
    multiline
    rows={2}
    className={styles.answer}
    value={value}
    placeholder="Write your answer…"
    aria-label="Your answer"
    onChange={(e) => onChange(stepId, e.target.value)}
    onBlur={(e) => onBlur(stepId, e.target.value)}
  />
);

export const Introductions = ({ config, data, onSave }: IntroductionsProps = {}) => {
  const onSaveRef = useLatest(onSave);
  const { value: questions, ref: questionsRef, save: saveQuestions } = useOptimisticField(
    data?.introductionQuestions ?? {},
    (next) => onSaveRef.current?.({ introductionQuestions: next }) ?? Promise.resolve(),
    'Failed to save.',
  );

  // answers tracks the same pendingRef as the debounced save below, so a remote
  // snapshot echo can't clobber in-progress typing while a write is in flight.
  const { value: answers, ref: answersRef, setValue: setAnswers, pendingRef: answersPendingRef } = useOptimisticField(
    data?.introductionAnswers ?? {},
    (next) => onSaveRef.current?.({ introductionAnswers: next }) ?? Promise.resolve(),
    'Failed to save.',
  );

  const saveAnswers = (next: Record<string, string>) =>
    onSaveRef.current?.({ introductionAnswers: next }) ?? Promise.resolve();
  // onSuccess fires on a real write AND on a deduped no-op flush, so the pending
  // flag always clears — otherwise a redundant flush would leave it stuck true
  // and block every later remote sync of the answers.
  const { onChange: debouncedSaveAnswers, flush: flushAnswers } = useDebouncedSave(
    saveAnswers,
    1000,
    undefined,
    () => { answersPendingRef.current = false; },
  );

  const handleQuestion = useCallback((id: string, checked: boolean) => {
    saveQuestions({ ...questionsRef.current, [id]: checked });
  }, [saveQuestions]);

  const handleAnswerChange = useCallback((stepId: string, value: string) => {
    const next = { ...answersRef.current, [stepId]: value };
    setAnswers(next);
    answersPendingRef.current = true;
    debouncedSaveAnswers(next);
  }, [setAnswers, debouncedSaveAnswers, answersPendingRef]);

  const handleAnswerBlur = useCallback((stepId: string, value: string) => {
    const next = { ...answersRef.current, [stepId]: value };
    setAnswers(next);
    answersPendingRef.current = true;
    flushAnswers(next);
  }, [setAnswers, flushAnswers, answersPendingRef]);

  const items = useMemo(() => {
    if (!config) return [];
    const { step3, step4Questions, step6Questions } = config;
    const answerFor = (stepId: string) => (
      <StepAnswer
        stepId={stepId}
        value={answers[stepId] ?? ''}
        onChange={handleAnswerChange}
        onBlur={handleAnswerBlur}
      />
    );
    return [
      <div key="step-1" className={styles.step}>
        <Text font="serif" color="muted" leading="tight">
          On your first turn, **introduce yourself** by name, pronouns, background, origin, and appearance.
        </Text>
        {answerFor('step-1')}
      </div>,
      <div key="step-2" className={styles.step}>
        <Text font="serif" color="muted" leading="tight">
          On your second turn, **describe your special possessions** and how you contribute to the village (beyond working the fields).
        </Text>
        {answerFor('step-2')}
      </div>,
      <div key="step-3" className={styles.step}>
        <Text font="serif" color="muted" leading="tight">{step3}</Text>
        {answerFor('step-3')}
      </div>,
      <div key="step-4" className={styles.step}>
        <Text font="serif" color="muted" leading="tight">
          On your next turn, **answer one of the following**, naming one or more NPCs who live in Stonetop.
        </Text>
        <div className={styles.questionList}>
          <CheckboxGroup
            items={step4Questions.map(({ id, text }) => ({ id, label: text }))}
            checked={questions}
            onChange={handleQuestion}
          />
        </div>
        {answerFor('step-4')}
      </div>,
      <Text key="step-5" font="serif" color="muted" leading="tight">
        Go around again. Answer another question from 4, or pass. When everyone has passed, go on.
      </Text>,
      <div key="step-6" className={styles.step}>
        <Text font="serif" color="muted" leading="tight">
          On your next turn, **ask your fellow PCs one of these**. When others ask you, answer as you like.
        </Text>
        <div className={styles.questionList}>
          <CheckboxGroup
            items={step6Questions.map(({ id, text }) => ({ id, label: text }))}
            checked={questions}
            onChange={handleQuestion}
          />
        </div>
        {answerFor('step-6')}
      </div>,
      <Text key="step-7" font="serif" color="muted" leading="tight">
        Go around again. Ask another question from 6, or pass. When everyone has passed, go on.
      </Text>,
      <Text key="step-8" font="serif" color="muted" leading="tight">
        Add your home to the steading playbook. When everyone is done, let spring break forth!
      </Text>,
    ];
  }, [config, questions, answers, handleQuestion, handleAnswerChange, handleAnswerBlur]);

  if (!config) return <PlaybookSection title="Introductions" />;

  return (
    <PlaybookSection title="Introductions" collapsible>
      <Text font="serif" color="muted" className={styles.intro}>
        Wait here for everyone else. When everyone's ready, take turns introducing your characters. When **someone reveals something and you want to know more**, ask them about it. When **someone asks you a question**, answer it truthfully.
      </Text>
      <List variant="numbered" items={items} />
    </PlaybookSection>
  );
};
