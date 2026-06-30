import { useCallback, memo } from 'react';
import { List, Text } from '@/components/ui';
import type { ArcanaFollower } from '@/types';
import styles from './ArcanaFollowerBlock.module.css';

interface ArcanaFollowerBlockProps {
  arcanaId: string;
  follower: ArcanaFollower;
  followerHp?: number[];
  onFollowerHpChange: (index: number, value: number) => void;
}

export const ArcanaFollowerBlock = memo(({
  arcanaId,
  follower,
  followerHp,
  onFollowerHpChange,
}: ArcanaFollowerBlockProps) => {
  const isMultiHp = !!(follower.hpCount && follower.hpCount > 1);

  return (
    <div className={styles.follower}>
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
