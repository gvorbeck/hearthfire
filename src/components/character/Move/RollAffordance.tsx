import clsx from 'clsx';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Button, Text } from '@/components/ui';
import type { RollBand, RollStat } from '@/types';
import { bandFor, rollAction, type RollMode, type RollResult } from '@/lib/rollDice';
import styles from './RollAffordance.module.css';

// The subset of a completed roll a parent needs to log. Kept structural so Move doesn't depend on the
// session type; Moves.tsx maps it onto a LoggedRoll.
export interface RollReport {
  stat: RollStat;
  dice: number[];
  mod: number;
  total: number;
  mode: RollMode;
  band: string | null;
}

interface RollAffordanceProps {
  stat: RollStat;
  bands: RollBand[];
  mod: number;
  // A marked debility on this stat's group pre-selects Disadvantage (still user-overridable).
  debilityDisadvantage: boolean;
  onRoll?: (report: RollReport) => void;
}

// How long the dice "tumble" before settling on their rolled faces.
const TUMBLE_MS = 550;

const MODES: { value: RollMode; label: string; title: string }[] = [
  { value: 'adv', label: 'Adv', title: 'Advantage — roll 3 dice, drop the lowest' },
  { value: 'normal', label: '—', title: 'Normal — roll 2 dice' },
  { value: 'dis', label: 'Dis', title: 'Disadvantage — roll 3 dice, drop the highest' },
];

// The collapsed button's label: the stat it rolls (`+WIS`), or `+0` for a bare 2d6 (`roll +nothing`).
const rollLabel = (stat: RollStat): string => (stat === 'nothing' ? '+0' : `+${stat}`);

export const RollAffordance = ({
  stat,
  bands,
  mod,
  debilityDisadvantage,
  onRoll,
}: RollAffordanceProps) => {
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<RollMode>(debilityDisadvantage ? 'dis' : 'normal');
  const [result, setResult] = useState<RollResult | null>(null);
  const [tumbling, setTumbling] = useState(false);
  const tumbleTimer = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => () => clearTimeout(tumbleTimer.current), []);

  const doRoll = useCallback(
    (rollMode: RollMode) => {
      const next = rollAction(mod, rollMode);
      const band = bandFor(next.total, bands);
      setResult(next);
      setTumbling(true);
      clearTimeout(tumbleTimer.current);
      // The result is decided immediately; only the display tumbles, then settles.
      tumbleTimer.current = setTimeout(() => setTumbling(false), TUMBLE_MS);
      onRoll?.({
        stat,
        dice: next.dice,
        mod: next.mod,
        total: next.total,
        mode: next.mode,
        band: band?.label ?? null,
      });
    },
    [mod, bands, onRoll, stat],
  );

  // First tap opens the panel and rolls; the button becomes the re-roll control once open.
  const handleButton = useCallback(() => {
    if (!open) setOpen(true);
    doRoll(mode);
  }, [open, mode, doRoll]);

  const handleMode = useCallback(
    (next: RollMode) => {
      setMode(next);
      if (open) doRoll(next);
    },
    [open, doRoll],
  );

  const hitBand = result && !tumbling ? bandFor(result.total, bands) : null;

  return (
    <div className={styles.root}>
      <Button
        variant="ghost"
        size="sm"
        icon="dice"
        className={clsx(styles.trigger, open && styles.rerollIcon)}
        onClick={handleButton}
        aria-label={open ? 'Re-roll' : `Roll ${rollLabel(stat)}`}
        title={open ? 'Re-roll' : undefined}
      >
        <Text as="span" size="xs" font="sans" weight="semibold">
          {rollLabel(stat)}
        </Text>
      </Button>

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
                style={tumbling ? { animationDelay: `${i * 80}ms` } : undefined}
              >
                {face}
              </span>
            ))}
            <Text as="span" size="xs" color="muted" className={styles.modText}>
              {mod >= 0 ? `+${mod}` : mod} {stat !== 'nothing' ? stat : ''}
            </Text>
            <span className={clsx(styles.total, !tumbling && styles.totalSettled)}>
              = {result.total}
            </span>
            <div className={styles.modeToggle} role="group" aria-label="Advantage / disadvantage">
              {MODES.map((m) => (
                <button
                  key={m.value}
                  type="button"
                  className={clsx(styles.modeButton, mode === m.value && styles.modeButtonActive)}
                  aria-pressed={mode === m.value}
                  // Only the em-dash button needs an accessible name — its visible label is punctuation.
                  // The Adv/Dis buttons are named by their visible text; overriding it with aria-label
                  // would break "click Adv" voice control (Label in Name).
                  aria-label={m.value === 'normal' ? m.title : undefined}
                  title={m.title}
                  onClick={() => handleMode(m.value)}
                >
                  {m.label}
                </button>
              ))}
            </div>
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
