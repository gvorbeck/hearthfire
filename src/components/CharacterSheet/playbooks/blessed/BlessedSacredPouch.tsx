import { useState, useEffect, useCallback } from 'react';
import { Divider, Radio, Text } from '@/components/primitives';
import { PlaybookSection } from '../../PlaybookSection';
import { resolvePlaybookFeatures, featurePatch } from '@/lib/resolvePlaybookFeatures';
import { parseInlineMarkdown } from '@/lib/parseMarkdown';
import type { CharacterData } from '@/types';
import styles from './BlessedSacredPouch.module.css';

interface IsLine {
  key: string;
  options: string[];
}

const IS_LINES: IsLine[] = [
  { key: 'origin', options: ['an heirloom', 'made just for you', 'your own work'] },
  { key: 'material', options: ['fur', 'drakescale', 'leather', 'woven', 'demonflesh'] },
  { key: 'decoration', options: ['unadorned', 'beadwork', 'rich dyes', 'runes'] },
];

const TRAITS: string[] = [
  'It cannot be cut, torn, or burned by any natural means.',
  'Unless someone is specifically searching for your pouch, they will ignore its presence.',
  'So long as the pouch is sealed, nothing within can be detected or found by magic, nor can anything within escape or affect the outside world.',
  'Unnatural and unclean creatures cannot bear to touch it.',
];

interface BlessedSacredPouchProps {
  data: CharacterData | undefined;
  onSave: (data: Partial<CharacterData>) => Promise<void>;
}

export const BlessedSacredPouch = ({ data, onSave }: BlessedSacredPouchProps) => {
  const features = resolvePlaybookFeatures(data);
  const [is, setIs] = useState<Record<string, string>>(features.sacredPouchIs ?? {});
  const [trait, setTrait] = useState<string>(features.sacredPouchTrait ?? '');

  useEffect(() => {
    const f = resolvePlaybookFeatures(data);
    if (f.sacredPouchIs !== undefined) setIs(f.sacredPouchIs);
    if (f.sacredPouchTrait !== undefined) setTrait(f.sacredPouchTrait);
  }, [data]);

  const handleIs = useCallback(
    (key: string, value: string) => {
      const prev = is;
      const next = { ...is, [key]: value };
      setIs(next);
      onSave(featurePatch(data, { sacredPouchIs: next })).catch(() => setIs(prev));
    },
    [is, onSave, data]
  );

  const handleTrait = useCallback(
    (value: string) => {
      const prev = trait;
      setTrait(value);
      onSave(featurePatch(data, { sacredPouchTrait: value })).catch(() => setTrait(prev));
    },
    [trait, onSave, data]
  );

  return (
    <PlaybookSection title="Sacred Pouch">
      <div className={styles.body}>
        <Text as="p" size="sm" color="muted" className={styles.prose}>
          {parseInlineMarkdown("Your sacred pouch (*magical*) doesn't take up space in your inventory. It can hold up to 3 Stock (sacred herbs, powders, stones, pigments, chalks, clay, and so forth). Each time you gain an even-numbered level, your pouch can hold +1 Stock. When ***anyone but you looks inside your sacred pouch and touches the materials therein***, the Stock is ruined.")}
        </Text>
        <Text as="p" size="sm" color="muted" className={styles.prose}>
          {parseInlineMarkdown('When you **have a few days of downtime in familiar terrain**, you may replenish your Stock.')}
        </Text>
        <Text as="p" size="sm" color="muted" className={styles.prose}>
          {parseInlineMarkdown('When you **Forage**, you can produce Stock instead of provisions.')}
        </Text>

        <Divider />

        <Text as="p" size="sm" color="muted" className={styles.instruction}>Your sacred pouch is… (choose 1 on each line)</Text>
        <div className={styles.isLines}>
          {IS_LINES.map((line) => (
            <div key={line.key} className={styles.optionRow}>
              {line.options.map((opt) => (
                <Radio
                  key={opt}
                  name={`sacred-pouch-is-${line.key}`}
                  value={opt}
                  checked={is[line.key] === opt}
                  onChange={() => handleIs(line.key, opt)}
                  label={<span className={styles.optionLabel}>{opt}</span>}
                />
              ))}
            </div>
          ))}
        </div>

        <Divider />

        <Text as="p" size="sm" color="muted" className={styles.instruction}>What remarkable trait does it possess? (choose 1)</Text>
        <div className={styles.traits}>
          {TRAITS.map((t) => (
            <Radio
              key={t}
              name="sacred-pouch-trait"
              value={t}
              checked={trait === t}
              onChange={() => handleTrait(t)}
              label={<span className={styles.optionLabel}>{t}</span>}
            />
          ))}
        </div>
      </div>
    </PlaybookSection>
  );
};
