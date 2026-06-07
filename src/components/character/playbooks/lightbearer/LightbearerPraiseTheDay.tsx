import { CheckboxGroup, Divider, Text } from '@/components/ui';
import { PlaybookSection } from '../../PlaybookSection';
import { usePlaybookChecked } from '@/hooks/usePlaybookChecked';
import type { PlaybookSectionProps } from '@/types';

const WORSHIP_ITEMS = [
  { id: 'worship-ancient', label: '… ancient, widespread, and well-known' },
  { id: 'worship-lygos', label: '… most common in Lygos and the south' },
  { id: 'worship-new', label: '… a new thing, still unheard of by many' },
  { id: 'worship-old', label: '… an old thing, forgotten by most' },
  { id: 'worship-persecuted', label: '… widely persecuted' },
];

const WORSHIPPED_ITEMS = [
  { id: 'how-hymns', label: '… solemn hymns' },
  { id: 'how-meditation', label: '… serene meditation' },
  { id: 'how-song', label: '… joyful song' },
  { id: 'how-denial', label: '… ascetic denial' },
  { id: 'how-dancing', label: '… fervent dancing' },
  { id: 'how-ceremonies', label: '… formal ceremonies' },
  { id: 'how-drugs', label: '… drugs & intoxicants' },
  { id: 'how-pain', label: '… pain & sacrifice' },
];

const SHRINE_ITEMS = [
  { id: 'shrine-honor', label: '… the place of highest honor, even if Tor is more popular' },
  { id: 'shrine-tended', label: '… been well-tended and given due respect' },
  { id: 'shrine-restored', label: '… recently been restored/established, perhaps by you' },
  { id: 'shrine-better-days', label: '… seen better days, for certain' },
];

const PREDECESSOR_ITEMS = [
  { id: 'pred-legend', label: '… lived long ago, a figure of legend' },
  { id: 'pred-martyred', label: '… was martyred for their faith' },
  { id: 'pred-sorcerer', label: '… died facing a mighty sorcerer or demon' },
  { id: 'pred-beauty', label: '… wrote many works of sublime beauty' },
  { id: 'pred-below', label: '… faced one of the Things Below' },
  { id: 'pred-peacefully', label: '… died in their bed, peacefully' },
  { id: 'pred-ascended', label: '… ascended bodily into the heavens' },
  { id: 'pred-reincarnated', label: '… was reincarnated—as you' },
];

const POWERS_ITEMS = [
  { id: 'powers-study', label: '… through years of study and devotion' },
  { id: 'powers-passed', label: '… when your predecessor passed them on' },
  { id: 'powers-suddenly', label: '… suddenly, at a moment of great need' },
  { id: 'powers-visitation', label: '… after a visitation from Helior or one of his servants' },
  { id: 'powers-first-laid', label: '… when you first laid eyes upon the ___' },
];

type LightbearerPraiseTheDayProps = PlaybookSectionProps;

export const LightbearerPraiseTheDay = ({ data, onSave }: LightbearerPraiseTheDayProps) => {
  const { checked, handleChange } = usePlaybookChecked(data, onSave, 'lightbearerPraiseTheDay');

  return (
    <PlaybookSection title="Praise the Day">
      <Text font="serif" color="muted" leading="normal">
        You are the appointed servant of Helior the Daybringer, god of the sun and light, beacon
        of hope and mercy.
      </Text>
      <CheckboxGroup
        label="The worship of Helior is… (choose 1)"
        items={WORSHIP_ITEMS}
        checked={checked}
        onChange={handleChange}
        max={1}
      />
      <Divider />
      <CheckboxGroup
        label="He is worshipped through… (choose 1 or 2)"
        items={WORSHIPPED_ITEMS}
        checked={checked}
        onChange={handleChange}
        max={2}
      />
      <Divider />
      <CheckboxGroup
        label="In Stonetop's Pavilion of the Gods, Helior's shrine has… (choose 1)"
        items={SHRINE_ITEMS}
        checked={checked}
        onChange={handleChange}
        max={1}
      />
      <Divider />
      <CheckboxGroup
        label="Your predecessor, the previous Lightbearer… (choose 2 or 3)"
        items={PREDECESSOR_ITEMS}
        checked={checked}
        onChange={handleChange}
        max={3}
      />
      <Divider />
      <CheckboxGroup
        label="You came into your powers… (choose 1)"
        items={POWERS_ITEMS}
        checked={checked}
        onChange={handleChange}
        max={1}
      />
    </PlaybookSection>
  );
};
