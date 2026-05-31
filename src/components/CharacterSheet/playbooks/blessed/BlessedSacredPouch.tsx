import { useState, useEffect, useCallback, useRef } from 'react';
import { Divider, Radio, RadioGroup, Text, useToast } from '@/components/primitives';
import { PlaybookSection } from '../../PlaybookSection';
import { resolvePlaybookFeatures, featurePatch } from '@/lib/resolvePlaybookFeatures';
import { parseInlineMarkdown } from '@/lib/parseMarkdown';
import type { CharacterData } from '@/types';
import styles from './BlessedSacredPouch.module.css';

interface IsLine {
  key: string;
  label: string;
  options: string[];
}

const IS_LINES: IsLine[] = [
  { key: 'origin', label: 'Origin', options: ['an heirloom', 'made just for you', 'your own work'] },
  { key: 'material', label: 'Material', options: ['fur', 'drakescale', 'leather', 'woven', 'demonflesh'] },
  { key: 'decoration', label: 'Decoration', options: ['unadorned', 'beadwork', 'rich dyes', 'runes'] },
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
  const { addToast } = useToast();
  const [is, setIs] = useState<Record<string, string>>(() => resolvePlaybookFeatures(data).sacredPouchIs ?? {});
  const [trait, setTrait] = useState<string>(() => resolvePlaybookFeatures(data).sacredPouchTrait ?? '');
  const isRef = useRef(is);
  isRef.current = is;
  const traitRef = useRef(trait);
  traitRef.current = trait;

  useEffect(() => {
    const f = resolvePlaybookFeatures(data);
    if (f.sacredPouchIs !== undefined) setIs(f.sacredPouchIs);
    if (f.sacredPouchTrait !== undefined) setTrait(f.sacredPouchTrait);
  }, [data]);

  const handleIs = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const key = e.currentTarget.dataset.key!;
      const value = e.currentTarget.value;
      const prev = isRef.current;
      const next = { ...prev, [key]: value };
      setIs(next);
      onSave(featurePatch(data, { sacredPouchIs: next })).catch(() => { setIs(prev); addToast('Failed to save.'); });
    },
    [onSave, data, addToast]
  );

  const handleTrait = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.currentTarget.value;
      const prev = traitRef.current;
      setTrait(value);
      onSave(featurePatch(data, { sacredPouchTrait: value })).catch(() => { setTrait(prev); addToast('Failed to save.'); });
    },
    [onSave, data, addToast]
  );

  return (
    <PlaybookSection title="Sacred Pouch">
      <div className={styles.body}>
        <Text as="p" size="xs" color="muted" leading="normal">
          {parseInlineMarkdown("Your sacred pouch (*magical*) doesn't take up space in your inventory. It can hold up to 3 Stock (sacred herbs, powders, stones, pigments, chalks, clay, and so forth). Each time you gain an even-numbered level, your pouch can hold +1 Stock. When ***anyone but you looks inside your sacred pouch and touches the materials therein***, the Stock is ruined.")}
        </Text>
        <Text as="p" size="xs" color="muted" leading="normal">
          {parseInlineMarkdown('When you **have a few days of downtime in familiar terrain**, you may replenish your Stock.')}
        </Text>
        <Text as="p" size="xs" color="muted" leading="normal">
          {parseInlineMarkdown('When you **Forage**, you can produce Stock instead of provisions.')}
        </Text>

        <Divider />

        <Text as="p" size="xs" color="muted" className={styles.instruction}>Your sacred pouch is… (choose 1 on each line)</Text>
        <div className={styles.isLines}>
          {IS_LINES.map((line) => (
            <div key={line.key} className={styles.isRow}>
              <RadioGroup legend={line.label} legendHidden className={styles.optionRow}>
                {line.options.map((opt) => (
                  <Radio
                    key={opt}
                    name={`sacred-pouch-is-${line.key}`}
                    value={opt}
                    data-key={line.key}
                    checked={is[line.key] === opt}
                    onChange={handleIs}
                    label={<span className={styles.optionLabel}>{opt}</span>}
                  />
                ))}
              </RadioGroup>
            </div>
          ))}
        </div>

        <Divider />

        <Text as="p" size="xs" color="muted" className={styles.instruction}>What remarkable trait does it possess? (choose 1)</Text>
        <RadioGroup legend="Remarkable trait" legendHidden className={styles.traits}>
          {TRAITS.map((t) => (
            <Radio
              key={t}
              name="sacred-pouch-trait"
              value={t}
              checked={trait === t}
              onChange={handleTrait}
              label={<span className={styles.optionLabel}>{t}</span>}
            />
          ))}
        </RadioGroup>
      </div>
    </PlaybookSection>
  );
};
