import { useCallback, memo } from 'react';
import { Checkbox, Divider, Stack, Text } from '@/components/ui';
import { RepeaterField } from '@/components/fields';
import { PlaybookSection } from '../../PlaybookSection';
import { SMALL_ITEMS, UNDEFINED_SMALL_COUNT, type SmallItem } from './inventoryData';
import { UndefinedProvisions } from './UndefinedProvisions';
import shared from './inventoryItem.module.css';
import styles from './SmallInventorySection.module.css';

interface SmallItemRowProps {
  item: SmallItem;
  checked: boolean;
  onCheckedChange: (id: string, checked: boolean) => void;
}

const SmallItemRow = memo(({ item, checked, onCheckedChange }: SmallItemRowProps) => {
  const handleChecked = useCallback((e: React.ChangeEvent<HTMLInputElement>) => onCheckedChange(item.id, e.target.checked), [item.id, onCheckedChange]);
  return (
    <div className={styles.smallItemRow}>
      <Checkbox
        checked={checked}
        onChange={handleChecked}
        label={<Text as="span" className={shared.itemLabel}>{item.label}</Text>}
      />
    </div>
  );
});

interface SmallInventorySectionProps {
  smallChecked: Record<string, boolean>;
  undefinedSmall: number;
  smallCustom: { checked: boolean; text: string }[];
  onSmallChecked: (id: string, checked: boolean) => void;
  onUndefinedChange: (n: number) => void;
  onSaveSmallCustom: (items: { checked: boolean; text: string }[]) => Promise<void>;
}

export const SmallInventorySection = ({
  smallChecked,
  undefinedSmall,
  smallCustom,
  onSmallChecked,
  onUndefinedChange,
  onSaveSmallCustom,
}: SmallInventorySectionProps) => (
  <PlaybookSection title="Small items">
    <Text font="serif" color="muted" leading="normal">Fit in a pocket, pouch, or boot.</Text>
    <Text font="serif" color="muted" leading="normal">
      When you **Outfit**, mark □ below equal to 4+Prosperity.
    </Text>

    <Divider />

    <Stack gap={2}>
      <Stack direction="row" gap={3} align="center">
        <Text as="span" font="serif" size="sm" weight="semibold">Undefined</Text>
        <UndefinedProvisions total={UNDEFINED_SMALL_COUNT} checked={undefinedSmall} onChange={onUndefinedChange} />
      </Stack>
      <Text font="serif" color="muted" leading="normal">
        When you **Have What You Need**, move ◈ from here to items below, or expend supplies to mark an additional □.
      </Text>
    </Stack>

    <Divider />

    <Stack gap={1}>
      {SMALL_ITEMS.map((item) => (
        <SmallItemRow
          key={item.id}
          item={item}
          checked={smallChecked[item.id] ?? false}
          onCheckedChange={onSmallChecked}
        />
      ))}
      <RepeaterField
        variant="checked"
        items={smallCustom}
        onSave={onSaveSmallCustom}
        addLabel="Add small item"
        itemLabel="Small item"
      />
    </Stack>
  </PlaybookSection>
);
