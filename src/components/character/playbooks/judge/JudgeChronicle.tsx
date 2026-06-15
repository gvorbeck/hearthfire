import { PlaybookChecklistSection } from '../shared/PlaybookChecklistSection';
import type { ChecklistGroup } from '../shared/PlaybookChecklistSection';
import type { PlaybookSectionProps } from '@/types';

const GROUPS: ChecklistGroup[] = [
  {
    label: 'On the plus side, it… (choose 3)',
    max: 3,
    items: [
      { id: 'plus-vault', label: '… is a sturdy vault from the time of the Makers.' },
      { id: 'plus-room', label: '… has plenty of room to grow.' },
      { id: 'plus-underground', label: '… is hidden underground.' },
      { id: 'plus-sealed', label: '… has but one entrance, magically sealed.' },
      { id: 'plus-magics', label: '… bears minor magics to preserve its contents.' },
      { id: 'plus-warded', label: '… is warded against spirits and magic.' },
      { id: 'plus-quarters', label: '… includes your living quarters & office.' },
    ],
  },
  {
    label: 'But alas, it… (choose 2)',
    max: 2,
    items: [
      { id: 'alas-outskirts', label: '… sits on the outskirts, near the Old Wall.' },
      { id: 'alas-cramped', label: '… is cramped, chaotic, and overflowing.' },
      { id: 'alas-cellar', label: '… is little more than a crude cellar.' },
      { id: 'alas-haunted', label: '… seems to be haunted.' },
      { id: 'alas-artifacts', label: '… contains a few dangerous artifacts.' },
    ],
  },
];

export const JudgeChronicle = ({ data, onSave }: PlaybookSectionProps) => (
  <PlaybookChecklistSection
    title="The Chronicle"
    featureKey="judgeChronicle"
    intro="The Judge of Aratis is charged with maintaining the Chronicle, a history of the community, its people, their knowledge, and their traditions. The nature of the lore contained in the Chronicle depends on your Background, but it is more than a mere book; it is a physical place. Decide on its physical structure."
    groups={GROUPS}
    outro="Mark the location of the Chronicle on the Stonetop Playbook map."
    data={data}
    onSave={onSave}
  />
);
