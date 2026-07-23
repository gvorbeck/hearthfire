import { Fragment, useCallback } from 'react';
import clsx from 'clsx';
import { Checkbox, Text } from '@/components/ui';
import { parseMarkdown } from '@/lib/parseMarkdown';
import type { MinorArcanum } from '@/types';
import { ArcanaCardHeader } from './ArcanaCardHeader';
import { ArcanaFollowerBlock } from './ArcanaFollowerBlock';
import { ArcanaTrackerRow } from './ArcanaTrackerRow';
import styles from './MinorArcanaCard.module.css';

interface MinorArcanaCardProps {
  arcanum: MinorArcanum;
  requirementsChecked: Record<string, boolean>;
  trackerValue?: number;
  followerHp?: number[];
  onToggleRequirement: (key: string, checked: boolean) => void;
  onTrackerChange: (value: number) => void;
  onFollowerHpChange: (index: number, value: number) => void;
  onRemove: () => void;
}

export const MinorArcanaCard = ({
  arcanum,
  requirementsChecked,
  trackerValue,
  followerHp,
  onToggleRequirement,
  onTrackerChange,
  onFollowerHpChange,
  onRemove,
}: MinorArcanaCardProps) => {
  // Most requirements render as a single checkbox; requirementRepeats expands the
  // requirement at a given string index into multiple independently-checkable boxes
  // (e.g. "on three separate nights, do X" is one string but three tracked boxes).
  const reqSlotKeys = arcanum.requirements.map((_, i) => {
    const repeat = arcanum.requirementRepeats?.[i] ?? 1;
    return Array.from({ length: repeat }, (_, n) => `req${i}` + (repeat > 1 ? `-${n}` : ''));
  });
  const reqKeys = reqSlotKeys.flat();
  const isUnlocked = arcanum.unlockGroups
    ? arcanum.unlockGroups.some((group) =>
        group.every((i) => reqSlotKeys[i].every((key) => !!requirementsChecked?.[key])),
      )
    : reqKeys.filter((k) => requirementsChecked?.[k]).length >=
      (arcanum.requirementsUnlockAt ?? reqKeys.length);

  const makeToggle = useCallback(
    (key: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
      onToggleRequirement(key, e.target.checked);
    },
    [onToggleRequirement],
  );

  const cx = clsx(styles.card, isUnlocked && styles.cardUnlocked);
  const { move } = arcanum;

  return (
    <div className={cx}>
      <ArcanaCardHeader
        id={arcanum.id}
        name={arcanum.name}
        tags={arcanum.tags}
        weight={arcanum.weight}
        onRemove={onRemove}
      />

      <div className={styles.description}>
        {parseMarkdown(arcanum.description)}
      </div>

      <div className={styles.requirements}>
        {reqSlotKeys.map((slotKeys, i) => (
          <Fragment key={`req${i}`}>
            {arcanum.requirementsDivider?.index === i && (
              <Text as="span" font="serif" italic color="muted">
                {arcanum.requirementsDivider.text}
              </Text>
            )}
            <label className={styles.reqRow}>
              <span className={styles.reqBoxes}>
                {slotKeys.map((key) => (
                  <Checkbox
                    key={key}
                    checked={!!requirementsChecked?.[key]}
                    onChange={makeToggle(key)}
                  />
                ))}
              </span>
              <Text as="span" font="serif">
                {arcanum.requirements[i]}
              </Text>
            </label>
          </Fragment>
        ))}
        {arcanum.requirementsNote && (
          <div className={styles.requirementsNote}>
            {parseMarkdown(arcanum.requirementsNote)}
          </div>
        )}
      </div>

      {isUnlocked && (
        <div className={styles.moveReveal}>
          <div className={styles.moveHeader}>
            <Text font="serif" weight="bold">
              {move.name}
            </Text>
            {move.subtitle && (
              <Text font="serif" italic color="muted">
                {move.subtitle}
              </Text>
            )}
          </div>

          {move.tracker && (
            <ArcanaTrackerRow
              label={move.tracker.label}
              total={move.tracker.max}
              checked={trackerValue ?? 0}
              onChange={onTrackerChange}
            />
          )}

          <div className={styles.moveText}>{parseMarkdown(move.text)}</div>

          {move.follower && (
            <ArcanaFollowerBlock
              arcanaId={arcanum.id}
              follower={move.follower}
              followerHp={followerHp}
              onFollowerHpChange={onFollowerHpChange}
            />
          )}
        </div>
      )}
    </div>
  );
};
