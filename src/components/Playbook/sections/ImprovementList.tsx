import { List, Icon, Tooltip, RepeaterField } from '@/components/primitives';
import { parseInlineMarkdown } from '@/lib/parseMarkdown';
import styles from './SteadingResources.module.css';

interface ImprovementItem {
  id: string;
  label: string;
}

interface ImprovementListProps {
  fixedItems: string[];
  improvementItems: ImprovementItem[];
  extraItems?: string[];
  customItems: string[] | undefined;
  improvements: Record<string, boolean>;
  onSave: (items: string[]) => Promise<void>;
  addLabel: string;
  itemLabel: string;
}

export const ImprovementList = ({
  fixedItems,
  improvementItems,
  extraItems = [],
  customItems = [],
  improvements,
  onSave,
  addLabel,
  itemLabel,
}: ImprovementListProps) => {
  const allFixed = [
    ...fixedItems.map((label) => ({ label, fromImprovement: false })),
    ...improvementItems.filter((imp) => improvements[imp.id]).map(({ label }) => ({ label, fromImprovement: true })),
    ...extraItems.map((label) => ({ label, fromImprovement: true })),
  ];

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
        items={customItems}
        onSave={onSave}
        addLabel={addLabel}
        itemLabel={itemLabel}
      />
    </div>
  );
};
