import { BlessedBackground } from './blessed/BlessedBackground';
import { BlessedInstinct } from './blessed/BlessedInstinct';
import { BlessedAppearance } from './blessed/BlessedAppearance';
import { PlaybookSection } from '../PlaybookSection';
import styles from '../CharacterSheet.module.css';

export { BlessedBackground, BlessedInstinct, BlessedAppearance };

export const BlessedSections = () => (
  <div className={styles.stack}>
    <PlaybookSection title="Sacred Pouch" />
    <PlaybookSection title="The Earth Mother" />
  </div>
);
