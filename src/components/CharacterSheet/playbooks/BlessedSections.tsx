import { PlaybookSection } from '../PlaybookSection';
import styles from '../CharacterSheet.module.css';

export const BlessedSections = () => (
  <div className={styles.stack}>
    <PlaybookSection title="Sacred Pouch" />
    <PlaybookSection title="The Earth Mother" />
  </div>
);
