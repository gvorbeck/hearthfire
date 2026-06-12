import clsx from 'clsx';
import { Heading, List, Text, Checkbox } from '@/components/ui';
import { IMPROVEMENTS, type CheckItem } from './steadingImprovementsData';
import card from './improvementCard.module.css';
import styles from './PredefinedImprovementsList.module.css';

const makeReqKeys = (impId: string, blockIdx: number, itemIdx: number, count: number) =>
  Array.from({ length: count }, (_, i) => `${impId}__req__b${blockIdx}i${itemIdx}__${i}`);

const ReqCheckItem = ({
  item, keys, checkedValues, onToggle,
}: {
  item: CheckItem;
  keys: string[];
  checkedValues: boolean[];
  onToggle: (key: string) => void;
}) => {
  if (keys.length === 1) {
    return (
      <div className={styles.checkRow}>
        <Checkbox
          checked={checkedValues[0]}
          onChange={() => onToggle(keys[0])}
          label={item.label}
        />
      </div>
    );
  }

  return (
    <div className={styles.checkRow}>
      <div className={styles.multiBoxes}>
        {keys.map((key, i) => (
          <Checkbox
            key={key}
            aria-label={item.label}
            checked={checkedValues[i]}
            onChange={() => onToggle(key)}
          />
        ))}
      </div>
      <Text as="span" className={styles.checkRowLabel}>{item.label}</Text>
    </div>
  );
};

interface PredefinedImprovementsListProps {
  improvements: Record<string, boolean>;
  onToggleKey: (key: string) => void;
}

export const PredefinedImprovementsList = ({ improvements, onToggleKey }: PredefinedImprovementsListProps) => (
  <div className={styles.list}>
    {IMPROVEMENTS.map((imp) => {
      const completed = !!improvements[imp.id];
      const itemCx = clsx(card.item, completed && card.itemCompleted);
      return (
        <div key={imp.id} className={itemCx}>
          <div className={card.itemHeader}>
            <Checkbox
              checked={completed}
              onChange={() => onToggleKey(imp.id)}
              label={<Text as="span" font="serif" size="sm" weight="bold">{imp.title}</Text>}
              className={card.itemCheckbox}
            />
          </div>
          <Text font="serif" color="muted" italic leading="tight">{imp.summary}</Text>

          <div className={card.section}>
            <Heading as="h4" size="label">Requirements</Heading>
            <div className={styles.requirementBlocks}>
              {imp.requirements.map((block, blockIdx) => {
                if (block.type === 'text') {
                  return <Text key={`${imp.id}-req-${blockIdx}`} size="xs" color="muted">{block.content}</Text>;
                }
                return (
                  <div key={`${imp.id}-cb-${blockIdx}`} className={styles.checkList}>
                    {block.items.map((item, itemIdx) => {
                      const keys = makeReqKeys(imp.id, blockIdx, itemIdx, item.count ?? 1);
                      const checkedValues = keys.map((k) => !!improvements[k]);
                      return (
                      <ReqCheckItem
                        key={`${imp.id}-b${blockIdx}i${itemIdx}`}
                        item={item}
                        keys={keys}
                        checkedValues={checkedValues}
                        onToggle={onToggleKey}
                      />
                      );
                    })}
                  </div>
                );
              })}
            </div>
          </div>

          <div className={card.section}>
            <Heading as="h4" size="label">When you meet the requirements</Heading>
            {imp.benefits.map((line, i) => (
              <Text key={`${imp.id}-benefit-${i}`} font="serif" color="muted" leading="tight">{line}</Text>
            ))}
            {imp.list && (
              <List variant="bullet" items={imp.list} keyPrefix={`${imp.id}-list`} />
            )}
          </div>
        </div>
      );
    })}
  </div>
);
