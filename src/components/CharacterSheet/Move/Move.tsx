import clsx from 'clsx';
import { Checkbox, CheckboxGroup, Icon, List, Text, UseDots } from '@/components/primitives';
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
  usesLabel?: string;
  // usesAlt tracks a second independent hold on the same move (e.g. Up With People: the current
  // player's Rapport dots vs. the other player's dot). Both groups are stored on this character's
  // document as a convenience; the other player is expected to track their own copy independently.
  usesAlt?: number;
  usesAltLabel?: string;
  takes?: number;
  selectable?: boolean;
  startingMove?: boolean;
  requires?: string[];
  requiresLevel?: number;
  excludes?: string[];
}

interface SelectionProps {
  selected: boolean;
  onChange: (checked: boolean) => void;
  // readOnly: selection is pre-determined (starting move / background grant) — checkbox is visible but
  // unclickable. Distinct from lockReason, which blocks selection due to a constraint the user could resolve.
  readOnly?: boolean;
  lockReason?: string;
  takes?: CounterProps;
}

interface CounterProps {
  checked: number;
  onChange: (count: number) => void;
}

type CheckListProps =
  | { mode: 'boolean'; checked: Record<string, boolean>; forcedIds?: string[]; onChange: (id: string, checked: boolean) => void; }
  | { mode: 'leveled'; levels: Record<string, number>; forcedIds?: string[]; onChange: (id: string, level: number | null) => void; currentLevel: number; };

interface MoveProps {
  move: MoveDefinition;
  selection?: SelectionProps;
  uses?: CounterProps;
  usesAlt?: CounterProps;
  checkList?: CheckListProps;
  headerAction?: React.ReactNode;
}

