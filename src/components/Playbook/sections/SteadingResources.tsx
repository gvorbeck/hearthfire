import { List, Icon, Tooltip, RepeaterField } from '@/components/primitives';
import { parseInlineMarkdown } from '@/lib/parseMarkdown';
import type { SteadingData } from '@/types';
import styles from './SteadingResources.module.css';

const FIXED_RESOURCES = [
  'Farming (beans, potatoes, oats, barley)',
  'Hunting/trapping (fur, meat, hides)',
  'Distilling (whisky)',
  'Stone (collected from the Old Wall)',
  'Cistern (filled with rain, snow)',
  'Tradesfolk (midwife, potter, publican, smith, tanner)',
  "Trade: Gordin's Delve (metal, tools)",
  'Trade: Marshedge (textiles, herbs, glass)',
];

const IMPROVEMENT_RESOURCES: { id: string; label: string }[] = [
  { id: 'aurochs-hunting', label: 'Aurochs hunting (meat, hide, horn)' },
  { id: 'harnessing-the-stream', label: 'Harnessing the Stream' },
  { id: 'inn', label: 'The Inn' },
  { id: 'mill', label: 'Mill' },
  { id: 'raincatching', label: 'Raincatching' },
];

interface SteadingResourcesProps {
  resources: string[] | undefined;
  improvements: Record<string, boolean> | undefined;
  onSave: (patch: Partial<SteadingData>) => Promise<void>;
}

export const SteadingResources = ({ resources = [], improvements = {}, onSave }: SteadingResourcesProps) => {
  const improvementItems = IMPROVEMENT_RESOURCES.filter((imp) => improvements[imp.id]);

  const allFixed = [
    ...FIXED_RESOURCES.map((label) => ({ label, fromImprovement: false })),
    ...improvementItems.map(({ label }) => ({ label, fromImprovement: true })),
  ];

  const handleSave = (items: string[]) => onSave({ resources: items });

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
        items={resources}
        onSave={handleSave}
        addLabel="Add resource"
        itemLabel="Custom resource"
      />
    </div>
  );
};
