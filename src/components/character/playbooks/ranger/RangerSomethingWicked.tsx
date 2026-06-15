import { PlaybookChecklistSection } from '../shared/PlaybookChecklistSection';
import type { AnswerPromptConfig, ChecklistGroup } from '../shared/PlaybookChecklistSection';
import type { PlaybookSectionProps } from '@/types';

const GROUPS: ChecklistGroup[] = [
  {
    max: 1,
    items: [
      { id: 'threat-great-wood', label: 'A dark, unwholesome presence lurking in the Great Wood' },
      { id: 'threat-ruined-tower', label: 'A strange, furtive figure seen near the Ruined Tower' },
      { id: 'threat-foothills', label: 'Something big & savage stalking the northern foothills' },
      { id: 'threat-suarachan', label: "Whatever's made the lizard-like suarachan of Ferrier's Fen so bold" },
      { id: 'threat-hillfolk', label: 'That of which the Hillfolk refuse to speak' },
    ],
  },
];

const ANSWER_PROMPTS: AnswerPromptConfig[] = [
  { key: 'what', label: 'What, exactly, do you think it is?' },
  { key: 'saw', label: 'What did you see, and how close did you have to get to see it?' },
  { key: 'lost', label: 'Whom or what have you lost to it?' },
  { key: 'left', label: 'What did it leave behind?' },
  { key: 'wants', label: 'What do you think it wants?' },
  { key: 'refuses', label: 'Who refuses to believe you?' },
  { key: 'more', label: 'Who can tell you more, if you can only convince them?' },
];

export const RangerSomethingWicked = ({ data, onSave }: PlaybookSectionProps) => (
  <PlaybookChecklistSection
    title="Something Wicked This Way Comes"
    featureKey="rangerSomethingWicked"
    introVariant="xs"
    intro="You know firsthand that trouble is out there, and like it or not, one of these days the folk of Stonetop are going to have to face it. What is it that you're so worried about? (choose 1)"
    groups={GROUPS}
    answerKey="rangerSomethingWickedAnswers"
    answersIntro="Then, answer at least 3 of the following questions about this threat:"
    answerPrompts={ANSWER_PROMPTS}
    data={data}
    onSave={onSave}
  />
);
