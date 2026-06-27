import { describe, it, expect } from 'vitest';
import { computeTotalLoad, getShieldWeight } from './inventoryData';
import type { CharacterData } from '@/types';
import type { ArcanaWeights } from './useArcanaWeights';

// computeTotalLoad takes the lazily-loaded arcana weight maps as arguments (see useArcanaWeights),
// so these tests pass them in directly rather than touching the full datasets.
const NO_ARCANA: ArcanaWeights = {};

describe('getShieldWeight', () => {
  it('is 2 by default', () => {
    expect(getShieldWeight({} as CharacterData)).toBe(2);
  });

  it('is 1 when the character has the heavy-armored move', () => {
    expect(getShieldWeight({ typeMoves: { 'heavy-armored': true } } as CharacterData)).toBe(1);
  });
});

describe('computeTotalLoad', () => {
  it('is 0 for an empty character', () => {
    expect(computeTotalLoad(undefined, NO_ARCANA, NO_ARCANA)).toBe(0);
  });

  it('sums checked named items by their weight', () => {
    // rope (1) + maul (2) = 3; an unchecked item adds nothing.
    const data = { inventoryChecked: { rope: true, maul: true, bedroll: false } } as unknown as CharacterData;
    expect(computeTotalLoad(data, NO_ARCANA, NO_ARCANA)).toBe(3);
  });

  it('uses the heavy-armored shield weight override', () => {
    const base = { inventoryChecked: { shield: true } } as unknown as CharacterData;
    expect(computeTotalLoad(base, NO_ARCANA, NO_ARCANA)).toBe(2);
    const armored = { ...base, typeMoves: { 'heavy-armored': true } } as unknown as CharacterData;
    expect(computeTotalLoad(armored, NO_ARCANA, NO_ARCANA)).toBe(1);
  });

  it('adds checked possessions and the undefined count', () => {
    const data = {
      inventoryPossessions: [
        { checked: true, text: 'crate', weight: 2 },
        { checked: false, text: 'feather', weight: 1 },
      ],
      inventoryUndefined: 3,
    } as unknown as CharacterData;
    expect(computeTotalLoad(data, NO_ARCANA, NO_ARCANA)).toBe(5);
  });

  it('adds the weight of carried arcana looked up in the passed maps', () => {
    const data = {
      arcanaMinor: [{ id: 'm1', carried: true }, { id: 'm2', carried: false }],
      arcanaMajor: [{ id: 'M1', carried: true }],
    } as unknown as CharacterData;
    const minor: ArcanaWeights = { m1: { name: 'Trinket', weight: 1 }, m2: { name: 'Charm', weight: 2 } };
    const major: ArcanaWeights = { M1: { name: 'Relic', weight: 2 } };
    // carried m1 (1) + carried M1 (2); uncarried m2 ignored.
    expect(computeTotalLoad(data, minor, major)).toBe(3);
  });

  it('ignores carried arcana that have no weight in the maps', () => {
    const data = { arcanaMajor: [{ id: 'M1', carried: true }] } as unknown as CharacterData;
    // A weightless arcanum (e.g. a memorized spell) contributes nothing.
    expect(computeTotalLoad(data, NO_ARCANA, { M1: { name: 'A folktale' } })).toBe(0);
  });

  it('omits arcana load entirely when the maps are empty (weights not yet loaded)', () => {
    // Mirrors the brief window before useArcanaWeights resolves: with empty maps the carried
    // arcanum simply isn't counted. The Inventory UI guards this by showing a pending badge.
    const data = {
      inventoryChecked: { rope: true },
      arcanaMajor: [{ id: 'M1', carried: true }],
    } as unknown as CharacterData;
    expect(computeTotalLoad(data, NO_ARCANA, NO_ARCANA)).toBe(1);
  });
});
