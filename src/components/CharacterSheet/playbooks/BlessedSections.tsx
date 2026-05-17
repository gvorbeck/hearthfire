import { BlessedBackground } from './blessed/BlessedBackground';
import { BlessedInstinct } from './blessed/BlessedInstinct';
import { BlessedAppearance } from './blessed/BlessedAppearance';
import { BlessedPlaceOfOrigin } from './blessed/BlessedPlaceOfOrigin';
import { BlessedSacredPouch } from './blessed/BlessedSacredPouch';
import { BlessedSpecialPossessions } from './blessed/BlessedSpecialPossessions';
import { PlaybookSection } from '../PlaybookSection';
import styles from '../CharacterSheet.module.css';
import type { CharacterData } from '@/types';

export { BlessedBackground, BlessedInstinct, BlessedAppearance, BlessedPlaceOfOrigin };
export { BlessedSpecialPossessions };

interface BlessedSectionsProps {
  data: CharacterData | undefined;
  onSave: (data: Partial<CharacterData>) => Promise<void>;
}

export const BlessedSections = ({ data, onSave }: BlessedSectionsProps) => (
  <div className={styles.stack}>
    <BlessedSacredPouch data={data} onSave={onSave} />
    <PlaybookSection title="The Earth Mother">
      <p>Coming soon.</p>
    </PlaybookSection>
  </div>
);
