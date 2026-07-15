import { Text } from '@/components/ui';
import type { LoggedRoll } from '@/types';
import styles from './RollLog.module.css';

interface RollLogProps {
  rolls: LoggedRoll[];
}

// Render a roll's dice as "4+3" with the modifier appended when non-zero: "4+3+1".
const diceExpr = (roll: LoggedRoll): string => {
  const dice = roll.dice.join('+');
  if (roll.mod === 0) return dice;
  return `${dice}${roll.mod > 0 ? '+' : ''}${roll.mod}`;
};

const statLabel = (roll: LoggedRoll): string => (roll.stat === 'nothing' ? '' : `+${roll.stat}`);

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
            {roll.moveName} {statLabel(roll)}
            {modeLabel(roll.mode)}
          </Text>
          <Text as="span" size="sm" className={styles.result}>
            {diceExpr(roll)} = <span className={styles.total}>{roll.total}</span>
            {roll.band && <span className={styles.band}> ({roll.band})</span>}
          </Text>
        </li>
      ))}
    </ul>
  );
};
