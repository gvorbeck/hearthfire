import { List, Icon, Tooltip, RepeaterField } from '@/components/primitives';
import { parseInlineMarkdown } from '@/lib/parseMarkdown';
import type { SteadingData } from '@/types';
import styles from './SteadingResources.module.css';

const FIXED_FORTIFICATIONS = [
  'Village militia',
  'The Ringwall (low, stone)',
  '3 watchtowers',
  'Spears & shields in every home',
  'Some bows',
];

const IMPROVEMENT_FORTIFICATIONS: { id: string; label: string; replaces?: string }[] = [
  { id: 'palisade', label: 'Palisade' },
  { id: 'standing-watch', label: 'Standing Watch' },
  { id: 'stone-wall', label: 'Stone Wall', replaces: 'palisade' },
  { id: 'weapons-of-war', label: 'Weapons of War' },
  { id: 'well-trained-militia', label: 'Well-Trained Militia' },
];

interface SteadingFortificationsProps {
  fortifications: string[] | undefined;
  improvements: Record<string, boolean> | undefined;
  onSave: (patch: Partial<SteadingData>) => Promise<void>;
}

export const SteadingFortifications = ({ fortifications = [], improvements = {}, onSave }: SteadingFortificationsProps) => {
  const improvementItems = IMPROVEMENT_FORTIFICATIONS.filter((imp) => {
    if (!improvements[imp.id]) return false;
    if (imp.id === 'palisade' && IMPROVEMENT_FORTIFICATIONS.some((a) => a.replaces === 'palisade' && improvements[a.id])) return false;
    return true;
  });

  const allFixed = [
    ...FIXED_FORTIFICATIONS.map((label) => ({ label, fromImprovement: false })),
    ...improvementItems.map(({ label }) => ({ label, fromImprovement: true })),
  ];

  const handleSave = (items: string[]) => onSave({ fortifications: items });

  return (
    <div className={styles.root}>
      <List
        variant="bullet"
        items={allFixed.map(({ label, fromImprovement }) => (
          <span key={label} className={styles.fixedItem}>
            {parseInlineMarkdown(label)}
            {fromImprovement && (
              <Tooltip text="Added by a completed improvement" side="top">
                <Icon name="info" size="small" className={styles.infoIcon} />
              </Tooltip>
            )}
          </span>
        ))}
      />
      <RepeaterField
        items={fortifications}
        onSave={handleSave}
        addLabel="Add fortification"
        itemLabel="Custom fortification"
      />
    </div>
  );
};
