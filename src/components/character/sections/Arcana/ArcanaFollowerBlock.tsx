import { useCallback, useEffect, useRef, useState, memo } from 'react';
import clsx from 'clsx';
import { CheckboxGroup, List, Text } from '@/components/ui';
import { parseInlineMarkdown } from '@/lib/parseMarkdown';
import type { ArcanaFollower } from '@/types';
import { ArcanaTrackerRow } from './ArcanaTrackerRow';
import styles from './ArcanaFollowerBlock.module.css';

// A short screen-reader label for a d4 box, from the aspect row's bold lead-in (e.g. "**Tags:** 1 = …"
// → "Tags die"), so the field isn't announced as the whole option paragraph with literal asterisks.
const aspectDieLabel = (rowLabel: string): string => {
  const lead = rowLabel.match(/^\*\*(.+?):?\*\*/);
  return lead ? `${lead[1]} die` : 'Aspect die';
};

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
  // A rolled-aspects follower (the Servant of Daagon) carries per-row d4 write-in values and per-option
  // Traits/Moves ticks. Absent for ordinary followers.
  aspectInputs?: Record<string, string>;
  onAspectInputChange?: (rowId: string, value: string) => void;
  aspectChecks?: Record<string, boolean>;
  onAspectCheckChange?: (optionId: string, checked: boolean) => void;
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
  aspectInputs,
  onAspectInputChange,
  aspectChecks,
  onAspectCheckChange,
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
          <Text as="span" font="serif" size="xs">{follower.instinct}</Text>
        </div>
        {follower.qualities && (
          <div className={styles.followerMoves}>
            <Text as="span" font="serif" size="xs" color="muted">Moves</Text>
            <List
              variant="bullet"
              items={follower.qualities.map((q, i) => (
                <Text key={`quality-${arcanaId}-${i}`} as="span" font="serif" size="xs">{q}</Text>
              ))}
            />
          </div>
        )}
        {follower.cost && (
          <div className={styles.followerCost}>
            <Text as="span" font="serif" size="xs" color="muted">Cost: </Text>
            <Text as="span" font="serif" size="xs">{follower.cost}</Text>
          </div>
        )}
        {follower.aspects && (
          <div className={styles.aspects}>
            {follower.aspects.intro && (
              <Text font="serif" size="xs" color="muted">
                {parseInlineMarkdown(follower.aspects.intro)}
              </Text>
            )}
            <div className={styles.aspectRows}>
              {follower.aspects.rows.map((row) => (
                <div key={`aspect-${arcanaId}-${row.id}`} className={styles.aspectRow}>
                  <AspectDie
                    rowId={row.id}
                    label={aspectDieLabel(row.label)}
                    value={aspectInputs?.[row.id] ?? ''}
                    min={follower.aspects!.min}
                    max={follower.aspects!.max}
                    disabled={inactive}
                    onChange={onAspectInputChange}
                  />
                  <div className={styles.aspectBody}>
                    <div className={styles.aspectLabel}>
                      {/* Inner span keeps the inline content as one flex child, so the flex box
                          centering doesn't collapse the space after the bold "Tags:" label. */}
                      <Text as="span" font="serif" size="xs">
                        {parseInlineMarkdown(row.label)}
                      </Text>
                    </div>
                    {row.options && row.options.length > 0 && (
                      <CheckboxGroup
                        columns={2}
                        items={row.options.map((opt) => ({
                          ...opt,
                          disabled: inactive,
                        }))}
                        checked={aspectChecks ?? {}}
                        onChange={(optId, value) => onAspectCheckChange?.(optId, value)}
                        disabled={inactive}
                      />
                    )}
                  </div>
                </div>
              ))}
            </div>
            {follower.aspects.footer && (
              <Text font="serif" size="xs" color="muted">
                {parseInlineMarkdown(follower.aspects.footer)}
              </Text>
            )}
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

interface AspectDieProps {
  rowId: string;
  label: string;
  value: string;
  min: number;
  max: number;
  disabled: boolean;
  onChange?: (rowId: string, value: string) => void;
}

// The d4 write-in beside an aspect row: optimistic local state persisted on blur (so a debounced
// Firestore echo doesn't jump the cursor), clamped to [min, max]. Blank stays blank.
const AspectDie = memo(({ rowId, label, value, min, max, disabled, onChange }: AspectDieProps) => {
  const [draft, setDraft] = useState(value);
  const lastSaved = useRef(value);
  useEffect(() => {
    if (value === lastSaved.current) return;
    lastSaved.current = value;
    setDraft(value);
  }, [value]);
  const commit = useCallback(
    (raw: string) => {
      let next = raw;
      if (raw !== '') {
        const n = Math.round(Number(raw));
        next = Number.isNaN(n) ? '' : String(Math.min(max, Math.max(min, n)));
      }
      setDraft(next);
      if (next === lastSaved.current) return;
      lastSaved.current = next;
      onChange?.(rowId, next);
    },
    [max, min, onChange, rowId],
  );
  return (
    <input
      type="number"
      className={styles.aspectDie}
      value={draft}
      min={min}
      max={max}
      inputMode="numeric"
      disabled={disabled}
      aria-label={label}
      onChange={(e) => setDraft(e.target.value)}
      onBlur={(e) => commit(e.target.value)}
      onWheel={(e) => e.currentTarget.blur()}
    />
  );
});
