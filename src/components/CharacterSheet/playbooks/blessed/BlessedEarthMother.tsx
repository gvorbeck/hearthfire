import { useState, useEffect, useCallback, useRef } from 'react';
import { CheckboxGroup, Divider, Radio, Text, useToast } from '@/components/primitives';
import { PlaybookSection } from '../../PlaybookSection';
import { resolvePlaybookFeatures, featurePatch } from '@/lib/resolvePlaybookFeatures';
import type { CharacterData } from '@/types';
import styles from './BlessedEarthMother.module.css';

const SHRINE_OPTIONS = [
  '... loved, well-used, dripping with offerings and petitions.',
  '... little more than a token of respect, for her holy places are anywhere but here.',
  '... given wide berth by most, and approached only with care and propitiation.',
  '... neglected and all but forgotten, except by a few.',
];

const OFFERING_ITEMS = [
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

export const BlessedEarthMother = ({ data, onSave }: BlessedEarthMotherProps) => {
  const { addToast } = useToast();
  const [shrine, setShrine] = useState<string>(() => resolvePlaybookFeatures(data).earthMotherShrine ?? '');
  const [offerings, setOfferings] = useState<Record<string, boolean>>(() => resolvePlaybookFeatures(data).earthMotherOfferings ?? {});
  const shrineRef = useRef(shrine);
  shrineRef.current = shrine;
  const offeringsRef = useRef(offerings);
  offeringsRef.current = offerings;

  useEffect(() => {
    const f = resolvePlaybookFeatures(data);
    if (f.earthMotherShrine !== undefined) setShrine(f.earthMotherShrine);
    if (f.earthMotherOfferings !== undefined) setOfferings(f.earthMotherOfferings);
  }, [data]);

  const handleShrine = useCallback(
    (value: string) => {
      const prev = shrineRef.current;
      setShrine(value);
      onSave(featurePatch(data, { earthMotherShrine: value })).catch(() => { setShrine(prev); addToast('Failed to save.'); });
    },
    [onSave, data, addToast]
  );

  const handleOffering = useCallback(
    (id: string, checked: boolean) => {
      const prev = offeringsRef.current;
      const next = { ...prev, [id]: checked };
      setOfferings(next);
      onSave(featurePatch(data, { earthMotherOfferings: next })).catch(() => { setOfferings(prev); addToast('Failed to save.'); });
    },
    [onSave, data, addToast]
  );

  return (
    <PlaybookSection title="The Earth Mother">
      <div className={styles.body}>
        <Text as="p" size="xs" color="muted" leading="normal">
          {"Danu has long been revered by all peoples, though not always worshipped or served by priests. In Stonetop’s Pavilion of the Gods, Danu’s shrine is…"}
        </Text>
        <Text as="p" size="xs" color="muted" className={styles.instruction}>(choose 1)</Text>
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

        <Divider />

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
