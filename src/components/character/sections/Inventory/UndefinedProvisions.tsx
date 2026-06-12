import { useCallback, memo } from 'react';
import { Checkbox } from '@/components/ui';
import styles from './UndefinedProvisions.module.css';

interface UndefinedProvisionsProps {
  total: number;
  checked: number;
  onChange: (n: number) => void;
}

export const UndefinedProvisions = memo(({ total, checked, onChange }: UndefinedProvisionsProps) => (
  <span className={styles.undefinedBoxes} role="group" aria-label={`Undefined: ${checked} of ${total}`}>
    {Array.from({ length: total }, (_, i) => (
      <UndefinedProvisionBox
        key={`undefined-${total}-${i}`}
        index={i}
        checked={checked}
        onChange={onChange}
      />
    ))}
  </span>
));

interface UndefinedProvisionBoxProps {
  index: number;
  checked: number;
  onChange: (n: number) => void;
}

const UndefinedProvisionBox = memo(({ index, checked, onChange }: UndefinedProvisionBoxProps) => {
  const isFilled = index < checked;
  const handleChange = useCallback(() => onChange(isFilled ? index : index + 1), [index, isFilled, onChange]);
  return (
    <Checkbox
      variant="provision"
      checked={isFilled}
      onChange={handleChange}
      aria-label={isFilled ? `Clear undefined item ${index + 1}` : `Mark undefined item ${index + 1}`}
    />
  );
});
