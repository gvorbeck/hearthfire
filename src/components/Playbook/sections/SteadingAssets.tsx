import { useCallback } from 'react';
import { Text, Heading } from '@/components/primitives';
import { parseInlineMarkdown } from '@/lib/parseMarkdown';
import { TextareaField } from '@/components/Playbook';
import type { SteadingData } from '@/types';
import styles from './SteadingAssets.module.css';

const FIXED_ASSETS = [
  'A pair of hardy draft horses, followers (large, powerful, keen-nosed, hardy): HP 10 each; Damage d6+3 (hand, close, forceful); Instinct: to panic; Cost: care & grooming.',
  'A pair of horse-drawn plows, iron',
  'A pair of carts (plus horse harness)',
  'A wagon (plus horse harness)',
];

interface SteadingAssetsProps {
  assets: string | undefined;
  onSave: (patch: Partial<SteadingData>) => Promise<void>;
}

export const SteadingAssets = ({ assets, onSave }: SteadingAssetsProps) => {
  const handleSave = useCallback((value: string) => onSave({ assets: value }), [onSave]);

  return (
    <div className={styles.root}>
      <Text size="sm" color="muted">Owned by the residents of Stonetop in common. To take them on an expedition or otherwise put them at risk, you must Requisition.</Text>

      <div className={styles.fixedList}>
        <Heading as="h3" size="label">Starting assets</Heading>
        <ul className={styles.list} aria-label="Starting communal assets">
          {FIXED_ASSETS.map((a) => (
            <li key={a} className={styles.listItem}>
              <span className={styles.dash}>—</span>
              <Text size="sm">{parseInlineMarkdown(a)}</Text>
            </li>
          ))}
        </ul>
      </div>

      <TextareaField
        label="Additional assets & coins"
        note="(Record assets gained in play; note silver/gold coins here)"
        value={assets ?? ''}
        onSave={handleSave}
        rows={5}
      />
    </div>
  );
};
