import { useState, useEffect, useCallback } from 'react';
import { CheckboxGroup, Radio } from '@/components/primitives';
import { PlaybookSection } from '../../PlaybookSection';
import type { CharacterData } from '@/types';
import styles from './BlessedEarthMother.module.css';

const SHRINE_OPTIONS = [
  '... loved, well-used, dripping with offerings and petitions.',
  '... little more than a token of respect, for her holy places are anywhere but here.',
  '... given wide berth by most, and approached only with care and propitiation.',
  '... neglected and all but forgotten, except by a few.',
];

const OFFERING_OPTIONS = [
  'fruits of harvest',
  'whisky/spirits',
  'pure rain water',
  'blood/burnt flesh',
  'figurines/effigies',
  'salt/crystals',
  'metal nails/tools',
  'incense/sage bark',
];

interface BlessedEarthMotherProps {
  data: CharacterData | undefined;
  onSave: (data: Partial<CharacterData>) => Promise<void>;
}

const OFFERING_ITEMS = OFFERING_OPTIONS.map((opt) => ({ id: opt, label: opt }));

export const BlessedEarthMother = ({ data, onSave }: BlessedEarthMotherProps) => {
  const [shrine, setShrine] = useState<string>(data?.earthMotherShrine ?? '');
  const [offerings, setOfferings] = useState<Record<string, boolean>>(data?.earthMotherOfferings ?? {});

  useEffect(() => {
    if (data?.earthMotherShrine !== undefined) setShrine(data.earthMotherShrine);
    if (data?.earthMotherOfferings !== undefined) setOfferings(data.earthMotherOfferings);
  }, [data?.earthMotherShrine, data?.earthMotherOfferings]);

  const handleShrine = useCallback(
    (value: string) => {
      const prev = shrine;
      setShrine(value);
      onSave({ earthMotherShrine: value }).catch(() => setShrine(prev));
    },
    [shrine, onSave]
  );

  const handleOffering = useCallback(
    (id: string, checked: boolean) => {
      const prev = offerings;
      const next = { ...offerings, [id]: checked };
      setOfferings(next);
      onSave({ earthMotherOfferings: next }).catch(() => setOfferings(prev));
    },
    [offerings, onSave]
  );

  return (
    <PlaybookSection title="The Earth Mother">
      <div className={styles.body}>
        <p className={styles.prose}>
          Danu has long been revered by all peoples, though not always worshipped or served by
          priests. In Stonetop&apos;s Pavilion of the Gods, Danu&apos;s shrine is…
        </p>
        <p className={styles.instruction}>(choose 1)</p>
        <div className={styles.shrineOptions}>
          {SHRINE_OPTIONS.map((opt) => (
            <Radio
              key={opt}
              name="earth-mother-shrine"
              value={opt}
              checked={shrine === opt}
              onChange={() => handleShrine(opt)}
              label={<span className={styles.optionLabel}>{opt}</span>}
            />
          ))}
        </div>

        <hr className={styles.divider} />

        <CheckboxGroup
          label="What do the folk of Stonetop leave as offerings?"
          pickNote="(choose 2–3)"
          items={OFFERING_ITEMS}
          checked={offerings}
          onChange={handleOffering}
          max={3}
          columns={2}
        />
      </div>
    </PlaybookSection>
  );
};
