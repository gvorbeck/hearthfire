import { SeekerCollection } from './seeker/SeekerCollection';
import styles from '../CharacterSheet.module.css';
import type { CharacterData } from '@/types';

interface SeekerSectionsProps {
  data: CharacterData | undefined;
  onSave: (data: Partial<CharacterData>) => Promise<void>;
}

export const SeekerSections = ({ data, onSave }: SeekerSectionsProps) => (
  <div className={styles.stack}>
    <SeekerCollection data={data} onSave={onSave} />
  </div>
);
