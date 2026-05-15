import { BlessedBackground } from './blessed/BlessedBackground';
import { BlessedInstinct } from './blessed/BlessedInstinct';
import { PlaybookSection } from '../PlaybookSection';
import styles from '../CharacterSheet.module.css';

export { BlessedBackground, BlessedInstinct };

export const BlessedSections = () => (
  <div className={styles.stack}>
    <PlaybookSection title="Sacred Pouch" />
    <PlaybookSection title="The Earth Mother" />
  </div>
);
