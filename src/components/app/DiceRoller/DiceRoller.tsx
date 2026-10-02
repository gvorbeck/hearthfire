import { useCallback, useEffect, useRef, useState } from 'react';
import clsx from 'clsx';
import { Button, Heading, Icon, Input, Text } from '@/components/ui';
import { rollNotation, type DiceRollOutcome } from '@/lib/diceNotation';
import { generateId } from '@/lib/id';
import type { LoggedRoll } from '@/types';
import styles from './DiceRoller.module.css';

interface DiceRollerProps {
  // Who is rolling, for the shared log: a character id/name, or 'gm' / 'steading' / 'game' on pages
  // without a character.
  rollerId: string;
  rollerName: string;
  onRoll: (roll: LoggedRoll) => Promise<void>;
}

const DICE = [4, 6, 8, 10, 12, 20, 100] as const;
const HISTORY_LIMIT = 6;

interface HistoryEntry extends DiceRollOutcome {
  id: string;
}

// A trailing dice term with no modifiers, e.g. the "2d6" in "1d8+2d6", so tapping d6 again can bump it
// to "3d6" instead of appending "+d6". Group 1 is whatever precedes the count, 2 the count, 3 the sides.
const TRAILING_DICE = /^(.*?(?:^|[+-]))(\d*)d(\d+)$/;
// A trailing flat modifier, e.g. the "+2" in "2d6+2".
const TRAILING_MOD = /([+-])(\d+)$/;

// Fold one die-button press into the notation field.
const withDie = (notation: string, sides: number): string => {
  const text = notation.trim();
  if (!text) return `d${sides}`;
  const m = TRAILING_DICE.exec(text);
  if (m && parseInt(m[3], 10) === sides) return `${m[1]}${(parseInt(m[2] || '1', 10) + 1)}d${sides}`;
  return `${text}+d${sides}`;
};

// Nudge the trailing flat modifier by `delta`, adding one if there isn't any, and dropping it at zero.
const withModifier = (notation: string, delta: number): string => {
  const text = notation.trim();
  if (!text) return text;
  const m = TRAILING_MOD.exec(text);
  const current = m ? parseInt(m[2], 10) * (m[1] === '-' ? -1 : 1) : 0;
  const next = current + delta;
  const base = m ? text.slice(0, m.index) : text;
  if (next === 0) return base;
  return `${base}${next > 0 ? '+' : '-'}${Math.abs(next)}`;
};

