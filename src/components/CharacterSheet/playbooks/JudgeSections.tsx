import { JudgeChronicle } from './judge/JudgeChronicle';
import { JudgeLawkeeper } from './judge/JudgeLawkeeper';
import styles from '../CharacterSheet.module.css';
import type { CharacterData } from '@/types';

interface JudgeSectionsProps {
  data: CharacterData | undefined;
  onSave: (data: Partial<CharacterData>) => Promise<void>;
}

export const JudgeSections = ({ data, onSave }: JudgeSectionsProps) => (
  <div className={styles.stack}>
    <JudgeChronicle data={data} onSave={onSave} />
    <JudgeLawkeeper data={data} onSave={onSave} />
  </div>
);
