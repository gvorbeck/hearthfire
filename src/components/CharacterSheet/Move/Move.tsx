import clsx from 'clsx';
import { Checkbox, CheckboxGroup, Icon, List, UseDots } from '@/components/primitives';
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
  checkList?: string[];
  checkListIds?: string[];
  checkListLeveled?: boolean;
  footer?: string | string[];
  list2?: string[];
  citation?: string;
  uses?: number;
  // uses2 tracks a second independent hold on the same move (e.g. Up With People: the current
  // player's Rapport dots vs. the other player's dot). Both groups are stored on this character's
  // document as a convenience; the other player is expected to track their own copy independently.
  uses2?: number;
  takes?: number;
  selectable?: boolean;
  startingMove?: boolean;
  requires?: string[];
  requiresLevel?: number;
  excludes?: string[];
}

interface MoveProps {
  move: MoveDefinition;
  selected?: boolean;
  onSelectChange?: (checked: boolean) => void;
  usesChecked?: number;
  onUsesChange?: (count: number) => void;
  usesChecked2?: number;
  onUsesChange2?: (count: number) => void;
  checkListChecked?: Record<string, boolean>;
  checkListForcedIds?: string[];
  onCheckListChange?: (id: string, checked: boolean) => void;
  checkListLevels?: Record<string, number>;
  onCheckListLevelChange?: (id: string, level: number | null) => void;
  currentLevel?: number;
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
  moveName, selected, onSelectChange, takes, takesChecked, onTakesChange, disabled, locked,
}: {
  moveName: string; selected: boolean; onSelectChange: (checked: boolean) => void;
  takes: number; takesChecked: number; onTakesChange: (n: number) => void; disabled?: boolean; locked?: boolean;
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
        disabled={locked || (!disabled && !selected)}
      />
    ))}
  </div>
);

export const Move = ({
  move, selected, onSelectChange,
  usesChecked = 0, onUsesChange,
  usesChecked2 = 0, onUsesChange2,
  checkListChecked, checkListForcedIds, onCheckListChange,
  checkListLevels, onCheckListLevelChange,
  currentLevel,
  takesChecked = 0, onTakesChange,
  disabled, lockReason,
}: MoveProps) => {
  const locked = !!lockReason;
  const usesTotal = move.uses;
  const hasUses = usesTotal !== undefined && onUsesChange !== undefined;
  const uses2Total = move.uses2;
  const hasUses2 = uses2Total !== undefined && onUsesChange2 !== undefined;
  const takesTotal = move.takes;
  const hasTakes = takesTotal !== undefined && onTakesChange !== undefined;

  const moveCx = clsx(styles.move, selected && styles.moveSelected);
  const nameCx = clsx(styles.moveName, selected && styles.moveNameSelected);

  const nameEl = <span className={nameCx}>{move.name}</span>;

  const bodyParagraphs = move.body ? (Array.isArray(move.body) ? move.body : [move.body]) : [];
  const footerParagraphs = move.footer ? (Array.isArray(move.footer) ? move.footer : [move.footer]) : [];

  // Leveled checklist: currentLevel is narrowed here so downstream code never needs assertions.
  const cl = move.checkListLeveled && onCheckListLevelChange !== undefined && currentLevel !== undefined
    ? currentLevel
    : null;
  const levels = checkListLevels ?? {};
  // An entry in levels means the item was marked, regardless of the stored value.
  const levelUsedThisTurn = cl !== null && Object.values(levels).includes(cl);
  const effectiveChecked: Record<string, boolean> = cl !== null
    ? Object.fromEntries(Object.keys(levels).map((k) => [k, true]))
    : (checkListChecked ?? {});

  const forcedIdSet = new Set(checkListForcedIds ?? []);
  const effectiveCheckedWithForced: Record<string, boolean> = forcedIdSet.size > 0
    ? { ...effectiveChecked, ...Object.fromEntries(Array.from(forcedIdSet, (id) => [id, true])) }
    : effectiveChecked;

  const checkListItems = move.checkList?.map((label, i) => {
    const id = move.checkListIds?.[i] ?? `${move.id}-cl-${i}`;
    const isForced = forcedIdSet.has(id);
    const isChecked = effectiveCheckedWithForced[id] ?? false;
    const recordedLevel = cl !== null ? (levels[id] ?? null) : null;
    const displayLabel = cl !== null
      ? <>{parseInlineMarkdown(label.replace('___', recordedLevel !== null ? String(recordedLevel) : '___'))}</>
      : parseInlineMarkdown(label);
    // Prevents re-marking a slot or double-marking within the same level.
    const itemDisabled = isForced || (cl !== null && (isChecked || levelUsedThisTurn));
    return { id, label: displayLabel, disabled: itemDisabled };
  });

  return (
    <div className={moveCx}>
      <div className={styles.moveHeader}>
        {move.selectable && onSelectChange !== undefined && hasTakes ? (
          <div className={styles.moveHeaderLeft}>
            <MoveSelectGroup
              moveName={move.name}
              selected={selected ?? false}
              onSelectChange={onSelectChange}
              takes={takesTotal!}
              takesChecked={takesChecked}
              onTakesChange={onTakesChange}
              disabled={disabled || locked}
              locked={locked}
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
                total={takesTotal!}
                checked={takesChecked}
                onChange={onTakesChange}
              />
            )}
            {nameEl}
          </>
        )}
        {(hasUses || hasUses2) && (
          <div className={styles.usesGroup}>
            {hasUses && (
              <UseDots
                total={usesTotal!}
                checked={usesChecked}
                onChange={onUsesChange!}
                disabled={locked || (!disabled && !selected)}
              />
            )}
            {hasUses && hasUses2 && <span className={styles.usesSeparator} aria-hidden="true">|</span>}
            {hasUses2 && (
              <UseDots
                total={uses2Total!}
                checked={usesChecked2}
                onChange={onUsesChange2!}
                disabled={locked || (!disabled && !selected)}
              />
            )}
          </div>
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
          <div key={`${move.id}-body-${i}`} className={styles.moveBodyWithIcon}>
            <Icon name={icon} size="small" className={styles.moveBodyIcon} aria-hidden="true" />
            <p className={styles.moveBody}>{parseInlineMarkdown(p)}</p>
          </div>
        ) : (
          <p key={`${move.id}-body-${i}`} className={styles.moveBody}>{parseInlineMarkdown(p)}</p>
        );
      })}
      {move.list && (
        <List variant="bullet" items={move.list.map((item) => parseInlineMarkdown(item))} />
      )}
      {checkListItems && (
        <CheckboxGroup
          items={checkListItems}
          checked={effectiveCheckedWithForced}
          onChange={(id, checked) => {
            if (cl !== null) {
              onCheckListLevelChange!(id, checked ? cl : null);
            } else {
              onCheckListChange?.(id, checked);
            }
          }}
          disabled={locked || (!disabled && !selected)}
        />
      )}
      {footerParagraphs.map((p, i) => (
        <p key={`${move.id}-footer-${i}`} className={styles.moveBody}>{parseInlineMarkdown(p)}</p>
      ))}
      {move.list2 && (
        <List variant="bullet" items={move.list2.map((item) => parseInlineMarkdown(item))} />
      )}
      {move.citation && <p className={styles.moveCitation}>{move.citation}</p>}
    </div>
  );
};