// A slide-out dice roller pinned to the bottom-right of every playbook page, its tab attached to the panel. Takes any dice notation (typed) or
// builds one from the die buttons; each completed roll shows here and is appended to the shared roll log
// on the game page.
export const DiceRoller = ({ rollerId, rollerName, onRoll }: DiceRollerProps) => {
  const [open, setOpen] = useState(false);
  const [notation, setNotation] = useState('');
  const [error, setError] = useState<string | undefined>();
  // This session's rolls, newest first, so a result can be glanced at or re-rolled. Local only — the
  // shared log on the game page is the permanent record.
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const tabRef = useRef<HTMLButtonElement>(null);

  // Move focus into the drawer when it opens (the panel turns visible immediately on open, so this
  // lands). Closing returns focus to the tab from the handlers below, not here, so the initial mount
  // doesn't steal focus.
  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  const handleToggle = useCallback(() => setOpen((o) => !o), []);

  const handleClose = useCallback(() => {
    setOpen(false);
    tabRef.current?.focus();
  }, []);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Escape' && open) handleClose();
  }, [open, handleClose]);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setNotation(e.target.value);
    setError(undefined);
  }, []);

  const roll = useCallback((input: string) => {
    const result = rollNotation(input);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    const { outcome } = result;
    setError(undefined);
    setHistory((h) => [{ id: generateId(), ...outcome }, ...h].slice(0, HISTORY_LIMIT));
    // Fire-and-forget like move rolls: reportSave surfaces a failed write, and a dropped log entry is
    // acceptable. The result still shows here either way.
    onRoll({
      id: `${rollerId}-${generateId()}`,
      characterId: rollerId,
      characterName: rollerName,
      moveName: '',
      stat: 'nothing',
      dice: [],
      mod: 0,
      total: outcome.total,
      mode: 'normal',
      band: null,
      notation: outcome.notation,
      breakdown: outcome.breakdown,
      createdAt: Date.now(),
    }).catch(() => {});
  }, [onRoll, rollerId, rollerName]);

  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    roll(notation);
  }, [roll, notation]);

  // Tapping a past roll loads its notation back into the field, ready to roll again.
  const handleReuse = useCallback((n: string) => {
    setNotation(n);
    setError(undefined);
    inputRef.current?.focus();
  }, []);

  const handleClear = useCallback(() => {
    setNotation('');
    setError(undefined);
    inputRef.current?.focus();
  }, []);

  const handleDie = useCallback((sides: number) => {
    setNotation((n) => withDie(n, sides));
    setError(undefined);
  }, []);

  const handleModifier = useCallback((delta: number) => {
    setNotation((n) => withModifier(n, delta));
    setError(undefined);
  }, []);

  const panelId = 'dice-roller-panel';
  const [last, ...earlier] = history;

  return (
    <div className={clsx(styles.root, open && styles.open)} onKeyDown={handleKeyDown}>
      <button
        ref={tabRef}
        type="button"
        className={styles.tab}
        onClick={handleToggle}
        aria-expanded={open}
        aria-controls={panelId}
      >
        <Icon name="dice" size="small" />
        Dice
      </button>

      <section id={panelId} className={styles.panel} aria-label="Dice roller">
        {/* The tab already toggles the drawer; this gives keyboard and touch users a close control
            right where they're working. */}
        <div className={styles.header}>
          <Heading as="h2" size="label" className={styles.title}>
            <Icon name="dice" size="small" />
            Dice Roller
          </Heading>
          <Button type="button" variant="ghost" size="sm" icon="close" aria-label="Close dice roller" onClick={handleClose} />
        </div>
        <form className={styles.form} onSubmit={handleSubmit}>
          <Input
            ref={inputRef}
            label="Dice notation"
            note="e.g. 2d6+1, 4d6kh3, d20"
            value={notation}
            onChange={handleChange}
            error={error}
            aria-invalid={error ? true : undefined}
            autoComplete="off"
            autoCapitalize="off"
            spellCheck={false}
            inputMode="text"
            enterKeyHint="go"
          />

          <div className={styles.dice} role="group" aria-label="Add a die">
            {DICE.map((sides) => (
              <Button key={sides} type="button" variant="secondary" size="sm" className={styles.die} onClick={() => handleDie(sides)}>
                d{sides}
              </Button>
            ))}
          </div>

          <div className={styles.mods} role="group" aria-label="Modifier">
            <Button type="button" variant="ghost" size="sm" icon="minus" aria-label="Subtract 1 from the modifier" onClick={() => handleModifier(-1)} />
            <Text as="span" size="xs" color="muted">Modifier</Text>
            <Button type="button" variant="ghost" size="sm" icon="plus" aria-label="Add 1 to the modifier" onClick={() => handleModifier(1)} />
          </div>

          <div className={styles.actions}>
            <Button type="submit" icon="dice" className={styles.rollBtn}>Roll</Button>
            <Button type="button" variant="ghost" onClick={handleClear} disabled={!notation}>Clear</Button>
          </div>
        </form>

        {/* Polite live region so the result is announced to screen readers when a roll lands. */}
        <div className={styles.result} aria-live="polite">
          {last ? (
            // Keyed on the roll so each new result replays the pop-in animation.
            <div key={last.id} className={styles.resultCard}>
              <Text as="span" size="xs" color="muted" className={styles.resultNotation}>{last.notation}</Text>
              <span className={styles.total}>{last.total}</span>
              <Text as="span" size="sm" color="muted" className={styles.breakdown}>{last.breakdown}</Text>
            </div>
          ) : (
            <Text size="sm" color="muted" className={styles.empty}>Your roll appears here.</Text>
          )}
        </div>

        {earlier.length > 0 && (
          <div className={styles.history}>
            <Heading as="h3" size="label">Earlier</Heading>
            <ul className={styles.historyList}>
              {earlier.map((h) => (
                <li key={h.id}>
                  <button type="button" className={styles.historyItem} onClick={() => handleReuse(h.notation)} aria-label={`Reuse ${h.notation}, rolled ${h.total}`}>
                    <span className={styles.historyNotation}>{h.notation}</span>
                    <span className={styles.historyTotal}>{h.total}</span>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}
      </section>
    </div>
  );
};
