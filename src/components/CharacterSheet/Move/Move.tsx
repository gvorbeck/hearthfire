import clsx from 'clsx';
import { Checkbox, Icon, List, UseDots } from '@/components/primitives';
import type { IconName } from '@/components/primitives';
import { parseInlineMarkdown } from '@/lib/parseMarkdown';
import styles from './Move.module.css';

export interface MoveDefinition {
  id: string;
  name: string;
  trigger?: string;
  triggerOverride?: string;
  body?: string | string[];
  bodyIcons?: readonly IconName[];
  list?: string[];
  footer?: string | string[];
  list2?: string[];
  citation?: string;
  uses?: number;
  takes?: number;
  selectable?: boolean;
  startingMove?: boolean;
  requires?: string[];
  requiresLevel?: number;
}

interface MoveProps {
  move: MoveDefinition;
  selected?: boolean;
  onSelectChange?: (checked: boolean) => void;
  usesChecked?: number;
  onUsesChange?: (count: number) => void;
  takesChecked?: number;
  onTakesChange?: (count: number) => void;
  disabled?: boolean;
  lockReason?: string;
}

const TakeBoxes = ({ total, checked, onChange }: { total: number; checked: number; onChange: (n: number) => void }) => (
  <div className={styles.takeBoxes}>
    {Array.from({ length: total }, (_, i) => (
      <Checkbox
        key={i}
        aria-label={`Take ${i + 1}`}
        checked={!!(checked & (1 << i))}
        onChange={() => onChange(checked ^ (1 << i))}
      />
    ))}
  </div>
);

const MoveSelectGroup = ({
  moveName, selected, onSelectChange, takes, takesChecked, onTakesChange, disabled,
}: {
  moveName: string; selected: boolean; onSelectChange: (checked: boolean) => void;
  takes: number; takesChecked: number; onTakesChange: (n: number) => void; disabled?: boolean;
}) => (
  <div className={styles.takeBoxes}>
    <Checkbox
      aria-label={`Select ${moveName}`}
      checked={selected}
      onChange={(e) => onSelectChange(e.target.checked)}
      disabled={disabled}
    />
    {Array.from({ length: takes }, (_, i) => (
      <Checkbox
        key={i}
        aria-label={`Take ${i + 1}`}
        checked={!!(takesChecked & (1 << i))}
        onChange={() => onTakesChange(takesChecked ^ (1 << i))}
        disabled={disabled}
      />
    ))}
  </div>
);

export const Move = ({ move, selected, onSelectChange, usesChecked = 0, onUsesChange, takesChecked = 0, onTakesChange, disabled, lockReason }: MoveProps) => {
  const locked = !!lockReason;
  const uses = move.uses;
  const hasUses = uses !== undefined && onUsesChange !== undefined;
  const takes = move.takes;
  const hasTakes = takes !== undefined && onTakesChange !== undefined;

  const moveCx = clsx(styles.move, selected && styles.moveSelected);
  const nameCx = clsx(styles.moveName, selected && styles.moveNameSelected);

  const nameEl = <span className={nameCx}>{move.name}</span>;

  const bodyParagraphs = move.body ? (Array.isArray(move.body) ? move.body : [move.body]) : [];
  const footerParagraphs = move.footer ? (Array.isArray(move.footer) ? move.footer : [move.footer]) : [];

  return (
    <div className={moveCx}>
      <div className={styles.moveHeader}>
        {move.selectable && onSelectChange !== undefined && hasTakes ? (
          <div className={styles.moveHeaderLeft}>
            <MoveSelectGroup
              moveName={move.name}
              selected={selected ?? false}
              onSelectChange={onSelectChange}
              takes={takes!}
              takesChecked={takesChecked}
              onTakesChange={onTakesChange}
              disabled={disabled || locked}
            />
            {nameEl}
          </div>
        ) : move.selectable && onSelectChange !== undefined ? (
          <Checkbox
            name={`move-${move.id}`}
            value={move.id}
            checked={selected ?? false}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => onSelectChange(e.target.checked)}
            label={nameEl}
            className={styles.moveCheckbox}
            disabled={disabled || locked}
          />
        ) : (
          <>
            {hasTakes && (
              <TakeBoxes
                total={takes!}
                checked={takesChecked}
                onChange={onTakesChange}
              />
            )}
            {nameEl}
          </>
        )}
        {hasUses && (
          <UseDots
            total={uses}
            checked={usesChecked}
            onChange={onUsesChange}
            disabled={disabled || locked || !selected}
          />
        )}
      </div>
      {lockReason && <p className={styles.moveLockLabel}>{lockReason}</p>}
      {(move.triggerOverride || move.trigger) && (
        <p className={styles.moveTrigger}>
          {move.triggerOverride
            ? parseInlineMarkdown(move.triggerOverride)
            : <><span>When you </span><strong>{move.trigger}</strong>,</>
          }
        </p>
      )}
      {bodyParagraphs.map((p, i) => {
        const icon = move.bodyIcons?.[i];
        return icon ? (
          <div key={i} className={styles.moveBodyWithIcon}>
            <Icon name={icon} size="small" className={styles.moveBodyIcon} aria-hidden="true" />
            <p className={styles.moveBody}>{parseInlineMarkdown(p)}</p>
          </div>
        ) : (
          <p key={i} className={styles.moveBody}>{parseInlineMarkdown(p)}</p>
        );
      })}
      {move.list && (
        <List variant="bullet" items={move.list.map((item) => parseInlineMarkdown(item))} />
      )}
      {footerParagraphs.map((p, i) => (
        <p key={i} className={styles.moveBody}>{parseInlineMarkdown(p)}</p>
      ))}
      {move.list2 && (
        <List variant="bullet" items={move.list2.map((item) => parseInlineMarkdown(item))} />
      )}
      {move.citation && <p className={styles.moveCitation}>{move.citation}</p>}
    </div>
  );
};
