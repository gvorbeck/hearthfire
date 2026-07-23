import { List, Icon, Tooltip, Text, Button } from '@/components/ui';
import { RepeaterField } from '@/components/fields';
import styles from './ImprovementList.module.css';

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
  // Starting items the GM has removed (e.g. a requisitioned horse died) and a callback to
  // remove another — undefined/omitted keeps a section read-only (no callers currently opt out).
  removedFixedItems?: string[];
  onRemoveFixed?: (label: string) => void;
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
  removedFixedItems = [],
  onRemoveFixed,
}: ImprovementListProps) => {
  const removedSet = new Set(removedFixedItems);

  // Improvement-derived items already have an undo path (unchecking the improvement), so only
  // the true starting items and GM-granted extras — which have no other removal path — get a
  // remove button.
  const removableFixed = fixedItems.filter((label) => !removedSet.has(label));
  const removableExtra = extraItems.filter((label) => !removedSet.has(label));

  const allFixed = [
    ...removableFixed.map((label) => ({ id: label, label, fromImprovement: false, removable: true })),
    ...improvementItems.filter((imp) => improvements[imp.id]).map(({ id, label }) => ({ id, label, fromImprovement: true, removable: false })),
    ...removableExtra.map((label) => ({ id: label, label, fromImprovement: true, removable: true })),
  ];

  const listItems = allFixed.map(({ id, label, fromImprovement, removable }) => (
    <span key={id} className={styles.fixedItem}>
      <Text as="span">{label}</Text>
      {fromImprovement && (
        <Tooltip text="Added by a completed improvement" side="top">
          <Icon name="info" size="small" className={styles.infoIcon} />
        </Tooltip>
      )}
      {removable && onRemoveFixed && (
        <Button
          variant="ghost"
          size="sm"
          icon="close"
          onClick={() => onRemoveFixed(label)}
          aria-label={`Remove ${label}`}
          className={styles.removeFixedBtn}
        />
      )}
    </span>
  ));

  return (
    <div className={styles.root}>
      <List variant="bullet" items={listItems} />
      <RepeaterField
        items={customItems}
        onSave={onSave}
        addLabel={addLabel}
        itemLabel={itemLabel}
        className={styles.customList}
      />
    </div>
  );
};
