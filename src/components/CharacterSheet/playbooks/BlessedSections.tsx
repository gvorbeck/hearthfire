import { BlessedSacredPouch } from './blessed/BlessedSacredPouch';
import { BlessedEarthMother } from './blessed/BlessedEarthMother';
import { BlessedIntroductions } from './blessed/BlessedIntroductions';
import styles from '../CharacterSheet.module.css';
import type { CharacterData } from '@/types';

export { BlessedIntroductions };

interface BlessedSectionsProps {
  data: CharacterData | undefined;
  onSave: (data: Partial<CharacterData>) => Promise<void>;
}

export const BlessedSections = ({ data, onSave }: BlessedSectionsProps) => (
  <div className={styles.stack}>
    <BlessedSacredPouch data={data} onSave={onSave} />
    <BlessedEarthMother data={data} onSave={onSave} />
  </div>
);
