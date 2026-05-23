import { CheckboxGroup, Divider } from '@/components/primitives';
import { PlaybookSection } from '../../PlaybookSection';
import { AnswerPrompts } from '../AnswerPrompts';
import { usePlaybookCheckedWithAnswers } from '@/hooks/usePlaybookChecked';
import type { CharacterData } from '@/types';
import styles from '../playbookSection.module.css';

const THREAT_ITEMS = [
  { id: 'threat-great-wood', label: 'A dark, unwholesome presence lurking in the Great Wood' },
  { id: 'threat-ruined-tower', label: 'A strange, furtive figure seen near the Ruined Tower' },
  { id: 'threat-foothills', label: 'Something big & savage stalking the northern foothills' },
  { id: 'threat-suarachan', label: "Whatever's made the lizard-like suarachan of Ferrier's Fen so bold" },
  { id: 'threat-hillfolk', label: 'That of which the Hillfolk refuse to speak' },
];

const ANSWER_PROMPTS = [
  { key: 'what', label: 'What, exactly, do you think it is?' },
  { key: 'saw', label: 'What did you see, and how close did you have to get to see it?' },
  { key: 'lost', label: 'Whom or what have you lost to it?' },
  { key: 'left', label: 'What did it leave behind?' },
  { key: 'wants', label: 'What do you think it wants?' },
  { key: 'refuses', label: 'Who refuses to believe you?' },
  { key: 'more', label: 'Who can tell you more, if you can only convince them?' },
];

interface RangerSomethingWickedProps {
  data: CharacterData | undefined;
  onSave: (data: Partial<CharacterData>) => Promise<void>;
}

export const RangerSomethingWicked = ({ data, onSave }: RangerSomethingWickedProps) => {
  const { checked, handleChange: handleCheck, answers, handleAnswer, flushAnswers } = usePlaybookCheckedWithAnswers(
    data, onSave, 'rangerSomethingWicked', 'rangerSomethingWickedAnswers',
  );

  return (
    <PlaybookSection title="Something Wicked This Way Comes">
      <p className={styles.prose}>
        You know firsthand that trouble is out there, and like it or not, one of these days the
        folk of Stonetop are going to have to face it. What is it that you're so worried about?
        (choose 1)
      </p>
      <CheckboxGroup
        items={THREAT_ITEMS}
        checked={checked}
        onChange={handleCheck}
        max={1}
      />
      <Divider />
      <p className={styles.prose}>
        Then, answer at least 3 of the following questions about this threat:
      </p>
      <AnswerPrompts prompts={ANSWER_PROMPTS} answers={answers} onAnswer={handleAnswer} onFlush={flushAnswers} />
    </PlaybookSection>
  );
};
