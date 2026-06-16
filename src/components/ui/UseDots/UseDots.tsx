import clsx from 'clsx';
import { Text } from '../Text/Text';
import styles from './UseDots.module.css';

interface UseDotsProps {
  total: number;
  checked: number;
  onChange: (n: number) => void;
  disabled?: boolean;
  label?: string;
}

export const UseDots = ({ total, checked, onChange, disabled, label }: UseDotsProps) => {
  const dots = Array.from({ length: total }, (_, i) => {
    const filled = i < checked;
    const dotCx = clsx(styles.useDot, filled && styles.useDotFilled);
    return (
      <button
        key={`dot-${total}-${i}`}
        type="button"
        className={dotCx}
        aria-label={filled ? `Clear use ${i + 1}` : `Mark use ${i + 1}`}
        onClick={() => onChange(filled ? i : i + 1)}
        disabled={disabled}
      />
    );
  });
  return (
    <div role="group" className={styles.useDots} aria-label={label ?? `Uses: ${checked} of ${total}`}>
      {dots}
      {label && <Text as="span" font="serif" size="xs" italic color="muted" className={styles.useDotsLabel} aria-hidden="true">{label}</Text>}
    </div>
  );
};
