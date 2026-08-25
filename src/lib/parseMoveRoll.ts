import type { MoveDefinition, MoveRoll, RollBand, RollStat } from '@/types';
import { STAT_ABBRS } from './constants';

// Whatever the prose says to roll against: one of the six PC stats, `nothing` (a bare 2d6), or a
// resource the character sheet doesn't hold (+Favor, +Population, +Defenses, +STAT, …). The sheet can't
// resolve that last group, so those roll from 0 and the player dials the value in on the affordance's
// adjustment stepper — which is also how "add +1 for this, -1 for that" prose gets applied.
const ROLL_TARGET_RE = /\broll \+([a-z]+)\b/i;

// Ellipsis pattern: "roll..." or "roll…" — the player picks one of several stats named in the body.
const ROLL_ELLIPSIS_RE = /\broll\s*(?:\.{3}|…)/i;

// Inline "or" pattern: "roll +CON or +nothing" — two targets on one line.
const ROLL_OR_RE = /\broll \+([a-z]+)\s+or\s+\+([a-z]+)\b/i;

// Collect stat abbreviations that appear as `+STR`, `+DEX` etc. in a block of text.
const STAT_TARGET_RE = new RegExp(`\\+(?:${STAT_ABBRS.join('|')})\\b`, 'g');

// The stat alternation is derived from the shared STATS table so it can't drift from the rest of the app.
const STAT_TARGETS = new Set<string>(STAT_ABBRS);

// Outcome bands as written in the prose, with or without the surrounding `**` bold markers (blessed.ts
// bolds them, special.ts does not). Ordered specific-before-general so "7-9" wins over the bare "7-".
const BAND_RANGE_RE = /on a (\d+)-(\d+)/gi; // e.g. "7-9"
const BAND_PLUS_RE = /on a (\d+)\+/gi; // e.g. "10+", "7+", "12+"
const BAND_MISS_RE = /on a (\d+)-(?!\d)/gi; // e.g. "6-" (a trailing dash, not a range)

// Flatten a move's body into one string of its textual blocks. Bands and the roll trigger can live in
// different blocks (a `para` naming the roll, a following `list` of outcomes), so we scan the whole body.
const bodyText = (move: MoveDefinition): string =>
  (move.body ?? [])
    .map((block) => {
      if (block.kind === 'para') return block.text;
      if (block.kind === 'list') return block.items.join(' ');
      return '';
    })
    .join(' ');

// Collect distinct bands from the text, sorted by threshold descending (10+ before 7-9 before 6-), so
// the affordance can present them best-first and highlight the one the total lands in.
const parseBands = (text: string): RollBand[] => {
  const byLabel = new Map<string, RollBand>();
  const add = (band: RollBand) => {
    if (!byLabel.has(band.label)) byLabel.set(band.label, band);
  };

  for (const [, lo, hi] of text.matchAll(BAND_RANGE_RE)) {
    const min = Number(lo);
    add({ label: `${lo}-${hi}`, min, max: Number(hi) });
  }
  for (const [, lo] of text.matchAll(BAND_PLUS_RE)) {
    const min = Number(lo);
    add({ label: `${lo}+`, min, max: null });
  }
  for (const [, hi] of text.matchAll(BAND_MISS_RE)) {
    const max = Number(hi);
    add({ label: `${hi}-`, min: 0, max });
  }

  return [...byLabel.values()].sort((a, b) => b.min - a.min);
};

// Resolve a captured target word into a MoveRoll entry (stat, resource, or nothing).
const resolveTarget = (target: string, bands: RollBand[]): MoveRoll => {
  const upper = target.toUpperCase();
  if (STAT_TARGETS.has(upper)) return { stat: upper as RollStat, bands };
  if (upper === 'NOTHING') return { stat: 'nothing', bands };
  return { stat: 'nothing', bands, resource: target };
};

// Parse a move for rollable actions. Returns null (→ no roll button) unless the prose says "roll +"
// something. Multi-stat moves (Defy Danger, Interfere) and "or" moves (Heavy's Death's Door) return
// multiple entries; single-stat moves return a 1-element array.
export const parseMoveRoll = (move: MoveDefinition): MoveRoll[] | null => {
  const text = bodyText(move);

  // "roll +CON or +nothing" — two explicit targets on one line.
  const orMatch = text.match(ROLL_OR_RE);
  if (orMatch) {
    const bands = parseBands(text);
    return [resolveTarget(orMatch[1], bands), resolveTarget(orMatch[2], bands)];
  }

  // "roll..." / "roll…" — ellipsis followed by a list of +STAT options in the body.
  if (ROLL_ELLIPSIS_RE.test(text)) {
    const statMatches = [...text.matchAll(STAT_TARGET_RE)].map((m) =>
      m[0].slice(1),
    );
    if (statMatches.length > 0) {
      const bands = parseBands(text);
      const seen = new Set<string>();
      const rolls: MoveRoll[] = [];
      for (const abbr of statMatches) {
        if (!seen.has(abbr)) {
          seen.add(abbr);
          rolls.push({ stat: abbr as RollStat, bands });
        }
      }
      return rolls;
    }
  }

  // Single-stat: "roll +WIS" — wrap in a 1-element array.
  const match = text.match(ROLL_TARGET_RE);
  if (!match) return null;

  return [resolveTarget(match[1], parseBands(text))];
};
