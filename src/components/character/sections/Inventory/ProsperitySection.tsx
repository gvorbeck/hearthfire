import { memo } from 'react';
import clsx from 'clsx';
import { Text } from '@/components/ui';
import { PlaybookSection } from '../../PlaybookSection';
import { PROSPERITY_NOTES } from './inventoryData';
import styles from './ProsperitySection.module.css';

interface ProsperityOptionRowProps {
  val: -1 | 0 | 1 | 2;
  selected: boolean;
}

const ProsperityOptionRow = memo(({ val, selected }: ProsperityOptionRowProps) => {
  const cx = clsx(styles.prosperityOption, selected && styles.prosperitySelected);
  return (
    <div className={cx} aria-current={selected ? true : undefined}>
      <span className={styles.prosperityValue}>{val > 0 ? `+${val}` : val}</span>
      <Text as="span" font="serif" size="sm" color="muted" italic>{PROSPERITY_NOTES[val]}</Text>
    </div>
  );
});

interface ProsperitySectionProps {
  prosperity: number;
}

export const ProsperitySection = ({ prosperity }: ProsperitySectionProps) => (
  <PlaybookSection title="Prosperity">
    <Text font="serif" color="muted" leading="normal">
      Affects uses from Supplies, HP from Recover, and piercing on iron weapons. Set by the GM.
    </Text>
    <div className={styles.prosperityList}>
      {([-1, 0, 1, 2] as const).map((val) => (
        <ProsperityOptionRow key={val} val={val} selected={prosperity === val} />
      ))}
    </div>
  </PlaybookSection>
);
