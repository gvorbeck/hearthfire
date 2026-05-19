import { WouldBeHeroFearAnger } from './would-be-hero/WouldBeHeroFearAnger';
import styles from '../CharacterSheet.module.css';
import type { CharacterData } from '@/types';

interface WouldBeHeroSectionsProps {
  data: CharacterData | undefined;
  onSave: (data: Partial<CharacterData>) => Promise<void>;
}

export const WouldBeHeroSections = ({ data, onSave }: WouldBeHeroSectionsProps) => (
  <div className={styles.stack}>
    <WouldBeHeroFearAnger data={data} onSave={onSave} />
  </div>
);
