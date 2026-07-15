import clsx from 'clsx';
import type { ReactNode } from 'react';
import {
  Checkbox,
  CheckboxGroup,
  Divider,
  Icon,
  List,
  Text,
  UseDots,
} from '@/components/ui';
import type { MoveBlock, MoveDefinition, RightControlSpec } from '@/types';
import { parseMoveRoll } from '@/lib/parseMoveRoll';
import { resolveRollStat } from '@/lib/rollDice';
import { RollAffordance } from './RollAffordance';
import { useCharacterRollOptional } from './CharacterRollContext';
import styles from './Move.module.css';

// Persistent left-control state: box 0 selects/gates the move, boxes 1..n track times taken.
interface LeftControlState {
  selected: boolean;
  onSelectChange: (checked: boolean) => void;
  // Bitmask, mirroring the legacy typeMoveTakes store: bit i = take box i+1.
  takesChecked: number;
  onTakesChange: (next: number) => void;
  // readOnly: box 0 is pre-checked and unclickable (starting / background-granted move).
  readOnly?: boolean;
}

// One persistent right-control slot. `checked` is a dot count, or 1/0 for a single checkbox.
interface RightControlState {
  checked: number;
  onChange: (next: number) => void;
}

// Persistent state for a `checkbox` body block (boolean checklist).
interface BodyCheckState {
  checked: Record<string, boolean>;
  onChange: (itemId: string, checked: boolean) => void;
  forcedIds?: string[];
}

// Persistent state for a `tracked` body block (per-level checklist).
interface BodyLevelState {
  levels: Record<string, number>;
  onChange: (itemId: string, level: number | null) => void;
  currentLevel: number;
  forcedIds?: string[];
}

interface MoveProps {
  title: string;
  move: MoveDefinition;
  // Number of left boxes incl. the select box. Defaults to move.leftControl, then 1 when selection
  // is supplied. When neither selection nor leftControl is present the move is display-only.
  leftControl?: number;
  // First box pre-checked + readOnly (granted starting move).
  defaultChecked?: boolean;
  selection?: LeftControlState;
  rightControl?: RightControlSpec[];
  // Index-aligned with rightControl. At most two slots persist (typeMoveUses / typeMoveUses2).
  rightControlState?: RightControlState[];
  bodyCheck?: BodyCheckState;
  bodyLevel?: BodyLevelState;
  // Fully-formed lock reasons (e.g. "Requires Level 6+, Veteran Crew" or "Conflicts with Ambush"),
  // rendered italic and comma-joined. The parent drops met requirements before passing them.
  requirement?: string[];
  citation?: string;
  headerAction?: ReactNode;
}

// Private to Move; maps 1:1 to the left-box group. Flat props are intentional — grouping would only
// add indirection for the single callsite.
const MoveSelectGroup = ({
  moveName,
  selected,
  onSelectChange,
  takeCount,
  takesChecked,
  onTakesChange,
  readOnly,
  locked,
}: {
  moveName: string;
  selected: boolean;
  onSelectChange: (checked: boolean) => void;
  takeCount: number;
  takesChecked: number;
  onTakesChange: (n: number) => void;
  readOnly?: boolean;
  locked?: boolean;
}) => (
  <div className={styles.takeBoxes}>
    <Checkbox
      aria-label={`Select ${moveName}`}
      checked={selected}
      onChange={(e) => onSelectChange(e.target.checked)}
      // A locked move that is already selected stays clickable so the player can deselect it; only
      // locked *unselected* moves are blocked. readOnly (forced/granted) is always locked.
      disabled={readOnly || (locked && !selected)}
    />
    {Array.from({ length: takeCount }, (_, i) => (
      <Checkbox
        key={`${moveName}-take-${i}`}
        aria-label={`${moveName}: take ${i + 1}`}
        checked={!!(takesChecked & (1 << i))}
        onChange={() => onTakesChange(takesChecked ^ (1 << i))}
        disabled={locked || (!readOnly && !selected)}
      />
    ))}
  </div>
);

