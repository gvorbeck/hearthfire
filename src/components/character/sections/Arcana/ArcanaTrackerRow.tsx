import { Text } from '@/components/ui';
import { UseDots } from '@/components/ui/UseDots/UseDots';
import styles from './ArcanaTrackerRow.module.css';

interface ArcanaTrackerRowProps {
  label: string;
  total: number;
  checked: number;
  onChange: (value: number) => void;
  disabled?: boolean;
}

// The labelled dot tracker shared by every arcana move (base moves, mystery moves, the minor-card
// reveal). Label on the left, UseDots on the right.
export const ArcanaTrackerRow = ({
  label,
  total,
  checked,
  onChange,
  disabled,
}: ArcanaTrackerRowProps) => (
  <div className={styles.tracker}>
    <Text
      as="span"
      font="serif"
      size="xs"
      color="muted"
      className={styles.trackerLabel}
    >
      {label}
    </Text>
    <UseDots total={total} checked={checked} onChange={onChange} disabled={disabled} ariaLabel={label} />
  </div>
);
