import { describe, it, expect, vi } from 'vitest';
import type { ArcanaMajorEntry } from '@/types';

// Tiny fixtures so withMarks resolves each entry's unlock threshold without pulling the real dataset:
// "cyclic" unlocks at its max (5, no unlockAt — the Rune-laden Scales shape); "per-mark" unlocks at 1.
vi.mock('@/lib/arcana/major', () => ({
  MAJOR_ARCANA: [
    { id: 'cyclic', name: 'Cyclic', description: '', frontTrackers: [{ id: 'marks', label: 'marks', max: 5, role: 'marks' }] },
    { id: 'per-mark', name: 'Per-mark', description: '', frontTrackers: [{ id: 'marks', label: 'marks', max: 4, role: 'marks', unlockAt: 1 }] },
    { id: 'no-marks', name: 'No marks', description: '', frontTrackers: [] },
  ],
}));

import { withMarks } from '../MajorArcanaPanel';

const entryFor = (id: string, overrides: Partial<ArcanaMajorEntry> = {}): ArcanaMajorEntry => ({
  id,
  marksValue: 0,
  mysteryMovesChecked: {},
  consequencesMarked: {},
  ...overrides,
});

describe('withMarks', () => {
  it('latches everUnlocked when marks reach an unlockAt-less tracker max', () => {
    expect(withMarks(entryFor('cyclic'), 4).everUnlocked).toBe(false);
    expect(withMarks(entryFor('cyclic'), 5).everUnlocked).toBe(true);
  });

  it('latches at unlockAt, not max, when the tracker specifies one', () => {
    expect(withMarks(entryFor('per-mark'), 0).everUnlocked).toBe(false);
    expect(withMarks(entryFor('per-mark'), 1).everUnlocked).toBe(true);
  });

  it('stays latched after marks are erased back to zero', () => {
    const unlocked = withMarks(entryFor('cyclic'), 5);
    expect(unlocked.everUnlocked).toBe(true);
    // The book's "erase all marks" step: marks drop to 0 but the earned reward must stay revealed.
    const erased = withMarks(unlocked, 0);
    expect(erased.marksValue).toBe(0);
    expect(erased.everUnlocked).toBe(true);
  });

  it('never un-latches an already-unlocked entry, even below the threshold', () => {
    const entry = entryFor('cyclic', { everUnlocked: true });
    expect(withMarks(entry, 2).everUnlocked).toBe(true);
  });

  it('sets the new marks value on the returned entry', () => {
    expect(withMarks(entryFor('cyclic'), 3).marksValue).toBe(3);
  });

  it('does not latch when the arcanum has no marks tracker', () => {
    expect(withMarks(entryFor('no-marks'), 10).everUnlocked).toBe(false);
  });
});
