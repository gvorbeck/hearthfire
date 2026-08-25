import clsx from 'clsx';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Button, Text } from '@/components/ui';
import type { RollBand, RollStat } from '@/types';
import { bandFor, remodeRoll, rollAction, type RollMode, type RollResult } from '@/lib/rollDice';
import { generateId } from '@/lib/id';
import styles from './RollAffordance.module.css';

// The subset of a completed roll a parent needs to log. Kept structural so Move doesn't depend on the
// session type; Moves.tsx maps it onto a LoggedRoll.
export interface RollReport {
  // Identity of the roll itself, stable across advantage/disadvantage changes: switching mode alters a
  // roll rather than making a new one, so the log entry is updated in place instead of duplicated.
  rollId: string;
  stat: RollStat;
  // The non-stat resource this rolled against, when there was one — the log has no other way to say
  // what the modifier stood for.
  resource?: string;
  dice: number[];
  dropped: number | null;
  mod: number;
  total: number;
  mode: RollMode;
  band: string | null;
}

// A resolved stat option for a multi-stat move (Defy Danger, Interfere, Heavy Death's Door).
export interface StatOption {
  stat: RollStat;
  mod: number;
  debilityDisadvantage: boolean;
  resource?: string;
}

interface RollAffordanceProps {
  stat: RollStat;
  bands: RollBand[];
  mod: number;
  // A marked debility on this stat's group pre-selects Disadvantage (still user-overridable).
  debilityDisadvantage: boolean;
  // Set when the move rolls against something the sheet can't read (+Favor, +Fortunes, +STAT, …). The
  // roll starts at 0 and the player dials the value in on the adjustment stepper.
  resource?: string;
  // Multi-stat moves: one entry per rollable stat. When present (length > 1), the trigger area renders
  // a row of per-stat buttons instead of a single trigger.
  statOptions?: StatOption[];
  onRoll?: (report: RollReport) => void;
}

// How long the dice "tumble" before settling on their rolled faces.
const TUMBLE_MS = 550;

// Bounds on the hand-dialed adjustment. Wide enough for any modifier the book asks for, tight enough
// that the value stays one glyph plus a sign.
const ADJUST_MIN = -9;
const ADJUST_MAX = 9;

const MODES: { value: RollMode; label: string; title: string }[] = [
  { value: 'adv', label: 'Adv', title: 'Advantage — 3 dice, drop the lowest' },
  { value: 'normal', label: '—', title: 'Normal — 2 dice' },
  { value: 'dis', label: 'Dis', title: 'Disadvantage — 3 dice, drop the highest' },
];

// The trigger button's visible label: the stat it rolls (`+WIS`) or the resource it rolls against
// (`+Favor`). A bare 2d6 (`roll +nothing`) gets no label at all — a "+0" there would sit right beside the
// stepper's own "+0" and read as a duplicate.
const rollLabel = (stat: RollStat, resource: string | undefined): string => {
  if (resource) return `+${resource}`;
  return stat === 'nothing' ? '' : `+${stat}`;
};

const signed = (n: number): string => (n >= 0 ? `+${n}` : `${n}`);

