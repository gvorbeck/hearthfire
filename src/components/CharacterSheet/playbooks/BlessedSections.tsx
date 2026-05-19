import { BlessedSacredPouch } from './blessed/BlessedSacredPouch';
import { BlessedEarthMother } from './blessed/BlessedEarthMother';
import styles from '../CharacterSheet.module.css';
import type { CharacterData } from '@/types';

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
