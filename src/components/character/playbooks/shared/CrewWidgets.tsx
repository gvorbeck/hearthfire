import { memo, useCallback } from 'react';
import clsx from 'clsx';
import { Checkbox, Input, UseDots } from '@/components/ui';
import styles from './CrewWidgets.module.css';

interface StatBoxProps {
  label: React.ReactNode;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onBlur?: () => void;
  onWheel?: (e: React.WheelEvent<HTMLInputElement>) => void;
  inputType?: 'text' | 'number';
  inputProps?: React.InputHTMLAttributes<HTMLInputElement>;
  ariaLabel: string;
  /** Renders static text instead of an editable input */
  staticValue?: string;
  /** Compact 64×52 variant (used inside FollowerCard) */
  compact?: boolean;
  /** Applied to the outer wrapper div */
  className?: string;
  /** Rendered below the input, inside the label area (e.g. max-HP sub-input) */
  children?: React.ReactNode;
}

export const StatBox = memo(({
  label,
  value,
  onChange,
  onBlur,
  onWheel,
  inputType = 'number',
  inputProps,
  ariaLabel,
  staticValue,
  compact = false,
  className,
  children,
}: StatBoxProps) => {
  const inputCx = clsx(styles.statInput, compact && styles.statInputSm);

  return (
    <div className={clsx(styles.statBox, className)}>
      {staticValue !== undefined ? (
        <span className={styles.statStatic}>{staticValue}</span>
      ) : (
        <Input
          className={inputCx}
          type={inputType}
          value={value ?? ''}
          aria-label={ariaLabel}
          onChange={onChange}
          onBlur={onBlur}
          onWheel={onWheel}
          {...inputProps}
        />
      )}
      <span className={styles.statLabel}>
        {label}
        {children}
      </span>
    </div>
  );
});

interface LoyaltyRowProps {
  label?: React.ReactNode;
  value: number;
  onChange: (n: number) => void;
  className?: string;
}

export const LoyaltyRow = memo(({ label = 'Loyalty', value, onChange, className }: LoyaltyRowProps) => (
  <div className={clsx(styles.loyaltyRow, className)}>
    {label}
    <UseDots total={3} checked={value} onChange={onChange} ariaLabel="Loyalty" />
  </div>
));

export interface CustomItem {
  checked: boolean;
  text: string;
}

interface GearRowItemProps {
  itemIndex: number;
  weight: 1 | 2;
  checked: boolean;
  text: string;
  ariaLabel: string;
  ariaLabelInput: string;
  onCheckedChange: (index: number, checked: boolean) => void;
  onTextChange: (index: number, text: string) => void;
  onBlur: () => void;
}

const GearRowItem = memo(({
  itemIndex,
  weight,
  checked,
  text,
  ariaLabel,
  ariaLabelInput,
  onCheckedChange,
  onTextChange,
  onBlur,
}: GearRowItemProps) => {
  const handleChecked = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => onCheckedChange(itemIndex, e.target.checked),
    [itemIndex, onCheckedChange],
  );
  const handleText = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => onTextChange(itemIndex, e.target.value),
    [itemIndex, onTextChange],
  );
  return (
    <div className={styles.gearRow}>
      <Checkbox variant="provision" weight={weight} checked={checked} onChange={handleChecked} aria-label={ariaLabel} />
      <Input
        className={styles.gearInput}
        type="text"
        value={text}
        placeholder="Item…"
        aria-label={ariaLabelInput}
        onChange={handleText}
        onBlur={onBlur}
      />
    </div>
  );
});

interface CustomItemsGridProps {
  /** Items for the single-weight (◈) column */
  singleItems: CustomItem[];
  /** Items for the double-weight (◈◈) column */
  doubleItems: CustomItem[];
  /**
   * Index offset applied to double-column items when calling callbacks.
   * Defaults to singleItems.length so callbacks receive a flat-array index.
   */
  doubleOffset?: number;
  onCheckedChange: (index: number, checked: boolean) => void;
  onTextChange: (index: number, text: string) => void;
  onBlur: () => void;
  /** Prefix for aria-labels, e.g. "Custom inventory item" or "Follower 1 gear item" */
  ariaPrefix?: string;
}

export const CustomItemsGrid = memo(({
  singleItems,
  doubleItems,
  doubleOffset,
  onCheckedChange,
  onTextChange,
  onBlur,
  ariaPrefix = 'Item',
}: CustomItemsGridProps) => {
  const offset = doubleOffset ?? singleItems.length;
  return (
    <div className={styles.gearColumns}>
      <div className={styles.gearCol}>
        {singleItems.map((item, i) => (
          <GearRowItem
            key={`single-${ariaPrefix}-${i}`}
            itemIndex={i}
            weight={1}
            checked={item.checked}
            text={item.text}
            ariaLabel={`${ariaPrefix} ${i + 1} equipped`}
            ariaLabelInput={`${ariaPrefix} ${i + 1} name`}
            onCheckedChange={onCheckedChange}
            onTextChange={onTextChange}
            onBlur={onBlur}
          />
        ))}
      </div>
      <div className={styles.gearCol}>
        {doubleItems.map((item, i) => (
          <GearRowItem
            key={`double-${ariaPrefix}-${i}`}
            itemIndex={offset + i}
            weight={2}
            checked={item.checked}
            text={item.text}
            ariaLabel={`${ariaPrefix} double-weight ${i + 1} equipped`}
            ariaLabelInput={`${ariaPrefix} double-weight ${i + 1} name`}
            onCheckedChange={onCheckedChange}
            onTextChange={onTextChange}
            onBlur={onBlur}
          />
        ))}
      </div>
    </div>
  );
});
