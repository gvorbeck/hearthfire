import { FoxTallTales } from './fox/FoxTallTales';
import styles from '../CharacterSheet.module.css';
import type { CharacterData } from '@/types';

interface FoxSectionsProps {
  data: CharacterData | undefined;
  onSave: (data: Partial<CharacterData>) => Promise<void>;
}

export const FoxSections = ({ data, onSave }: FoxSectionsProps) => (
  <div className={styles.stack}>
    <FoxTallTales data={data} onSave={onSave} />
  </div>
);
