import { CheckboxGroup, Divider, Text } from '@/components/ui';
import { PlaybookSection } from '../../PlaybookSection';
import { AnswerPrompts } from '../AnswerPrompts';
import { usePlaybookCheckedWithAnswers } from '@/hooks/usePlaybookChecked';
import { parseInlineMarkdown } from '@/lib/parseMarkdown';
import type { PlaybookSectionProps } from '@/types';

const FEAR_ITEMS = [
  { id: 'fear-fire', label: 'Fire, burning, the smell of charred flesh' },
  { id: 'fear-seriously', label: "That they won't take you seriously" },
  { id: 'fear-cutout', label: "That you really aren't cut out for this" },
  { id: 'fear-death', label: 'The death of your family or loved ones' },
  { id: 'fear-alone', label: 'Being alone and helpless' },
  { id: 'fear-violence', label: 'Violence, bloodshed, and pain' },
  { id: 'fear-monsters', label: 'Monsters' },
  { id: 'fear-capable', label: "What you're capable of" },
  { id: 'fear-must', label: 'What you must do' },
];

const ANGER_ITEMS = [
  { id: 'anger-bullying', label: 'Bullying, slavery, and oppression' },
  { id: 'anger-cruelty', label: 'Wanton cruelty and unnecessary suffering' },
  { id: 'anger-injustice', label: 'Injustice and inequality' },
  { id: 'anger-cowardice', label: 'Cowardice, treachery, and selfishness' },
  { id: 'anger-beauty', label: 'The despoiling of beauty and innocence' },
  { id: 'anger-loved', label: 'Threats to your loved ones' },
  { id: 'anger-innocent', label: 'Violence to children, animals, the innocent' },
  { id: 'anger-nature', label: 'Perversions of nature' },
];

const ANSWER_PROMPTS = [
  { key: 'when', label: 'When did your fear or anger last cause you trouble?' },
  { key: 'what', label: 'What did you do?' },
  { key: 'outcome', label: 'How did it turn out?' },
];

type WouldBeHeroFearAngerProps = PlaybookSectionProps;

export const WouldBeHeroFearAnger = ({ data, onSave }: WouldBeHeroFearAngerProps) => {
  const { checked, handleChange: handleCheck, answers, handleAnswer, flushAnswers } = usePlaybookCheckedWithAnswers(
    data, onSave, 'wouldBeHeroFearAnger', 'wouldBeHeroFearAngerAnswers',
  );

  return (
    <PlaybookSection title="Fear & Anger">
      <Text as="p" size="xs" color="muted" leading="normal">
        {parseInlineMarkdown('When you **burn with righteous anger** (triggered by what you chose below), hold 2 Resolve. Spend Resolve 1-for-1 to set aside fear and doubt, act with uncanny speed, inspire allies, strike hard (+1d4 damage, *forceful*), or keep your footing despite what befalls you.')}
      </Text>
      <CheckboxGroup
        label="What do you fear most? (choose 1, maybe 2)"
        items={FEAR_ITEMS}
        checked={checked}
        onChange={handleCheck}
        max={2}
      />
      <Divider />
      <CheckboxGroup
        label="What makes you burn with righteous anger? (choose 2, maybe 3)"
        items={ANGER_ITEMS}
        checked={checked}
        onChange={handleCheck}
        max={3}
      />
      <Divider />
      <AnswerPrompts prompts={ANSWER_PROMPTS} answers={answers} onAnswer={handleAnswer} onFlush={flushAnswers} />
    </PlaybookSection>
  );
};