// Flat props intentional: this sub-component is private to Move and maps 1:1 to what MoveSelectGroup
// renders — grouping would just add indirection for no callsite benefit.
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
  move, selection, uses, usesAlt, checkList, headerAction,
}: MoveProps) => {
  const locked = !!selection?.lockReason;
  const readOnly = selection?.readOnly ?? false;
  const selected = selection?.selected;
  const selectionTakes = selection?.takes;

  const usesTotal = move.uses;
  const hasUses = usesTotal !== undefined && uses !== undefined;
  const usesAltTotal = move.usesAlt;
  const hasUsesAlt = usesAltTotal !== undefined && usesAlt !== undefined;
  const takesTotal = move.takes;
  const hasTakes = takesTotal !== undefined && selectionTakes !== undefined;

  const moveCx = clsx(styles.move, selected && styles.moveSelected);
  const nameCx = clsx(styles.moveName, selected && styles.moveNameSelected);

  const nameEl = <span className={nameCx}>{parseInlineMarkdown(move.name)}</span>;

  const bodyParagraphs = move.body ? (Array.isArray(move.body) ? move.body : [move.body]) : [];
  const footerParagraphs = move.footer ? (Array.isArray(move.footer) ? move.footer : [move.footer]) : [];

  const leveledCheckList = checkList?.mode === 'leveled' ? checkList : null;
  const checkedLevel = leveledCheckList?.currentLevel ?? null;
  const levels = leveledCheckList?.levels ?? {};
  const marksUsed = checkedLevel !== null ? Object.keys(levels).length : 0;
  // Derived from leveled/boolean branch of checkList; not state.
  const effectiveChecked: Record<string, boolean> = checkedLevel !== null
    ? Object.fromEntries(Object.keys(levels).map((k) => [k, true]))
    : (checkList?.mode === 'boolean' ? checkList.checked : {});

  const forcedIdSet = new Set(checkList?.forcedIds ?? []);
  const effectiveCheckedWithForced: Record<string, boolean> = forcedIdSet.size > 0
    ? { ...effectiveChecked, ...Object.fromEntries(Array.from(forcedIdSet, (id) => [id, true])) }
    : effectiveChecked;

  const checkListItems = move.checkList?.map((label, i) => {
    const id = move.checkListIds?.[i] ?? `${move.id}-cl-${i}`;
    const isForced = forcedIdSet.has(id);
    const isChecked = effectiveCheckedWithForced[id] ?? false;
    const recordedLevel = checkedLevel !== null ? (levels[id] ?? null) : null;
    const displayLabel = <span>{parseInlineMarkdown(label.replace('___', recordedLevel !== null ? String(recordedLevel) : '___'))}</span>;
    const itemDisabled = isForced || (checkedLevel !== null && !isChecked && marksUsed >= checkedLevel);
    return { id, label: displayLabel, disabled: itemDisabled };
  });

  // Dots and checklist are inactive only when a selectable move hasn't been chosen yet.
  // readOnly moves (starting/background-granted) count as always-on. When selection is absent
  // entirely (display-only moves), uses/checkList props won't be passed so this value is moot.
  const interactiveDisabled = !readOnly && !selected;

  return (
    <div className={moveCx}>
      <div className={styles.moveHeader}>
        {move.selectable && selection !== undefined && hasTakes ? (
          <div className={styles.moveHeaderLeft}>
            <MoveSelectGroup
              moveName={move.name}
              selected={selected ?? false}
              onSelectChange={selection.onChange}
              takes={takesTotal!}
              takesChecked={selectionTakes!.checked}
              onTakesChange={selectionTakes!.onChange}
              disabled={readOnly || locked}
              locked={locked}
            />
            {nameEl}
          </div>
        ) : move.selectable && selection !== undefined ? (
          <Checkbox
            name={`move-${move.id}`}
            value={move.id}
            checked={selected ?? false}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => selection.onChange(e.target.checked)}
            label={nameEl}
            className={styles.moveCheckbox}
            disabled={readOnly || locked}
          />
        ) : (
          nameEl
        )}
        {(hasUses || hasUsesAlt) && (
          <div className={styles.usesGroup}>
            {hasUses && (
              <UseDots
                total={usesTotal!}
                checked={uses!.checked}
                onChange={uses!.onChange}
                disabled={interactiveDisabled}
                label={move.usesLabel}
              />
            )}
            {hasUses && hasUsesAlt && <span className={styles.usesSeparator} aria-hidden="true">|</span>}
            {hasUsesAlt && (
              <UseDots
                total={usesAltTotal!}
                checked={usesAlt!.checked}
                onChange={usesAlt!.onChange}
                disabled={interactiveDisabled}
                label={move.usesAltLabel}
              />
            )}
          </div>
        )}
        {headerAction && (
          <div className={styles.headerAction}>{headerAction}</div>
        )}
      </div>
      {selection?.lockReason && <Text font="serif" size="xs" color="tertiary" italic>{selection.lockReason}</Text>}
      {(move.triggerOverride || move.trigger) && (
        <Text font="serif" color="muted" leading="tight">
          {move.triggerOverride
            ? parseInlineMarkdown(move.triggerOverride)
            : <><span>When you </span><strong>{move.trigger}</strong>,</>
          }
        </Text>
      )}
      {bodyParagraphs.map((p, i) => {
        const icon = move.bodyIcons?.[i];
        return icon ? (
          <div key={`${move.id}-body-${i}`} className={styles.moveBodyWithIcon}>
            <Icon name={icon} size="small" className={styles.moveBodyIcon} aria-hidden="true" />
            <Text font="serif" color="muted" leading="tight">{parseInlineMarkdown(p)}</Text>
          </div>
        ) : (
          <Text key={`${move.id}-body-${i}`} font="serif" color="muted" leading="tight">{parseInlineMarkdown(p)}</Text>
        );
      })}
      {move.list && (
        <List variant="bullet" items={move.list.map((item) => parseInlineMarkdown(item))} />
      )}
      {checkListItems && checkList && (
        <CheckboxGroup
          items={checkListItems}
          checked={effectiveCheckedWithForced}
          onChange={leveledCheckList
            ? (id, checked) => leveledCheckList.onChange(id, checked ? leveledCheckList.currentLevel : null)
            // TS cannot narrow checkList in a callback; leveledCheckList handles the leveled branch above.
            : (id, checked) => (checkList as Extract<CheckListProps, { mode: 'boolean' }>).onChange(id, checked)
          }
          disabled={interactiveDisabled}
        />
      )}
      {footerParagraphs.map((p, i) => (
        <Text key={`${move.id}-footer-${i}`} font="serif" color="muted" leading="tight">{parseInlineMarkdown(p)}</Text>
      ))}
      {move.list2 && (
        <List variant="bullet" items={move.list2.map((item) => parseInlineMarkdown(item))} />
      )}
      {move.citation && <Text font="serif" size="xs" color="tertiary" italic className={styles.moveCitation}>{move.citation}</Text>}
    </div>
  );
};
