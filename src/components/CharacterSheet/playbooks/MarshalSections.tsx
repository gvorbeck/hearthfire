import { MarshalWarStories } from './marshal/MarshalWarStories';
import styles from '../CharacterSheet.module.css';
import type { CharacterData } from '@/types';

interface MarshalSectionsProps {
  data: CharacterData | undefined;
  onSave: (data: Partial<CharacterData>) => Promise<void>;
}

export const MarshalSections = ({ data, onSave }: MarshalSectionsProps) => (
  <div className={styles.stack}>
    <MarshalWarStories data={data} onSave={onSave} />
  </div>
);
