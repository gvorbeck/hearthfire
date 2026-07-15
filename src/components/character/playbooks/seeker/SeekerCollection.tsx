import { PlaybookChecklistSection } from '../shared/PlaybookChecklistSection';
import type { ChecklistGroup } from '../shared/PlaybookChecklistSection';
import type { PlaybookSectionProps } from '@/types';

const GROUPS: ChecklistGroup[] = [
  {
    heading: '**MAJOR ARCANA**',
    intro: 'Your Background grants you 1 major arcanum. Answer at least 2 questions about it:',
    items: [
      { id: 'major-acquired', label: 'Where did you acquire it?' },
      { id: 'major-wrest', label: 'From whose grasp did you wrest it?' },
      { id: 'major-wants', label: 'Who else wants it?' },
      { id: 'major-cost', label: 'What did it cost you?' },
    ],
    answerPrompts: [
      { key: 'major-unlocked', label: 'When and how did you begin to unlock its mysteries?' },
    ],
  },
  {
    heading: '**MINOR ARCANA**',
    intro: 'Go to your Arcana tab and add 3 random minor arcana. Choose one whose secrets you have unlocked, one you have not yet mastered, and one you have not yet found.',
    items: [],
    answerPrompts: [
      {
        key: 'minor-mastered',
        label: 'Minor arcana — mastered: Where is it now? How did you come to master it?',
      },
      {
        key: 'minor-unmastered',
        label: 'Minor arcana — unmastered: Where is it? How did you find it?',
      },
      {
        key: 'minor-unfound',
        label: 'Minor arcana — not yet found: What do you know about it?',
      },
    ],
  },
];

export const SeekerCollection = ({ data, onSave }: PlaybookSectionProps) => (
  <PlaybookChecklistSection
    title="Collection"
    featureKey="seekerCollection"
    intro="In your travels and investigations you have acquired arcana—artifacts of power and mystery."
    introVariant="xs"
    groups={GROUPS}
    answerKey="seekerCollectionAnswers"
    data={data}
    onSave={onSave}
  />
);