export const Move = ({
  title,
  move,
  leftControl,
  defaultChecked,
  selection,
  rightControl,
  rightControlState,
  bodyCheck,
  bodyLevel,
  requirement,
  citation,
  headerAction,
}: MoveProps) => {
  const readOnly = (selection?.readOnly ?? false) || (defaultChecked ?? false);
  const selected = readOnly ? true : (selection?.selected ?? false);
  // A move with unmet requirements is locked: its select/take boxes are disabled (but still shown),
  // and the requirement text below explains why. readOnly grants are never "locked".
  const locked = !readOnly && (requirement?.length ?? 0) > 0;

  // Left boxes incl. the select box; clamp to a minimum of 1.
  const leftBoxes = Math.max(1, leftControl ?? move.leftControl ?? 1);
  const takeCount = leftBoxes - 1;

  const rightSpecs = rightControl ?? move.rightControl ?? [];
  // Only typeMoveUses / typeMoveUses2 exist; a third persistent slot would write nowhere. Fail loud
  // rather than silently dropping a control's saved value.
  if (rightControlState !== undefined && rightControlState.length > 2) {
    console.error(
      `Move "${move.id}": rightControl persists at most 2 slots, got ${rightControlState.length}.`,
    );
  }

  const moveCx = clsx(styles.move, selected && styles.moveSelected);
  const nameCx = clsx(styles.moveName, selected && styles.moveNameSelected);
  const nameEl = (
    <Text as="span" className={nameCx}>
      {title}
    </Text>
  );

  // Dots and body controls are inactive only when a selectable move hasn't been chosen. readOnly
  // (starting/granted) counts as always-on. Display-only moves omit the controls entirely.
  const interactiveDisabled = !readOnly && !selected;

  // Roll affordance: self-served from the character-sheet context (present on every character tab, absent
  // in the GM move search / bare tests). Shown only on an active move whose prose parses to a stat roll —
  // so the same shared Move offers rolling everywhere it appears, with no per-caller wiring.
  const rollContext = useCharacterRollOptional();
  const parsedRoll = rollContext && !interactiveDisabled ? parseMoveRoll(move) : null;
  const rollResolved = parsedRoll ? resolveRollStat(parsedRoll.stat, rollContext!.data) : null;

  const citationText = citation ?? move.citation;
  const blocks = move.body ?? [];

  // ── Block renderer ──────────────────────────────────────────────────────────
  // Pass raw strings to Text / List / CheckboxGroup: those atoms call parseInlineMarkdown internally.
  // Pre-parsing here would double-render bold / provision icons.
  // Blocks are static and never reorder, so a move-scoped positional key is stable.
  const renderBlock = (block: MoveBlock, index: number) => {
    const key = `${move.id}-block-${index}`;
    switch (block.kind) {
      case 'divider':
        return <Divider key={key} className={styles.bodyDivider} />;
      case 'para': {
        if (block.icon) {
          const iconParaCx = clsx(
            styles.moveBodyWithIcon,
            block.indent && styles.indent,
          );
          return (
            <div key={key} className={iconParaCx}>
              <Icon
                name={block.icon}
                size="small"
                className={styles.moveBodyIcon}
                aria-hidden="true"
              />
              <Text font="serif" color="muted" leading="tight">
                {block.text}
              </Text>
            </div>
          );
        }
        const paraCx = clsx(block.indent && styles.indent);
        return (
          <Text
            key={key}
            font="serif"
            color="muted"
            leading="tight"
            className={paraCx}
          >
            {block.text}
          </Text>
        );
      }
      case 'list': {
        const listCx = clsx(block.indent && styles.indent);
        return (
          <List
            key={key}
            variant="bullet"
            items={block.items}
            keyPrefix={key}
            className={listCx}
          />
        );
      }
      case 'checkbox': {
        const checked = bodyCheck?.checked ?? {};
        const forced = new Set(bodyCheck?.forcedIds ?? []);
        const items = block.items.map(({ id, label }) => ({
          id,
          label,
          disabled: interactiveDisabled || forced.has(id),
        }));
        const effectiveChecked =
          forced.size > 0
            ? {
                ...checked,
                ...Object.fromEntries(Array.from(forced, (id) => [id, true])),
              }
            : checked;
        return (
          <CheckboxGroup
            key={key}
            items={items}
            checked={effectiveChecked}
            onChange={(id, value) => bodyCheck?.onChange(id, value)}
            disabled={interactiveDisabled}
          />
        );
      }
      case 'tracked': {
        const levels = bodyLevel?.levels ?? {};
        const currentLevel = bodyLevel?.currentLevel ?? 0;
        const forced = new Set(bodyLevel?.forcedIds ?? []);
        // Cumulative "once per level" budget: total marks made may not exceed the current level, so
        // an unchecked item is disabled once that many marks have been made (you can mark out of order).
        const marksUsed = Object.keys(levels).length;
        const budgetSpent = marksUsed >= currentLevel;
        const effectiveChecked: Record<string, boolean> = Object.fromEntries(
          Object.keys(levels).map((id) => [id, true]),
        );
        for (const id of forced) effectiveChecked[id] = true;
        const items = block.items.map(({ id, label }) => {
          const isForced = forced.has(id);
          const isChecked = effectiveChecked[id] ?? false;
          const recordedLevel = levels[id] ?? null;
          // Substitute the '___' token with the level at which this item was marked.
          const displayLabel = label.replace(
            '___',
            recordedLevel !== null ? String(recordedLevel) : '___',
          );
          const disabled =
            interactiveDisabled || isForced || (!isChecked && budgetSpent);
          return { id, label: displayLabel, disabled };
        });
        return (
          <CheckboxGroup
            key={key}
            items={items}
            checked={effectiveChecked}
            onChange={(id, value) =>
              bodyLevel?.onChange(id, value ? currentLevel : null)
            }
            disabled={interactiveDisabled}
          />
        );
      }
      default:
        return null;
    }
  };

  return (
    <div className={moveCx}>
      <div className={styles.moveHeader}>
        {selection !== undefined ? (
          takeCount > 0 ? (
            <div className={styles.moveHeaderLeft}>
              <MoveSelectGroup
                moveName={title}
                selected={selected}
                onSelectChange={selection.onSelectChange}
                takeCount={takeCount}
                takesChecked={selection.takesChecked}
                onTakesChange={selection.onTakesChange}
                readOnly={readOnly}
                locked={locked}
              />
              {nameEl}
            </div>
          ) : (
            <Checkbox
              name={`move-${move.id}`}
              value={move.id}
              checked={selected}
              onChange={(e) => selection.onSelectChange(e.target.checked)}
              label={nameEl}
              className={styles.moveCheckbox}
              // Same as MoveSelectGroup: keep an already-selected locked move deselectable.
              disabled={readOnly || (locked && !selected)}
            />
          )
        ) : (
          nameEl
        )}
        {rightSpecs.length > 0 && (
          <div className={styles.usesGroup}>
            {rightSpecs.map((spec, i) => {
              const state = rightControlState?.[i];
              const count = Math.max(1, spec.number ?? 1);
              // The preceding control's `divider` flag draws a separator before this one, rendered as a
              // left border on this slot rather than a separate element.
              const dividedCx = clsx(
                styles.usesSlot,
                rightSpecs.length > 1 && rightSpecs[i - 1]?.divider && styles.usesSlotDivided,
              );
              return (
                <span key={`${move.id}-rc-${i}`} className={dividedCx}>
                  {spec.type === 'dot' ? (
                    <UseDots
                      total={count}
                      checked={state?.checked ?? 0}
                      onChange={(n) => state?.onChange(n)}
                      disabled={interactiveDisabled || state === undefined}
                      label={spec.label}
                    />
                  ) : (
                    <Checkbox
                      aria-label={spec.label ?? `${title} toggle`}
                      label={spec.label}
                      checked={(state?.checked ?? 0) === 1}
                      onChange={(e) =>
                        state?.onChange(e.target.checked ? 1 : 0)
                      }
                      disabled={interactiveDisabled || state === undefined}
                    />
                  )}
                </span>
              );
            })}
          </div>
        )}
        {headerAction && <div className={styles.headerAction}>{headerAction}</div>}
      </div>
      {parsedRoll && rollResolved && (
        <RollAffordance
          stat={parsedRoll.stat}
          bands={parsedRoll.bands}
          mod={rollResolved.mod}
          debilityDisadvantage={rollResolved.debilityDisadvantage}
          onRoll={(report) => rollContext!.onRoll(move.name, report)}
        />
      )}
      {requirement !== undefined && requirement.length > 0 && (
        <Text font="serif" size="xs" color="tertiary" italic>
          {requirement.join(', ')}
        </Text>
      )}
      {blocks.map(renderBlock)}
      {citationText && (
        <Text
          as="span"
          font="serif"
          size="xs"
          color="tertiary"
          italic
          className={styles.moveCitation}
        >
          {citationText}
        </Text>
      )}
    </div>
  );
};