export const RollAffordance = ({
  stat: initialStat,
  bands,
  mod: initialMod,
  debilityDisadvantage: initialDebilityDis,
  resource: initialResource,
  statOptions,
  onRoll,
}: RollAffordanceProps) => {
  const isMultiStat = statOptions !== undefined && statOptions.length > 1;

  // Multi-stat: the selected stat is internal state (changed by clicking a stat button).
  // Single-stat: the stat is always the prop value — no internal override.
  const [selectedStat, setSelectedStat] = useState<StatOption | null>(null);
  const activeStat = isMultiStat && selectedStat ? selectedStat.stat : initialStat;
  const activeMod = isMultiStat && selectedStat ? selectedStat.mod : initialMod;
  const activeResource = isMultiStat && selectedStat ? selectedStat.resource : initialResource;

  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<RollMode>(initialDebilityDis ? 'dis' : 'normal');
  const [result, setResult] = useState<RollResult | null>(null);
  const [tumbling, setTumbling] = useState(false);
  const [adjust, setAdjust] = useState(0);
  const tumbleTimer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const rollId = useRef('');
  const spare = useRef<number | null>(null);

  useEffect(() => () => clearTimeout(tumbleTimer.current), []);

  const report = useCallback(
    (next: RollResult, stat: RollStat, resource: string | undefined) => {
      onRoll?.({
        rollId: rollId.current,
        stat,
        resource,
        dice: next.dice,
        dropped: next.dropped,
        mod: next.mod,
        total: next.total,
        mode: next.mode,
        band: bandFor(next.total, bands)?.label ?? null,
      });
    },
    [bands, onRoll],
  );

  const doRoll = useCallback(
    (rollMode: RollMode, mod: number, stat: RollStat, resource: string | undefined) => {
      const next = rollAction(mod + adjust, rollMode);
      rollId.current = generateId();
      spare.current = null;
      setResult(next);
      setTumbling(true);
      clearTimeout(tumbleTimer.current);
      tumbleTimer.current = setTimeout(() => setTumbling(false), TUMBLE_MS);
      report(next, stat, resource);
    },
    [adjust, report],
  );

  // Single-stat: first tap opens and rolls; subsequent taps re-roll.
  const handleButton = useCallback(() => {
    if (!open) setOpen(true);
    doRoll(mode, activeMod, activeStat, activeResource);
  }, [open, mode, doRoll, activeMod, activeStat, activeResource]);

  // Multi-stat: clicking a stat button selects it and rolls.
  const handleStatClick = useCallback(
    (option: StatOption) => {
      setSelectedStat(option);
      const newMode = option.debilityDisadvantage ? 'dis' : 'normal';
      setMode(newMode);
      setResult(null);
      spare.current = null;
      if (!open) setOpen(true);
      doRoll(newMode, option.mod, option.stat, option.resource);
    },
    [open, doRoll],
  );

  const handleMode = useCallback(
    (next: RollMode) => {
      if (next === mode) return;
      setMode(next);
      if (!result) return;
      const remoded = remodeRoll(result, next, spare.current);
      spare.current = remoded.dice[2] ?? result.dice[2] ?? spare.current;
      setResult(remoded);
      report(remoded, activeStat, activeResource);
    },
    [mode, result, report, activeStat, activeResource],
  );

  const handleAdjust = useCallback(
    (delta: number) => setAdjust((a) => Math.min(ADJUST_MAX, Math.max(ADJUST_MIN, a + delta))),
    [],
  );

  const hitBand = result && !tumbling ? bandFor(result.total, bands) : null;
  const label = rollLabel(activeStat, activeResource);
  const triggerCx = clsx(styles.trigger, open && styles.rerollIcon);
  const atMin = adjust <= ADJUST_MIN;
  const atMax = adjust >= ADJUST_MAX;

  const modText = (rolled: RollResult): string => {
    const rolledAdjust = rolled.mod - activeMod;
    if (activeResource) return `${signed(rolled.mod)} ${activeResource}`;
    if (activeStat === 'nothing') return signed(rolled.mod);
    return `${signed(activeMod)} ${activeStat}${rolledAdjust === 0 ? '' : ` ${signed(rolledAdjust)}`}`;
  };

  return (
    <div className={styles.root}>
      <div className={styles.controls}>
        {isMultiStat ? (
          <div className={styles.statPicker} role="group" aria-label="Choose a stat to roll">
            {statOptions.map((option) => {
              const optLabel = rollLabel(option.stat, option.resource);
              const isActive = open && option.stat === activeStat && option.resource === activeResource;
              return (
                <Button
                  key={`${option.stat}-${option.resource ?? ''}`}
                  variant="ghost"
                  size="sm"
                  icon="dice"
                  className={clsx(styles.trigger, isActive && styles.statTriggerActive)}
                  onClick={() => handleStatClick(option)}
                  aria-label={`Roll ${optLabel}`.trim()}
                  aria-pressed={isActive}
                >
                  {optLabel && (
                    <Text as="span" size="xs" font="sans" weight="semibold">
                      {optLabel}
                    </Text>
                  )}
                </Button>
              );
            })}
          </div>
        ) : (
          <Button
            variant="ghost"
            size="sm"
            icon="dice"
            className={triggerCx}
            onClick={handleButton}
            aria-label={open ? 'Re-roll' : `Roll ${label}`.trim()}
            title={open ? 'Re-roll' : undefined}
          >
            {label && (
              <Text as="span" size="xs" font="sans" weight="semibold">
                {label}
              </Text>
            )}
          </Button>
        )}

        <div className={styles.modeToggle} role="group" aria-label="Advantage / disadvantage">
          {MODES.map((m) => (
            <button
              key={m.value}
              type="button"
              className={clsx(styles.modeButton, mode === m.value && styles.modeButtonActive)}
              aria-pressed={mode === m.value}
              aria-label={m.value === 'normal' ? m.title : undefined}
              title={m.title}
              onClick={() => handleMode(m.value)}
            >
              {m.label}
            </button>
          ))}
        </div>

        <div className={styles.adjust} role="group" aria-label="Roll modifier">
          <Button
            variant="ghost"
            size="sm"
            icon="minus"
            onClick={() => handleAdjust(-1)}
            aria-disabled={atMin}
            aria-label="Subtract 1 from the roll"
          />
          <span className={styles.adjustValue} aria-live="polite" aria-atomic="true">
            {signed(adjust)}
          </span>
          <Button
            variant="ghost"
            size="sm"
            icon="plus"
            onClick={() => handleAdjust(1)}
            aria-disabled={atMax}
            aria-label="Add 1 to the roll"
          />
        </div>
      </div>

      {open && result && (
        <div className={styles.result} role="status" aria-live="polite">
          <div className={styles.diceRow}>
            {result.dice.map((face, i) => (
              <span
                key={`die-${i}-${face}`}
                className={clsx(
                  styles.die,
                  tumbling && styles.dieTumbling,
                  !tumbling && result.dropped === i && styles.dieDropped,
                )}
                style={{ '--die-delay': `${i * 80}ms` } as React.CSSProperties}
              >
                {face}
              </span>
            ))}
            <Text as="span" size="xs" color="muted" className={styles.modText}>
              {modText(result)}
            </Text>
            <span className={clsx(styles.total, !tumbling && styles.totalSettled)}>
              = {result.total}
            </span>
          </div>
          {hitBand && (
            <Text as="span" size="xs" weight="semibold" color="accent" className={styles.band}>
              ▸ {hitBand.label}
            </Text>
          )}
        </div>
      )}
    </div>
  );
};
