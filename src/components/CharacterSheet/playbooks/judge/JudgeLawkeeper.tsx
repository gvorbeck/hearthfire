import { useState, useEffect, useCallback } from 'react';
import { CheckboxGroup } from '@/components/primitives';
import { PlaybookSection } from '../../PlaybookSection';
import { resolvePlaybookFeatures, featurePatch } from '@/lib/resolvePlaybookFeatures';
import type { CharacterData } from '@/types';
import styles from '../playbookSection.module.css';

const SHRINE_ITEMS = [
  { id: 'shrine-hub', label: '… a hub of the community, a place of frequent rites, petitions, and celebrations' },
  { id: 'shrine-holidays', label: '… used only on high holidays, for each home keeps its own shrine above the hearth' },
  { id: 'shrine-neglected', label: '… neglected by most, tended only by you and a handful of believers' },
  { id: 'shrine-grim', label: '… a grim place of judgement and punishment, shunned by all but her chosen' },
  { id: 'shrine-new', label: '… newly established, cramped and spare' },
];

const DEMANDS_ITEMS = [
  { id: 'demands-truth', label: '… truth, honesty, and forthrightness' },
  { id: 'demands-hospitality', label: '… hospitality, freely given to all who ask for it' },
  { id: 'demands-punishment', label: '… the punishment of thieves & oathbreakers' },
  { id: 'demands-diet', label: '… adherence to strict rules of diet and dress' },
  { id: 'demands-authority', label: '… respect for authority, property, and rank' },
];

interface JudgeLawkeeperProps {
  data: CharacterData | undefined;
  onSave: (data: Partial<CharacterData>) => Promise<void>;
}

export const JudgeLawkeeper = ({ data, onSave }: JudgeLawkeeperProps) => {
  const features = resolvePlaybookFeatures(data);
  const [checked, setChecked] = useState<Record<string, boolean>>(
    () => features.judgeLawkeeper ?? {}
  );

  useEffect(() => {
    const f = resolvePlaybookFeatures(data);
    if (f.judgeLawkeeper !== undefined) setChecked(f.judgeLawkeeper);
  }, [data]);

  const handleChange = useCallback((id: string, value: boolean) => {
    const prev = checked;
    const next = { ...checked, [id]: value };
    setChecked(next);
    onSave(featurePatch(data, { judgeLawkeeper: next })).catch(() => setChecked(prev));
  }, [checked, onSave, data]);

  return (
    <PlaybookSection title="The Lawkeeper">
      <p className={styles.prose}>
        Her Judges say that Aratis has been with humanity since they first stacked one stone upon
        another and called it home.
      </p>
      <CheckboxGroup
        label="In Stonetop's Pavillion of the Gods, Aratis's shrine is… (pick 1)"
        items={SHRINE_ITEMS}
        checked={checked}
        onChange={handleChange}
        max={1}
      />
      <hr className={styles.divider} />
      <CheckboxGroup
        label="Of her true disciples, Aratis demands… (choose 3)"
        items={DEMANDS_ITEMS}
        checked={checked}
        onChange={handleChange}
        max={3}
      />
    </PlaybookSection>
  );
};
