import { Fragment } from 'react';
import { CheckboxGroup, Divider, Text } from '@/components/ui';
import { PlaybookSection } from '@/components/playbook/PlaybookSection';
import { AnswerPrompts } from '../AnswerPrompts';
import { usePlaybookChecked, usePlaybookCheckedWithAnswers } from '@/hooks/usePlaybookChecked';
import type { CheckboxGroupItem, PlaybookFeatures, PlaybookSectionProps } from '@/types';

interface AnswerPromptConfig {
  key: string;
  label: string;
}

interface ChecklistGroup {
  label?: string;
  items: CheckboxGroupItem[];
  max?: number;
  // Bold sub-heading rendered above this group (e.g. "**MAJOR ARCANA**"),
  // for sections split into multiple named parts.
  heading?: string;
  // Muted blurb rendered below the heading, above the checkbox items.
  intro?: string;
  // Answer prompts tied to this specific group, rendered after its items
  // instead of in the section-level answerPrompts block. Lets a section mix
  // per-group checkboxes+answers with a later answer-only group.
  answerPrompts?: AnswerPromptConfig[];
  answersIntro?: string;
}

interface PlaybookChecklistSectionProps extends PlaybookSectionProps {
  title: string;
  // Which PlaybookFeatures key stores this section's checked map.
  featureKey: keyof PlaybookFeatures;
  groups: ChecklistGroup[];
  // Optional muted text rendered above the first group / below the last.
  intro?: string;
  outro?: string;
  // 'serif' matches the longer descriptive blurbs; 'xs' matches the terse
  // single-line prompts. Defaults to 'serif'.
  introVariant?: 'serif' | 'xs';
  // When provided, renders an AnswerPrompts block after the groups, backed by
  // usePlaybookCheckedWithAnswers (answers stored under answerKey).
  answerKey?: keyof PlaybookFeatures;
  answerPrompts?: AnswerPromptConfig[];
  // Optional muted line introducing the answer prompts (e.g. "Answer at least 3…").
  answersIntro?: string;
}

const IntroText = ({ text, variant }: { text: string; variant: 'serif' | 'xs' }) =>
  variant === 'xs'
    ? <Text size="xs" color="muted">{text}</Text>
    : <Text font="serif" color="muted" leading="normal">{text}</Text>;

const Groups = ({
  groups,
  checked,
  onChange,
  featureKey,
  answers,
  onAnswer,
  onFlushAnswers,
}: {
  groups: ChecklistGroup[];
  checked: Record<string, boolean>;
  onChange: (id: string, value: boolean) => void;
  featureKey: keyof PlaybookFeatures;
  answers?: Record<string, string>;
  onAnswer?: (key: string, value: string) => void;
  onFlushAnswers?: () => void;
}) => (
  <>
    {groups.map((group, i) => (
      <Fragment key={`${String(featureKey)}-group-${i}`}>
        {(i > 0 || group.heading) && <Divider />}
        {group.heading && <Text size="xs" color="muted">{group.heading}</Text>}
        {group.intro && <Text size="xs" color="muted">{group.intro}</Text>}
        {group.items.length > 0 && (
          <CheckboxGroup
            label={group.label}
            items={group.items}
            checked={checked}
            onChange={onChange}
            max={group.max}
          />
        )}
        {group.answerPrompts && answers && onAnswer && (
          <>
            {group.answersIntro && <Text size="xs" color="muted">{group.answersIntro}</Text>}
            <AnswerPrompts prompts={group.answerPrompts} answers={answers} onAnswer={onAnswer} onFlush={onFlushAnswers} />
          </>
        )}
      </Fragment>
    ))}
  </>
);

// Variant without free-text answer prompts. Calls the lighter hook so the pure
// case never sets up debounced answer saving.
const ChecklistOnly = ({
  title, featureKey, groups, intro, outro, introVariant = 'serif', data, onSave,
}: PlaybookChecklistSectionProps) => {
  const { checked, handleChange } = usePlaybookChecked(data, onSave, featureKey);
  return (
    <PlaybookSection title={title}>
      {intro && <IntroText text={intro} variant={introVariant} />}
      <Groups groups={groups} checked={checked} onChange={handleChange} featureKey={featureKey} />
      {outro && <IntroText text={outro} variant={introVariant} />}
    </PlaybookSection>
  );
};

// Variant with free-text answer prompts after the groups. Section-level
// answerPrompts is optional when every group carries its own instead (e.g. a
// section split into named parts, each with its own trailing prompts).
const ChecklistWithAnswers = ({
  title, featureKey, groups, intro, outro, introVariant = 'serif',
  answerKey, answerPrompts, answersIntro, data, onSave,
}: PlaybookChecklistSectionProps) => {
  const { checked, handleChange, answers, handleAnswer, flushAnswers } =
    usePlaybookCheckedWithAnswers(data, onSave, featureKey, answerKey!);
  return (
    <PlaybookSection title={title}>
      {intro && <IntroText text={intro} variant={introVariant} />}
      <Groups
        groups={groups}
        checked={checked}
        onChange={handleChange}
        featureKey={featureKey}
        answers={answers}
        onAnswer={handleAnswer}
        onFlushAnswers={flushAnswers}
      />
      {answerPrompts && (
        <>
          <Divider />
          {answersIntro && <IntroText text={answersIntro} variant={introVariant} />}
          <AnswerPrompts prompts={answerPrompts} answers={answers} onAnswer={handleAnswer} onFlush={flushAnswers} />
        </>
      )}
      {outro && <IntroText text={outro} variant={introVariant} />}
    </PlaybookSection>
  );
};

// Data-driven wrapper for the common "PlaybookSection wrapping one or more
// CheckboxGroups (optionally followed by free-text AnswerPrompts), backed by the
// playbook-checked hooks" pattern. Renders dividers between groups automatically
// so callers only supply content, not wiring.
export const PlaybookChecklistSection = (props: PlaybookChecklistSectionProps) =>
  props.answerKey
    ? <ChecklistWithAnswers {...props} />
    : <ChecklistOnly {...props} />;

// Re-export the data shapes so per-playbook files can type their config.
export type { ChecklistGroup, AnswerPromptConfig };
