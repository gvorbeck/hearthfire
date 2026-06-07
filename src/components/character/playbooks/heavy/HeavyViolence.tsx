import { CheckboxGroup, Divider, Text } from '@/components/ui';
import { PlaybookSection } from '../../PlaybookSection';
import { usePlaybookChecked } from '@/hooks/usePlaybookChecked';
import type { PlaybookSectionProps } from '@/types';

const DEEDS_ITEMS = [
  { id: 'deeds-drake', label: '… drove off a thunder drake that got too close to town.' },
  { id: 'deeds-hagr', label: '… killed that hagr in the Foothills.' },
  { id: 'deeds-crinwin', label: '… slew a dozen crinwin in one battle.' },
  { id: 'deeds-adventurers', label: '… tossed those adventurers out of town.' },
  { id: 'deeds-ivan', label: "… bested Ivan, the scariest bandit in Brennan's gang, the Claws." },
  { id: 'deeds-dragged', label: '… dragged yourself (and another?) into town, bleeding from a dozen wounds.' },
  { id: 'deeds-lightning', label: '… were struck by lightning and woke up covered in these marks.' },
];

const LESS_KEEN_ITEMS = [
  { id: 'less-look', label: '… the look in your eye when you spilled all that blood.' },
  { id: 'less-hard-cases', label: '… those hard cases who showed up looking for you.' },
  { id: 'less-shouting', label: '… the shouting matches between you and your love.' },
  { id: 'less-claws', label: "… the time you spent as one of Brennan's Claws." },
  { id: 'less-urbgen', label: '… what happened to Urbgen, even if he did have it coming.' },
  { id: 'less-seizures', label: '… your uncontrollable seizures, where you claw those weird marks in the dirt.' },
];

const NIGHT_ITEMS = [
  { id: 'night-temper', label: 'That thrice-damned temper of yours.' },
  { id: 'night-coming', label: "The worry that someone's coming after you." },
  { id: 'night-crinwin', label: 'The feeling that the crinwin are getting bolder.' },
  { id: 'night-brennan', label: "Wondering what Brennan's up to, now that he's the marshal of Marshedge." },
  { id: 'night-visions', label: 'Dark visions of things moving in the earth, restless, whispering, and hungry.' },
  { id: 'night-family', label: 'The question of who\'ll look after your family when you get yourself killed.' },
  { id: 'night-truth', label: 'The worry that they\'ll all learn the truth about you, sooner or later.' },
];

type HeavyViolenceProps = PlaybookSectionProps;

export const HeavyViolence = ({ data, onSave }: HeavyViolenceProps) => {
  const { checked, handleChange } = usePlaybookChecked(data, onSave, 'heavyViolence');

  return (
    <PlaybookSection title="A History of Violence">
      <Text font="serif" color="muted" leading="normal">
        Just about everyone here talks about the time you… (pick 1 or 2)
      </Text>
      <CheckboxGroup
        items={DEEDS_ITEMS}
        checked={checked}
        onChange={handleChange}
        max={2}
      />
      <Divider />
      <CheckboxGroup
        label="But folks are less keen to discuss… (pick 1 or 2)"
        items={LESS_KEEN_ITEMS}
        checked={checked}
        onChange={handleChange}
        max={2}
      />
      <Divider />
      <CheckboxGroup
        label="What keeps you up at night? (pick 1 or 2)"
        items={NIGHT_ITEMS}
        checked={checked}
        onChange={handleChange}
        max={2}
      />
    </PlaybookSection>
  );
};
