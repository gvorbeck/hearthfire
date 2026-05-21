import { CheckboxGroup } from '@/components/primitives';
import { PlaybookSection } from '../../PlaybookSection';
import { usePlaybookChecked } from '@/hooks/usePlaybookChecked';
import type { CharacterData } from '@/types';
import styles from '../playbookSection.module.css';

const PLUS_ITEMS = [
  { id: 'plus-vault', label: '… is a sturdy vault from the time of the Makers.' },
  { id: 'plus-room', label: '… has plenty of room to grow.' },
  { id: 'plus-underground', label: '… is hidden underground.' },
  { id: 'plus-sealed', label: '… has but one entrance, magically sealed.' },
  { id: 'plus-magics', label: '… bears minor magics to preserve its contents.' },
  { id: 'plus-warded', label: '… is warded against spirits and magic.' },
  { id: 'plus-quarters', label: '… includes your living quarters & office.' },
];

const ALAS_ITEMS = [
  { id: 'alas-outskirts', label: '… sits on the outskirts, near the Old Wall.' },
  { id: 'alas-cramped', label: '… is cramped, chaotic, and overflowing.' },
  { id: 'alas-cellar', label: '… is little more than a crude cellar.' },
  { id: 'alas-haunted', label: '… seems to be haunted.' },
  { id: 'alas-artifacts', label: '… contains a few dangerous artifacts.' },
];

interface JudgeChronicleProps {
  data: CharacterData | undefined;
  onSave: (data: Partial<CharacterData>) => Promise<void>;
}

export const JudgeChronicle = ({ data, onSave }: JudgeChronicleProps) => {
  const { checked, handleChange } = usePlaybookChecked(data, onSave, 'judgeChronicle');

  return (
    <PlaybookSection title="The Chronicle">
      <p className={styles.prose}>
        The Judge of Aratis is charged with maintaining the Chronicle, a history of the community,
        its people, their knowledge, and their traditions. The nature of the lore contained in the
        Chronicle depends on your Background, but it is more than a mere book; it is a physical
        place. Decide on its physical structure.
      </p>
      <CheckboxGroup
        label="On the plus side, it… (choose 3)"
        items={PLUS_ITEMS}
        checked={checked}
        onChange={handleChange}
        max={3}
      />
      <hr className={styles.divider} />
      <CheckboxGroup
        label="But alas, it… (choose 2)"
        items={ALAS_ITEMS}
        checked={checked}
        onChange={handleChange}
        max={2}
      />
      <p className={styles.prose}>
        Mark the location of the Chronicle on the Stonetop Playbook map.
      </p>
    </PlaybookSection>
  );
};
