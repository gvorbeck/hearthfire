import type { MoveDefinition, MoveRoll, RollBand, RollStat } from '@/types';
import { STAT_ABBRS } from './constants';

// The six PC stats plus `+nothing` (a bare 2d6). Anything else after "roll +" in the book prose
// (+favor, +population, +defenses, +stat, …) reads a resource the character sheet doesn't hold, so we
// leave it unmatched and render no button — the parser fails closed rather than guess. The stat
// alternation is derived from the shared STATS table so it can't drift from the rest of the app.
const ROLL_STAT_RE = new RegExp(`\\broll \\+(${[...STAT_ABBRS, 'nothing'].join('|')})\\b`, 'i');

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
    // A "6-" miss band: everything at or below the threshold.
    add({ label: `${hi}-`, min: 0, max });
  }

  return [...byLabel.values()].sort((a, b) => b.min - a.min);
};

// Parse a move for a rollable PC-stat action. Returns null (→ no roll button) unless the prose names one
// of the six stats or `+nothing`. Only the first `roll +STAT` is used; the handful of multi-roll moves in
// the book roll their first stat in v1 (a documented limitation).
export const parseMoveRoll = (move: MoveDefinition): MoveRoll | null => {
  const text = bodyText(move);
  const match = text.match(ROLL_STAT_RE);
  if (!match) return null;

  const stat = match[1].toUpperCase() === 'NOTHING'
    ? 'nothing'
    : (match[1].toUpperCase() as RollStat);

  return { stat, bands: parseBands(text) };
};
