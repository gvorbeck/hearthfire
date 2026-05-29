import { useCallback } from 'react';
import clsx from 'clsx';
import { Button, Checkbox, Icon, Text } from '@/components/primitives';
import { UseDots } from '@/components/primitives/UseDots/UseDots';
import { parseInlineMarkdown, parseMarkdown } from '@/lib/parseMarkdown';
import type { MinorArcanum } from '@/lib/arcanaMinor';
import styles from './MinorArcanaCard.module.css';

interface MinorArcanaCardProps {
  arcanum: MinorArcanum;
  requirementsChecked: Record<string, boolean>;
  trackerValue?: number;
  followerHp?: number[];
  carried?: boolean;
  weight?: 1 | 2;
  onToggleRequirement: (key: string, checked: boolean) => void;
  onTrackerChange: (value: number) => void;
  onFollowerHpChange: (index: number, value: number) => void;
  onCarriedChange: (carried: boolean) => void;
  onWeightChange: (weight: 1 | 2 | undefined) => void;
  onRemove: () => void;
}

export const MinorArcanaCard = ({
  arcanum,
  requirementsChecked,
  trackerValue,
  followerHp,
  carried,
  weight,
  onToggleRequirement,
  onTrackerChange,
  onFollowerHpChange,
  onCarriedChange,
  onWeightChange,
  onRemove,
}: MinorArcanaCardProps) => {
  const reqKeys = arcanum.requirements.map((_, i) => `req${i}`);
  const checkedCount = reqKeys.filter((k) => requirementsChecked[k]).length;
  const allChecked = checkedCount === reqKeys.length;

  const makeToggle = useCallback(
    (key: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
      onToggleRequirement(key, e.target.checked);
    },
    [onToggleRequirement],
  );

  const handleCarried = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => onCarriedChange(e.target.checked),
    [onCarriedChange],
  );

  const handleWeight = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      const val = e.target.value;
      onWeightChange(val === '1' ? 1 : val === '2' ? 2 : undefined);
    },
    [onWeightChange],
  );

  const handleHpChange = useCallback(
    (index: number) => (e: React.ChangeEvent<HTMLInputElement>) => {
      const val = parseInt(e.target.value, 10);
      if (!isNaN(val)) onFollowerHpChange(index, val);
    },
    [onFollowerHpChange],
  );

  const cx = clsx(styles.card, allChecked && styles.cardUnlocked);
  const { move } = arcanum;
  const isMultiHp = !!(move.follower?.hpCount && move.follower.hpCount > 1);

  return (
    <div className={cx}>
      <div className={styles.header}>
        <div className={styles.headerText}>
          <Text as="p" font="serif" size="sm" weight="bold">
            {arcanum.name}
          </Text>
          <div className={styles.meta}>
            {arcanum.provisions !== undefined && (
              <span className={styles.provisions}>
                {Array.from({ length: arcanum.provisions }).map((_, i) => (
                  <Icon
                    key={i}
                    name="empty-provisions"
                    size="small"
                    aria-label="provisions"
                  />
                ))}
              </span>
            )}
            {arcanum.tags && (
              <Text as="span" font="serif" size="sm" italic color="muted">
                {arcanum.tags}
              </Text>
            )}
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={onRemove}
          aria-label={`Remove ${arcanum.name}`}
          className={styles.removeBtn}
        >
          ×
        </Button>
      </div>

      <div className={styles.description}>
        {parseMarkdown(arcanum.description)}
      </div>

      <div className={styles.requirements}>
        {reqKeys.map((key, i) => (
          <label key={key} className={styles.reqRow}>
            <Checkbox
              checked={!!requirementsChecked[key]}
              onChange={makeToggle(key)}
            />
            <Text as="span" font="serif" size="sm">
              {parseInlineMarkdown(arcanum.requirements[i])}
            </Text>
          </label>
        ))}
      </div>

      <div className={styles.loadRow}>
        <label className={styles.weightLabel}>
          <Text as="span" font="serif" size="xs" color="muted">Weight</Text>
          <select
            className={styles.weightSelect}
            value={weight ?? ''}
            onChange={handleWeight}
          >
            <option value="">— small item</option>
            <option value="1">◈ light</option>
            <option value="2">◈◈ heavy</option>
          </select>
        </label>
        {weight !== undefined && (
          <label className={styles.carriedLabel}>
            <Checkbox
              variant="provision"
              weight={weight}
              checked={!!carried}
              onChange={handleCarried}
            />
            <Text as="span" font="serif" size="xs" color="muted">Carried</Text>
          </label>
        )}
      </div>

      {allChecked && (
        <>
          <div className={styles.moveReveal}>
            <div className={styles.moveHeader}>
              <Text as="p" font="serif" size="sm" weight="bold">
                {move.name}
              </Text>
              {move.subtitle && (
                <Text as="p" font="serif" size="sm" italic color="muted">
                  {parseInlineMarkdown(move.subtitle)}
                </Text>
              )}
            </div>

            {move.tracker && (
              <div className={styles.tracker}>
                <Text
                  as="span"
                  font="serif"
                  size="xs"
                  color="muted"
                  className={styles.trackerLabel}
                >
                  {move.tracker.label}
                </Text>
                <UseDots
                  total={move.tracker.max}
                  checked={trackerValue ?? 0}
                  onChange={onTrackerChange}
                />
              </div>
            )}

            <div className={styles.moveText}>{parseMarkdown(move.text)}</div>

            {move.follower && (
              <div className={styles.follower}>
                <div className={styles.followerHeader}>
                  <Text as="p" font="serif" size="sm" weight="bold">
                    {move.follower.name}
                  </Text>
                  {move.follower.tags && (
                    <Text as="span" font="serif" size="xs" italic color="muted">
                      {move.follower.tags}
                    </Text>
                  )}
                </div>
                <div className={styles.followerStats}>
                  <div className={styles.followerHpRow}>
                    {Array.from({ length: move.follower.hpCount ?? 1 }).map(
                      (_, i) => (
                        <label key={i} className={styles.followerHpLabel}>
                          <Text as="span" font="serif" size="xs" color="muted">
                            {isMultiHp ? `HP ${i + 1}` : "HP"}
                          </Text>
                          <input
                            type="number"
                            className={styles.followerHpInput}
                            value={followerHp?.[i] ?? move.follower!.hp}
                            min={0}
                            max={move.follower!.hp}
                            onChange={handleHpChange(i)}
                            aria-label={
                              isMultiHp
                                ? `${move.follower!.name} ${i + 1} HP`
                                : `${move.follower!.name} HP`
                            }
                          />
                          <Text as="span" font="serif" size="xs" color="muted">
                            /{move.follower!.hp}
                          </Text>
                        </label>
                      ),
                    )}
                    {move.follower.armor !== undefined && (
                      <span className={styles.followerStat}>
                        <Text as="span" font="serif" size="xs" color="muted">
                          Armor
                        </Text>
                        <Text as="span" font="serif" size="xs">
                          {move.follower.armor}
                        </Text>
                      </span>
                    )}
                    {move.follower.damage && (
                      <span className={styles.followerStat}>
                        <Text as="span" font="serif" size="xs" color="muted">
                          Damage
                        </Text>
                        <Text as="span" font="serif" size="xs">
                          {move.follower.damage}
                        </Text>
                      </span>
                    )}
                  </div>
                  <div className={styles.followerInstinct}>
                    <Text as="span" font="serif" size="xs" color="muted">
                      Instinct:{" "}
                    </Text>
                    <Text as="span" font="serif" size="xs" italic>
                      {move.follower.instinct}
                    </Text>
                  </div>
                  {move.follower.qualities && (
                    <ul className={styles.followerQualities}>
                      {move.follower.qualities.map((q) => (
                        <li key={q}>
                          <Text as="span" font="serif" size="xs">
                            {q}
                          </Text>
                        </li>
                      ))}
                    </ul>
                  )}
                  {move.follower.cost && (
                    <div className={styles.followerCost}>
                      <Text as="span" font="serif" size="xs" color="muted">
                        Cost:{" "}
                      </Text>
                      <Text as="span" font="serif" size="xs">
                        {move.follower.cost}
                      </Text>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};
