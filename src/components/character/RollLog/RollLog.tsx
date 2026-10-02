import clsx from 'clsx';
import { Text } from '@/components/ui';
import type { LoggedRoll } from '@/types';
import styles from './RollLog.module.css';

interface RollLogProps {
  rolls: LoggedRoll[];
}

// Render a roll's dice as "4+3" with the modifier appended when non-zero: "4+3+1". The die that
// advantage/disadvantage discarded is left out — printing it made the sum look wrong ("2+5+6 = 12"),
// and its face is the one part of a roll nobody acts on. Older entries carry no `dropped`, so they
// still print every die.
const diceExpr = (roll: LoggedRoll): string => {
  const dice = roll.dice.filter((_, i) => i !== roll.dropped).join('+');
  if (roll.mod === 0) return dice;
  return `${dice}${roll.mod > 0 ? '+' : ''}${roll.mod}`;
};

// What the roll was against: the stat, or the resource the player dialed in by hand (+Favor, +Prosperity).
const statLabel = (roll: LoggedRoll): string => {
  if (roll.resource) return `+${roll.resource}`;
  return roll.stat === 'nothing' ? '' : `+${roll.stat}`;
};

const modeLabel = (mode: LoggedRoll['mode']): string =>
  mode === 'adv' ? ' (adv)' : mode === 'dis' ? ' (dis)' : '';

// The GM-facing shared roll log: the party's most recent rolls, newest first. Reads straight from the
// live game doc, so it updates as players roll.
export const RollLog = ({ rolls }: RollLogProps) => {
  if (rolls.length === 0) {
    return <Text color="muted" size="sm">No rolls yet.</Text>;
  }

  // The doc stores oldest-first; show newest at the top.
  const newestFirst = [...rolls].reverse();

  return (
    <ul className={styles.list}>
      {newestFirst.map((roll) => (
        <li key={roll.id} className={styles.row}>
          <Text as="span" size="sm" weight="semibold" className={styles.who}>
            {roll.characterName || 'Someone'}
          </Text>
          <Text as="span" size="sm" color="muted" className={styles.move}>
            {roll.notation ?? (
              <>
                {roll.moveName} {statLabel(roll)}
                {modeLabel(roll.mode)}
              </>
            )}
          </Text>
          <Text as="span" size="sm" className={clsx(styles.result, roll.breakdown && styles.resultWrap)}>
            {roll.breakdown ?? diceExpr(roll)} = <span className={styles.total}>{roll.total}</span>
            {roll.band && <span className={styles.band}> ({roll.band})</span>}
          </Text>
        </li>
      ))}
    </ul>
  );
};
