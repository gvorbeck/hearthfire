import { PlaybookSection } from '../PlaybookSection';
import { Move } from '../Move';
import { BASIC_MOVES } from '@/lib/basicMoves';
import styles from './Moves.module.css';

export const BasicMoves = () => (
  <PlaybookSection title="Basic Moves">
    <div className={styles.moveGrid}>
      {BASIC_MOVES.map((move) => (
        <Move key={move.id} move={move} />
      ))}
    </div>
  </PlaybookSection>
);
