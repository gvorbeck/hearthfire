import { BasicMoves } from './BasicMoves';
import { TypeMoves } from './TypeMoves';
import type { CharacterData, PlaybookType } from '@/types';
import styles from '../CharacterSheet.module.css';

interface MovesProps {
  playbook: PlaybookType;
  data: CharacterData | undefined;
  onSave: (data: Partial<CharacterData>) => Promise<void>;
  choose?: number;
}

export const Moves = ({ playbook, data, onSave, choose }: MovesProps) => (
  <div className={styles.stack}>
    <BasicMoves />
    <TypeMoves playbook={playbook} data={data} onSave={onSave} choose={choose} />
  </div>
);
