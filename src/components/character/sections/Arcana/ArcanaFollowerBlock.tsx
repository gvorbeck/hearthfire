import { useCallback, memo } from 'react';
import clsx from 'clsx';
import { List, Text } from '@/components/ui';
import type { ArcanaFollower } from '@/types';
import { ArcanaTrackerRow } from './ArcanaTrackerRow';
import styles from './ArcanaFollowerBlock.module.css';

interface ArcanaFollowerBlockProps {
  arcanaId: string;
  follower: ArcanaFollower;
  followerHp?: number[];
  onFollowerHpChange: (index: number, value: number) => void;
  // A Loyalty-tracked follower (follower.loyalty set) renders an interactive dot tracker; its value and
  // setter come from the same trackerValues path moves use. Absent for HP-tracked followers.
  loyaltyValue?: number;
  onLoyaltyChange?: (value: number) => void;
  // A follower gained only once a consequence is marked renders inactive until then: dimmed, its tracker
  // disabled, with `activationNote` explaining what unlocks it.
  inactive?: boolean;
  activationNote?: string;
}

export const ArcanaFollowerBlock = memo(({
  arcanaId,
  follower,
  followerHp,
  onFollowerHpChange,
  loyaltyValue,
  onLoyaltyChange,
  inactive = false,
  activationNote,
}: ArcanaFollowerBlockProps) => {
  const isMultiHp = !!(follower.hpCount && follower.hpCount > 1);
  const cx = clsx(styles.follower, inactive && styles.followerInactive);

  return (
    <div className={cx} aria-disabled={inactive || undefined}>
      <div className={styles.followerHeader}>
        <Text font="serif" weight="bold">
          {follower.name}
        </Text>
        {follower.tags && (
          <Text as="span" font="serif" size="xs" italic color="muted">
            {follower.tags}
          </Text>
        )}
      </div>
      <div className={styles.followerStats}>
        <div className={styles.followerHpRow}>
          {follower.hp !== undefined &&
            Array.from({ length: follower.hpCount ?? 1 }).map((_, i) => (
              <HpInput
                key={`hp-${arcanaId}-${i}`}
                index={i}
                followerName={follower.name}
                isMultiHp={isMultiHp}
                value={followerHp?.[i] ?? follower.hp!}
                max={follower.hp!}
                onFollowerHpChange={onFollowerHpChange}
              />
            ))}
          {follower.armor !== undefined && (
            <span className={styles.followerStat}>
              <Text as="span" font="serif" size="xs" color="muted">Armor</Text>
              <Text as="span" font="serif" size="xs">{follower.armor}</Text>
            </span>
          )}
          {follower.damage && (
            <span className={styles.followerStat}>
              <Text as="span" font="serif" size="xs" color="muted">Damage</Text>
              <Text as="span" font="serif" size="xs">{follower.damage}</Text>
            </span>
          )}
        </div>
        {follower.loyalty !== undefined && onLoyaltyChange && (
          <ArcanaTrackerRow
            label="Loyalty"
            total={follower.loyalty}
            checked={loyaltyValue ?? 0}
            onChange={onLoyaltyChange}
            disabled={inactive}
          />
        )}
        <div className={styles.followerInstinct}>
          <Text as="span" font="serif" size="xs" color="muted">Instinct: </Text>
          <Text as="span" font="serif" size="xs" italic>{follower.instinct}</Text>
        </div>
        {follower.qualities && (
          <List
            variant="bullet"
            items={follower.qualities.map((q, i) => (
              <Text key={`quality-${arcanaId}-${i}`} as="span" font="serif" size="xs">{q}</Text>
            ))}
          />
        )}
        {follower.cost && (
          <div className={styles.followerCost}>
            <Text as="span" font="serif" size="xs" color="muted">Cost: </Text>
            <Text as="span" font="serif" size="xs">{follower.cost}</Text>
          </div>
        )}
      </div>
      {inactive && activationNote && (
        <Text as="span" font="serif" size="xs" italic color="muted" className={styles.followerActivation}>
          {activationNote}
        </Text>
      )}
    </div>
  );
});

interface HpInputProps {
  index: number;
  followerName: string;
  isMultiHp: boolean;
  value: number;
  max: number;
  onFollowerHpChange: (index: number, value: number) => void;
}

const HpInput = memo(({ index, followerName, isMultiHp, value, max, onFollowerHpChange }: HpInputProps) => {
  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const val = parseInt(e.target.value, 10);
      if (!isNaN(val)) onFollowerHpChange(index, val);
    },
    [index, onFollowerHpChange],
  );
  return (
    <label className={styles.followerHpLabel}>
      <Text as="span" font="serif" size="xs" color="muted">
        {isMultiHp ? `HP ${index + 1}` : 'HP'}
      </Text>
      <input
        type="number"
        className={styles.followerHpInput}
        value={value}
        min={0}
        max={max}
        onChange={handleChange}
        aria-label={isMultiHp ? `${followerName} ${index + 1} HP` : `${followerName} HP`}
      />
      <Text as="span" font="serif" size="xs" color="muted">/{max}</Text>
    </label>
  );
});
