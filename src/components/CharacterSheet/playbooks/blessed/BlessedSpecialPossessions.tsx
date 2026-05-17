import { useState, useEffect, useCallback } from 'react';
import clsx from 'clsx';
import { Checkbox, Text } from '@/components/primitives';
import { PlaybookSection } from '../../PlaybookSection';
import type { CharacterData } from '@/types';
import styles from './BlessedSpecialPossessions.module.css';

interface Possession {
  id: string;
  name: string;
  label: React.ReactNode;
}

const POSSESSIONS: Possession[] = [
  {
    id: 'apiary',
    name: 'Apiary',
    label: (
      <>
        <strong>Apiary</strong>: beeswax, candles (<em>close</em>, <em>area</em>, lasts ~1 hr),
        honey, ◇ bee smokers, ◇ hat &amp; veils, etc.
      </>
    ),
  },
  {
    id: 'collected-offerings',
    name: 'Collected offerings',
    label: (
      <>
        <strong>Collected offerings</strong> (○○○ uses): Expend a use to produce something
        valuable to a spirit of the wild. Restore 1 use each season.
      </>
    ),
  },
  {
    id: 'goat-herd',
    name: 'Goat herd',
    label: (
      <>
        <strong>Goat herd</strong>: milk, cheese, pelts, meat, blood, horn, wool, etc. Each season,
        1 in 4 chance of having a bezoar (swallow it to cure poison).
      </>
    ),
  },
  {
    id: 'herb-garden',
    name: 'Herb garden',
    label: (
      <>
        <strong>Herb garden</strong>: shears, mortars &amp; pestles, herbs, seeds, remedies, mild
        poisons, ◇ spades, etc. Each spring, d4 uses of bendis root (<em>reach</em>, <em>area</em>,
        burns ~1 hr, fumes repel perversions of nature).
      </>
    ),
  },
  {
    id: 'mastiffs',
    name: 'Mastiffs',
    label: (
      <>
        <strong>Mastiffs</strong>, 2–3 followers (<em>alert</em>, <em>keen-nosed</em>,{' '}
        <em>fierce</em>, <em>overprotective</em>); HP 6; Damage d6 (<em>hand</em>, <em>grabby</em>
        ); Instinct: to bark &amp; threaten; Cost: affection.
      </>
    ),
  },
  {
    id: 'custom',
    name: 'Custom (discuss with GM)',
    label: <span className={styles.customLine}>(discuss with GM)</span>,
  },
];

const PICK_COUNT = 2;

const stockCapacity = (level: number) => 3 + Math.floor(level / 2);

interface BlessedSpecialPossessionsProps {
  data: CharacterData | undefined;
  onSave: (data: Partial<CharacterData>) => Promise<void>;
  sacredPouchStock?: number;
  onStockChange?: (stock: number) => void;
  level: number;
}

export const BlessedSpecialPossessions = ({
  data,
  onSave,
  sacredPouchStock = 0,
  onStockChange,
  level,
}: BlessedSpecialPossessionsProps) => {
  const [selected, setSelected] = useState<Record<string, boolean>>(
    () => data?.specialPossessions ?? {}
  );

  useEffect(() => {
    setSelected(data?.specialPossessions ?? {});
  }, [data?.specialPossessions]);

  const selectedCount = Object.values(selected).filter(Boolean).length;
  const atMax = selectedCount >= PICK_COUNT;

  const handleChange = useCallback(
    (id: string, checked: boolean) => {
      const prev = selected;
      const next = { ...selected, [id]: checked };
      setSelected(next);
      onSave({ specialPossessions: next }).catch(() => setSelected(prev));
    },
    [selected, onSave]
  );

  const capacity = stockCapacity(level);
  const sacredPouchRowCx = clsx(styles.row, styles.rowFixed);

  return (
    <PlaybookSection title="Special Possessions" choose={PICK_COUNT} chooseNote="in addition to your sacred pouch">
      <div className={styles.list}>
        <div className={sacredPouchRowCx}>
          <Checkbox
            aria-label="Sacred pouch"
            checked
            disabled
            className={styles.checkbox}
            label={
              <div className={styles.labelBody}>
                <Text as="span" size="sm">
                  <strong>Sacred pouch</strong> (<em>magical</em>): see Sacred Pouch section.
                </Text>
                <div className={styles.stockRow}>
                  <Text as="span" size="sm" className={styles.stockLabel}>Stock:</Text>
                  {Array.from({ length: capacity }, (_, i) => {
                    const filled = i < sacredPouchStock;
                    const dotCx = clsx(styles.stockDot, filled && styles.stockDotFilled);
                    return (
                      <button
                        key={i}
                        type="button"
                        className={dotCx}
                        aria-label={filled ? `Clear stock ${i + 1}` : `Mark stock ${i + 1}`}
                        onClick={() => onStockChange?.(filled ? i : i + 1)}
                      />
                    );
                  })}
                </div>
              </div>
            }
          />
        </div>

        {POSSESSIONS.map((p) => {
          const checked = selected[p.id] ?? false;
          return (
            <div key={p.id} className={styles.row}>
              <Checkbox
                aria-label={p.name}
                checked={checked}
                disabled={!checked && atMax}
                onChange={(e) => handleChange(p.id, e.target.checked)}
                className={styles.checkbox}
                label={
                  <Text as="span" size="sm" className={styles.labelBody}>
                    {p.label}
                  </Text>
                }
              />
            </div>
          );
        })}
      </div>
    </PlaybookSection>
  );
};
