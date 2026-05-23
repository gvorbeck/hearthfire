import { Input } from '@/components/primitives';

interface AnswerPrompt {
  key: string;
  label: string;
}

interface AnswerPromptsProps {
  prompts: AnswerPrompt[];
  answers: Record<string, string>;
  onAnswer: (key: string, value: string) => void;
  onFlush?: () => void;
}

export const AnswerPrompts = ({ prompts, answers, onAnswer, onFlush }: AnswerPromptsProps) => (
  <>
    {prompts.map(({ key, label }) => (
      <Input
        key={key}
        multiline
        label={label}
        value={answers[key] ?? ''}
        onChange={(e) => onAnswer(key, e.target.value)}
        onBlur={onFlush}
      />
    ))}
  </>
);
