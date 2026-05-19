import { HeavyViolence } from './heavy/HeavyViolence';
import styles from '../CharacterSheet.module.css';
import type { CharacterData } from '@/types';

interface HeavySectionsProps {
  data: CharacterData | undefined;
  onSave: (data: Partial<CharacterData>) => Promise<void>;
}

export const HeavySections = ({ data, onSave }: HeavySectionsProps) => (
  <div className={styles.stack}>
    <HeavyViolence data={data} onSave={onSave} />
  </div>
);
