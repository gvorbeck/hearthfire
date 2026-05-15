import clsx from 'clsx';
import { Checkbox } from '@/components/primitives';
import styles from './Move.module.css';

const BOLD_RE = /(\*\*[^*]+\*\*|on a 10\+|on a 7[-–]9|on a 6[-–]|either way)/i;
const AUTO_BOLD_RE = /^(on a 10\+|on a 7[-–]9|on a 6[-–]|either way)$/i;

const parseBold = (text: string): React.ReactNode[] =>
  text.split(BOLD_RE).reduce<React.ReactNode[]>((acc, chunk, i) => {
    if (!chunk) return acc;
    if (chunk.startsWith('**')) return [...acc, <strong key={i}>{chunk.slice(2, -2)}</strong>];
    if (AUTO_BOLD_RE.test(chunk)) return [...acc, <strong key={i}>{chunk}</strong>];
    return [...acc, chunk];
  }, []);

export interface MoveDefinition {
  id: string;
  name: string;
  trigger: string;
  body?: string;
  list?: string[];
  footer?: string;
  uses?: number;
  selectable?: boolean;
}

interface MoveProps {
  move: MoveDefinition;
  selected?: boolean;
  onSelectChange?: (checked: boolean) => void;
  usesChecked?: number;
  onUsesChange?: (count: number) => void;
}

const UseDots = ({ total, checked, onChange }: { total: number; checked: number; onChange: (n: number) => void }) => (
  <div className={styles.useDots} aria-label={`Uses: ${checked} of ${total}`}>
    {Array.from({ length: total }, (_, i) => {
      const filled = i < checked;
      const dotCx = clsx(styles.useDot, filled && styles.useDotFilled);
      return (
        <button
          key={i}
          type="button"
          className={dotCx}
          aria-label={filled ? `Clear use ${i + 1}` : `Mark use ${i + 1}`}
          onClick={() => onChange(filled ? i : i + 1)}
        />
      );
    })}
  </div>
);

export const Move = ({ move, selected, onSelectChange, usesChecked = 0, onUsesChange }: MoveProps) => {
  const hasCheckbox = move.selectable && onSelectChange !== undefined;
  const hasUses = move.uses !== undefined && onUsesChange !== undefined;

  const moveCx = clsx(styles.move, selected && styles.moveSelected);
  const nameCx = clsx(styles.moveName, selected && styles.moveNameSelected);

  const nameEl = <span className={nameCx}>{move.name}</span>;

  return (
    <div className={moveCx}>
      <div className={styles.moveHeader}>
        {hasCheckbox ? (
          <Checkbox
            name={`move-${move.id}`}
            value={move.id}
            checked={selected ?? false}
            onChange={(e) => onSelectChange(e.target.checked)}
            label={nameEl}
            className={styles.moveCheckbox}
          />
        ) : (
          nameEl
        )}
        {hasUses && (
          <UseDots
            total={move.uses!}
            checked={usesChecked}
            onChange={onUsesChange!}
          />
        )}
      </div>
      <p className={styles.moveTrigger}>
        When you <strong>{move.trigger}</strong>,
      </p>
      {move.body && <p className={styles.moveBody}>{parseBold(move.body)}</p>}
      {move.list && (
        <ul className={styles.moveList}>
          {move.list.map((item) => (
            <li key={item} className={styles.moveListItem}>{parseBold(item)}</li>
          ))}
        </ul>
      )}
      {move.footer && <p className={styles.moveBody}>{parseBold(move.footer)}</p>}
    </div>
  );
};
