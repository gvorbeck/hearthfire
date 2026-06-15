import { PlaybookChecklistSection } from '../shared/PlaybookChecklistSection';
import type { ChecklistGroup } from '../shared/PlaybookChecklistSection';
import type { PlaybookSectionProps } from '@/types';

const GROUPS: ChecklistGroup[] = [
  {
    label: 'The worship of Helior is… (choose 1)',
    max: 1,
    items: [
      { id: 'worship-ancient', label: '… ancient, widespread, and well-known' },
      { id: 'worship-lygos', label: '… most common in Lygos and the south' },
      { id: 'worship-new', label: '… a new thing, still unheard of by many' },
      { id: 'worship-old', label: '… an old thing, forgotten by most' },
      { id: 'worship-persecuted', label: '… widely persecuted' },
    ],
  },
  {
    label: 'He is worshipped through… (choose 1 or 2)',
    max: 2,
    items: [
      { id: 'how-hymns', label: '… solemn hymns' },
      { id: 'how-meditation', label: '… serene meditation' },
      { id: 'how-song', label: '… joyful song' },
      { id: 'how-denial', label: '… ascetic denial' },
      { id: 'how-dancing', label: '… fervent dancing' },
      { id: 'how-ceremonies', label: '… formal ceremonies' },
      { id: 'how-drugs', label: '… drugs & intoxicants' },
      { id: 'how-pain', label: '… pain & sacrifice' },
    ],
  },
  {
    label: "In Stonetop's Pavilion of the Gods, Helior's shrine has… (choose 1)",
    max: 1,
    items: [
      { id: 'shrine-honor', label: '… the place of highest honor, even if Tor is more popular' },
      { id: 'shrine-tended', label: '… been well-tended and given due respect' },
      { id: 'shrine-restored', label: '… recently been restored/established, perhaps by you' },
      { id: 'shrine-better-days', label: '… seen better days, for certain' },
    ],
  },
  {
    label: 'Your predecessor, the previous Lightbearer… (choose 2 or 3)',
    max: 3,
    items: [
      { id: 'pred-legend', label: '… lived long ago, a figure of legend' },
      { id: 'pred-martyred', label: '… was martyred for their faith' },
      { id: 'pred-sorcerer', label: '… died facing a mighty sorcerer or demon' },
      { id: 'pred-beauty', label: '… wrote many works of sublime beauty' },
      { id: 'pred-below', label: '… faced one of the Things Below' },
      { id: 'pred-peacefully', label: '… died in their bed, peacefully' },
      { id: 'pred-ascended', label: '… ascended bodily into the heavens' },
      { id: 'pred-reincarnated', label: '… was reincarnated—as you' },
    ],
  },
  {
    label: 'You came into your powers… (choose 1)',
    max: 1,
    items: [
      { id: 'powers-study', label: '… through years of study and devotion' },
      { id: 'powers-passed', label: '… when your predecessor passed them on' },
      { id: 'powers-suddenly', label: '… suddenly, at a moment of great need' },
      { id: 'powers-visitation', label: '… after a visitation from Helior or one of his servants' },
      { id: 'powers-first-laid', label: '… when you first laid eyes upon the ___' },
    ],
  },
];

export const LightbearerPraiseTheDay = ({ data, onSave }: PlaybookSectionProps) => (
  <PlaybookChecklistSection
    title="Praise the Day"
    featureKey="lightbearerPraiseTheDay"
    intro="You are the appointed servant of Helior the Daybringer, god of the sun and light, beacon of hope and mercy."
    groups={GROUPS}
    data={data}
    onSave={onSave}
  />
);
