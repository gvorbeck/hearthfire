import { CheckboxGroup, Divider, Text } from "@/components/ui";
import { PlaybookSection } from "../../PlaybookSection";
import { AnswerPrompts } from "../AnswerPrompts";
import { usePlaybookCheckedWithAnswers } from "@/hooks/usePlaybookChecked";
import type { PlaybookSectionProps } from "@/types";

const MAJOR_ARCANA_ITEMS = [
  { id: "major-acquired", label: "Where did you acquire it?" },
  { id: "major-wrest", label: "From whose grasp did you wrest it?" },
  { id: "major-wants", label: "Who else wants it?" },
  { id: "major-cost", label: "What did it cost you?" },
];

const ANSWER_PROMPTS = [
  {
    key: "major-unlocked",
    label: "When and how did you begin to unlock its mysteries?",
  },
  {
    key: "minor-mastered",
    label:
      "Minor arcana — mastered: Where is it now? How did you come to master it?",
  },
  {
    key: "minor-unmastered",
    label: "Minor arcana — unmastered: Where is it? How did you find it?",
  },
  {
    key: "minor-unfound",
    label: "Minor arcana — not yet found: What do you know about it?",
  },
];

type SeekerCollectionProps = PlaybookSectionProps;

export const SeekerCollection = ({ data, onSave }: SeekerCollectionProps) => {
  const {
    checked,
    handleChange: handleCheck,
    answers,
    handleAnswer,
    flushAnswers,
  } = usePlaybookCheckedWithAnswers(
    data,
    onSave,
    "seekerCollection",
    "seekerCollectionAnswers",
  );

  return (
    <PlaybookSection title="Collection">
      <Text size="xs" color="muted">
        In your travels and investigations you have acquired arcana—artifacts of
        power and mystery.
      </Text>
      <Divider />
      <Text size="xs" color="muted">
        **MAJOR ARCANA**
      </Text>
      <Text size="xs" color="muted">
        Your Background grants you 1 major arcanum. Answer at least 2 questions
        about it:
      </Text>
      <CheckboxGroup
        items={MAJOR_ARCANA_ITEMS}
        checked={checked}
        onChange={handleCheck}
      />
      <AnswerPrompts
        prompts={ANSWER_PROMPTS.slice(0, 1)}
        answers={answers}
        onAnswer={handleAnswer}
        onFlush={flushAnswers}
      />
      <Divider />
      <Text size="xs" color="muted">
        **MINOR ARCANA**
      </Text>
      <Text size="xs" color="muted">
        Go to your Arcana tab and add 3 random minor arcana. Choose one whose
        secrets you have unlocked, one you have not yet mastered, and one you
        have not yet found.
      </Text>
      <AnswerPrompts
        prompts={ANSWER_PROMPTS.slice(1)}
        answers={answers}
        onAnswer={handleAnswer}
        onFlush={flushAnswers}
      />
    </PlaybookSection>
  );
};
