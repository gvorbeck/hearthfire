import { CheckboxGroup, Divider, Text } from '@/components/primitives';
import { PlaybookSection } from '../../PlaybookSection';
import { AnswerPrompts } from '../AnswerPrompts';
import { usePlaybookCheckedWithAnswers } from '@/hooks/usePlaybookChecked';
import type { CharacterData } from '@/types';

const ACTION_ITEMS = [
  { id: 'action-crinwin', label: '…to repel a nighttime raid by crinwin from the Great Wood.' },
  { id: 'action-bandits', label: '…to drive off bandits who\'d taken up near the Ruined Tower.' },
  { id: 'action-hillfolk', label: '…to fend off Hillfolk pursuing a blood feud.' },
  { id: 'action-brennan', label: '…against Brennan and his Claws, before they settled in Marshedge.' },
  { id: 'action-hagr', label: '…to face a brutish hagr, come down from the Foothills to wreak havoc.' },
  { id: 'action-beasts', label: '…to hunt down beasts (wolves, drakes, or bears maybe?) who\'d been preying on the village.' },
];

const ANSWER_PROMPTS = [
  { key: 'when', label: 'When exactly did it happen?' },
  { key: 'lost', label: 'Who lost their life, and who mourns them?' },
  { key: 'maimed', label: 'Who from Stonetop was maimed, and how?' },
  { key: 'saved', label: 'Who saved the day, and how?' },
  { key: 'escape', label: 'How did the enemy get away, and whom do you still blame for it?' },
  { key: 'honor', label: 'Who comported themselves with honor?' },
  { key: 'bugging', label: "What's been bugging you about it ever since?" },
  { key: 'worried', label: "What's got you even more worried now?" },
];

interface MarshalWarStoriesProps {
  data: CharacterData | undefined;
  onSave: (data: Partial<CharacterData>) => Promise<void>;
}

export const MarshalWarStories = ({ data, onSave }: MarshalWarStoriesProps) => {
  const { checked, handleChange: handleCheck, answers, handleAnswer, flushAnswers } = usePlaybookCheckedWithAnswers(
    data, onSave, 'marshalWarStories', 'marshalWarStoriesAnswers',
  );

  return (
    <PlaybookSection title="War Stories">
      <Text as="p" size="xs" color="muted">
        The last time the militia saw serious action, it was… (pick 1)
      </Text>
      <CheckboxGroup
        items={ACTION_ITEMS}
        checked={checked}
        onChange={handleCheck}
        max={1}
      />
      <Divider />
      <Text as="p" size="xs" color="muted">
        Answer at least 3 of the following questions about that action:
      </Text>
      <AnswerPrompts prompts={ANSWER_PROMPTS} answers={answers} onAnswer={handleAnswer} onFlush={flushAnswers} />
    </PlaybookSection>
  );
};
