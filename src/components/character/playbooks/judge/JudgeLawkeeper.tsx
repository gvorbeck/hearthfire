import { PlaybookChecklistSection } from '../shared/PlaybookChecklistSection';
import type { ChecklistGroup } from '../shared/PlaybookChecklistSection';
import type { PlaybookSectionProps } from '@/types';

const GROUPS: ChecklistGroup[] = [
  {
    label: "In Stonetop's Pavillion of the Gods, Aratis's shrine is… (pick 1)",
    max: 1,
    items: [
      { id: 'shrine-hub', label: '… a hub of the community, a place of frequent rites, petitions, and celebrations' },
      { id: 'shrine-holidays', label: '… used only on high holidays, for each home keeps its own shrine above the hearth' },
      { id: 'shrine-neglected', label: '… neglected by most, tended only by you and a handful of believers' },
      { id: 'shrine-grim', label: '… a grim place of judgement and punishment, shunned by all but her chosen' },
      { id: 'shrine-new', label: '… newly established, cramped and spare' },
    ],
  },
  {
    label: 'Of her true disciples, Aratis demands… (choose 3)',
    max: 3,
    items: [
      { id: 'demands-truth', label: '… truth, honesty, and forthrightness' },
      { id: 'demands-hospitality', label: '… hospitality, freely given to all who ask for it' },
      { id: 'demands-punishment', label: '… the punishment of thieves & oathbreakers' },
      { id: 'demands-diet', label: '… adherence to strict rules of diet and dress' },
      { id: 'demands-authority', label: '… respect for authority, property, and rank' },
    ],
  },
];

export const JudgeLawkeeper = ({ data, onSave }: PlaybookSectionProps) => (
  <PlaybookChecklistSection
    title="The Lawkeeper"
    featureKey="judgeLawkeeper"
    intro="Her Judges say that Aratis has been with humanity since they first stacked one stone upon another and called it home."
    groups={GROUPS}
    data={data}
    onSave={onSave}
  />
);
