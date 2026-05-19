import { LightbearerPraiseTheDay } from './lightbearer/LightbearerPraiseTheDay';
import styles from '../CharacterSheet.module.css';
import type { CharacterData } from '@/types';

interface LightbearerSectionsProps {
  data: CharacterData | undefined;
  onSave: (data: Partial<CharacterData>) => Promise<void>;
}

export const LightbearerSections = ({ data, onSave }: LightbearerSectionsProps) => (
  <div className={styles.stack}>
    <LightbearerPraiseTheDay data={data} onSave={onSave} />
  </div>
);
