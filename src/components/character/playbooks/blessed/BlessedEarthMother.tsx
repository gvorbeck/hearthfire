import { useCallback } from 'react';
import { useOptimisticField } from '@/hooks/useOptimisticField';
import { CheckboxGroup, Divider, Radio, RadioGroup, Text } from '@/components/ui';
import { PlaybookSection } from '@/components/playbook/PlaybookSection';
import { resolvePlaybookFeatures, featurePatch } from '@/lib/resolvePlaybookFeatures';
import type { PlaybookSectionProps } from '@/types';
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

type BlessedEarthMotherProps = PlaybookSectionProps;

export const BlessedEarthMother = ({ data, onSave }: BlessedEarthMotherProps) => {
  const features = resolvePlaybookFeatures(data);

  const { value: shrine, save: saveShrine } = useOptimisticField(
    features.earthMotherShrine ?? '',
    (next) => onSave(featurePatch(data, { earthMotherShrine: next })),
    'Failed to save.',
  );
  const { value: offerings, ref: offeringsRef, save: saveOfferings } = useOptimisticField(
    features.earthMotherOfferings ?? {},
    (next) => onSave(featurePatch(data, { earthMotherOfferings: next })),
    'Failed to save.',
  );

  const handleOffering = useCallback((id: string, checked: boolean) => {
    saveOfferings({ ...offeringsRef.current, [id]: checked });
  }, [saveOfferings]);

  return (
    <PlaybookSection title="The Earth Mother">
      <div className={styles.body}>
        <Text size="xs" color="muted" leading="normal">
          {"Danu has long been revered by all peoples, though not always worshipped or served by priests. In Stonetop's Pavilion of the Gods, Danu's shrine is…"}
        </Text>
        <Text size="xs" color="muted" className={styles.instruction}>(choose 1)</Text>
        <RadioGroup legend="The shrine is…" legendHidden className={styles.shrineOptions}>
          {SHRINE_OPTIONS.map((opt) => (
            <Radio
              key={opt}
              name="earth-mother-shrine"
              value={opt}
              checked={shrine === opt}
              onChange={() => saveShrine(opt)}
              label={opt}
            />
          ))}
        </RadioGroup>

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
