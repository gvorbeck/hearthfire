import type { CharacterData, RollBand, RollStat } from '@/types';
import { STATS } from './constants';

export type RollMode = 'normal' | 'adv' | 'dis';

export interface RollResult {
  dice: number[]; // every die rolled, in roll order (2 normal, 3 adv/dis)
  dropped: number | null; // index into `dice` of the discarded die, or null when normal
  mod: number;
  total: number; // kept dice + mod
  mode: RollMode;
}

const d6 = (): number => Math.floor(Math.random() * 6) + 1;

// A Stonetop action roll: 2d6 + mod normally; advantage rolls 3d6 and drops the lowest, disadvantage
// drops the highest (Book 1, p.230). The caller resolves advantage/disadvantage before calling — here we
// only execute the chosen mode.
export const rollAction = (mod: number, mode: RollMode): RollResult => {
  if (mode === 'normal') {
    const dice = [d6(), d6()];
    return { dice, dropped: null, mod, total: dice[0] + dice[1] + mod, mode };
  }

  const dice = [d6(), d6(), d6()];
  // Advantage keeps the two highest (drop lowest); disadvantage keeps the two lowest (drop highest).
  const dropValue = mode === 'adv' ? Math.min(...dice) : Math.max(...dice);
  const dropped = dice.indexOf(dropValue);
  const kept = dice.filter((_, i) => i !== dropped);
  return { dice, dropped, mod, total: kept[0] + kept[1] + mod, mode };
};

// Map a stat string ("-1".."3", "-", or blank) to its integer modifier, defaulting to 0. Mirrors the
// coercion the Stats section uses for the same fields.
export const statModifier = (value: string | undefined): number => {
  const n = parseInt(value ?? '', 10);
  return Number.isNaN(n) ? 0 : n;
};

// Resolve the modifier and whether a marked debility should pre-select disadvantage for a stat roll.
// Field + debility come from the shared STATS table (single source of truth). `nothing` has no stat.
export const resolveRollStat = (
  stat: RollStat,
  data: CharacterData | undefined,
): { mod: number; debilityDisadvantage: boolean } => {
  if (stat === 'nothing') return { mod: 0, debilityDisadvantage: false };
  const entry = STATS.find((s) => s.abbr === stat);
  if (!entry) return { mod: 0, debilityDisadvantage: false };
  return {
    mod: statModifier(data?.[entry.field] as string | undefined),
    debilityDisadvantage: Boolean(data?.[entry.debility]),
  };
};

// The band a total lands in, for highlighting. Bands are pre-sorted high→low; pick the first whose
// threshold the total meets. Returns null if the total falls in no listed band.
export const bandFor = (total: number, bands: RollBand[]): RollBand | null =>
  bands.find((b) => total >= b.min && (b.max === null || total <= b.max)) ?? null;
