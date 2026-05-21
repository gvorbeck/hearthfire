import { useCallback } from 'react';
import { Checkbox, CheckboxGroup } from '@/components/primitives';
import { PlaybookSection } from '../../PlaybookSection';
import { usePlaybookChecked } from '@/hooks/usePlaybookChecked';
import type { CharacterData } from '@/types';
import styles from '../playbookSection.module.css';
import localStyles from './FoxTallTales.module.css';

const LOCATION_ITEMS = [
  { id: 'tales-lost-great-wood', label: 'the Great Wood' },
  { id: 'tales-lost-flats', label: 'the Flats' },
  { id: 'tales-lost-steplands', label: 'the Steplands' },
  { id: 'tales-lost-ferriers-fen', label: "Ferrier's Fen" },
  { id: 'tales-lost-foothills', label: 'the Foothills' },
  { id: 'tales-lost-huffel-peaks', label: 'the Huffel Peaks' },
];

const TALE_ITEMS = [
  { id: 'tales-lost', label: '… got lost in (choose 1):' },
  { id: 'tales-crinwin', label: '… were on watch when the crinwin raided' },
  { id: 'tales-ruined-tower', label: '… dared each other to explore the Ruined Tower' },
  { id: 'tales-hillfolk', label: '… managed to rile up a small band of Hillfolk' },
  { id: 'tales-labyrinth', label: '… braved the Labyrinth, just a little' },
  { id: 'tales-book', label: "… stole that crazy old man's book" },
  { id: 'tales-barrow', label: '… went poking about the old Barrow Mounds' },
];

const OUTCOME_ITEMS = [
  { id: 'outcome-running', label: '… running for your life from ___' },
  { id: 'outcome-blow', label: '… landing a well-placed blow' },
  { id: 'outcome-gathering', label: '… interrupting a strange, creepy gathering' },
  { id: 'outcome-beast', label: "… stumbling on a beast, bigger'n anything" },
  { id: 'outcome-treasure', label: '… with a sack full of treasure' },
  { id: 'outcome-hire', label: '… getting ___ to fight them for you' },
  { id: 'outcome-ghost', label: '… face to face with a ghost/Fae/demon' },
  { id: 'outcome-runes', label: '… finding those strange old runes' },
  { id: 'outcome-fellow', label: '… getting to know that fine-looking fellow/lady/person/couple' },
];

const LEFTOVER_ITEMS = [
  { id: 'left-story', label: '… a story no one believes.' },
  { id: 'left-scar', label: '… a nasty scar; wanna see?' },
  { id: 'left-nightmare', label: '… the occasional nightmare.' },
  { id: 'left-map', label: '… this map with runes no one can read.' },
  { id: 'left-key', label: '… this key that opens who-knows-what.' },
];

interface FoxTallTalesProps {
  data: CharacterData | undefined;
  onSave: (data: Partial<CharacterData>) => Promise<void>;
}

export const FoxTallTales = ({ data, onSave }: FoxTallTalesProps) => {
  const { checked, handleChange } = usePlaybookChecked(data, onSave, 'foxTallTales');

  const lostChecked = checked['tales-lost'] ?? false;
  const taleItemsWithoutLost = TALE_ITEMS.filter((item) => item.id !== 'tales-lost');

  const handleLostChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => handleChange('tales-lost', e.target.checked),
    [handleChange],
  );

  return (
    <PlaybookSection title="Tall Tales">
      <p className={styles.prose}>
        Someone like you gets into all sorts of trouble, whether you mean to or not. Mix and match
        the following to come up with a couple of your more memorable adventures, and write them
        down in the space at the bottom of this column.
      </p>
      <div className={localStyles.taleGroup}>
        <p className={localStyles.groupLabel}>There was that time that you… (choose 1 per tale)</p>
        <div className={localStyles.list}>
          <div className={localStyles.lostRow}>
            <Checkbox
              checked={lostChecked}
              onChange={handleLostChange}
              label="… got lost in (choose 1):"
            />
            <div className={localStyles.locationSub}>
              <CheckboxGroup
                items={LOCATION_ITEMS}
                checked={checked}
                onChange={handleChange}
                max={1}
                disabled={!lostChecked}
              />
            </div>
          </div>
          <CheckboxGroup
            items={taleItemsWithoutLost}
            checked={checked}
            onChange={handleChange}
          />
        </div>
      </div>
      <hr className={styles.divider} />
      <CheckboxGroup
        label="And you ended up… (choose 1 or 2 per tale)"
        items={OUTCOME_ITEMS}
        checked={checked}
        onChange={handleChange}
      />
      <hr className={styles.divider} />
      <CheckboxGroup
        label="But all you've got left to show for it is…"
        items={LEFTOVER_ITEMS}
        checked={checked}
        onChange={handleChange}
      />
    </PlaybookSection>
  );
};
