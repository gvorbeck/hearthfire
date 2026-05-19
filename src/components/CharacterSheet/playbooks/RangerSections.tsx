import { RangerSomethingWicked } from './ranger/RangerSomethingWicked';
import styles from '../CharacterSheet.module.css';
import type { CharacterData } from '@/types';

interface RangerSectionsProps {
  data: CharacterData | undefined;
  onSave: (data: Partial<CharacterData>) => Promise<void>;
}

export const RangerSections = ({ data, onSave }: RangerSectionsProps) => (
  <div className={styles.stack}>
    <RangerSomethingWicked data={data} onSave={onSave} />
  </div>
);
