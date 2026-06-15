import { Fragment } from 'react';
import { CheckboxGroup, Divider, Text } from '@/components/ui';
import { PlaybookSection } from '../../PlaybookSection';
import { AnswerPrompts } from '../AnswerPrompts';
import { usePlaybookChecked, usePlaybookCheckedWithAnswers } from '@/hooks/usePlaybookChecked';
import type { CheckboxGroupItem, PlaybookFeatures, PlaybookSectionProps } from '@/types';

interface ChecklistGroup {
  label?: string;
  items: CheckboxGroupItem[];
  max?: number;
}

interface AnswerPromptConfig {
  key: string;
  label: string;
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
}: {
  groups: ChecklistGroup[];
  checked: Record<string, boolean>;
  onChange: (id: string, value: boolean) => void;
  featureKey: keyof PlaybookFeatures;
}) => (
  <>
    {groups.map((group, i) => (
      <Fragment key={`${String(featureKey)}-group-${i}`}>
        {i > 0 && <Divider />}
        <CheckboxGroup
          label={group.label}
          items={group.items}
          checked={checked}
          onChange={onChange}
          max={group.max}
        />
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

// Variant with free-text answer prompts after the groups.
const ChecklistWithAnswers = ({
  title, featureKey, groups, intro, outro, introVariant = 'serif',
  answerKey, answerPrompts, answersIntro, data, onSave,
}: PlaybookChecklistSectionProps) => {
  const { checked, handleChange, answers, handleAnswer, flushAnswers } =
    usePlaybookCheckedWithAnswers(data, onSave, featureKey, answerKey!);
  return (
    <PlaybookSection title={title}>
      {intro && <IntroText text={intro} variant={introVariant} />}
      <Groups groups={groups} checked={checked} onChange={handleChange} featureKey={featureKey} />
      <Divider />
      {answersIntro && <IntroText text={answersIntro} variant={introVariant} />}
      <AnswerPrompts prompts={answerPrompts!} answers={answers} onAnswer={handleAnswer} onFlush={flushAnswers} />
      {outro && <IntroText text={outro} variant={introVariant} />}
    </PlaybookSection>
  );
};

// Data-driven wrapper for the common "PlaybookSection wrapping one or more
// CheckboxGroups (optionally followed by free-text AnswerPrompts), backed by the
// playbook-checked hooks" pattern. Renders dividers between groups automatically
// so callers only supply content, not wiring.
export const PlaybookChecklistSection = (props: PlaybookChecklistSectionProps) =>
  props.answerKey && props.answerPrompts
    ? <ChecklistWithAnswers {...props} />
    : <ChecklistOnly {...props} />;

// Re-export the data shapes so per-playbook files can type their config.
export type { ChecklistGroup, AnswerPromptConfig };
