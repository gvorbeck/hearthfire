import { describe, it, expect } from 'vitest';
import { renderHook } from '@testing-library/react';
import type { ArcanaMajorEntry, MajorArcanum, MoveDefinition } from '@/types';
import { useArcanumGating } from '../useArcanumGating';

// Stable references hoisted outside the render callback so the hook's memos/effects don't re-fire on
// every render (see the renderHook hang note). A minimal arcanum whose marks unlock at its max (5) —
// the Rune-laden Scales shape (no unlockAt): the reveal is meant to survive erasing marks to zero.
const CYCLIC: MajorArcanum = {
  id: 'cyclic',
  name: 'Cyclic',
  description: '',
  frontTrackers: [{ id: 'marks', label: 'marks', max: 5, role: 'marks' }],
  back: { label: 'Mysteries', sections: [{ label: 'Moves', content: [] }] },
};

const entryFor = (overrides: Partial<ArcanaMajorEntry> = {}): ArcanaMajorEntry => ({
  id: 'cyclic',
  marksValue: 0,
  mysteryMovesChecked: {},
  consequencesMarked: {},
  ...overrides,
});

// A move with a dot control plus a consequence whose `widenDots` action targets it — the Storm
// Markings shape, where marking "gain +1 Fury" widens Storm's Fury from 3 to 4 dots.
const WIDENING: MajorArcanum = {
  id: 'widening',
  name: 'Widening',
  description: '',
  frontTrackers: [{ id: 'marks', label: 'marks', max: 3, role: 'marks' }],
  back: {
    label: 'Mysteries',
    sections: [
      {
        label: 'Moves',
        content: [
          {
            id: 'furious',
            name: 'Furious',
            rightControl: [{ type: 'dot', number: 3, label: 'Fury' }],
            body: [{ kind: 'para', text: 'Hold Fury.' }],
          },
        ],
      },
      {
        label: 'Consequences',
        content: [
          {
            id: 'widen-c1',
            value: 'Gain +1 Fury.',
            actions: [{ type: 'widenDots', targetId: 'furious', amount: 1 }],
          },
        ],
      },
    ],
  },
};

describe('useArcanumGating unlocked', () => {
  it('is locked before marks reach the threshold and no flag is set', () => {
    const entry = entryFor({ marksValue: 3 });
    const { result } = renderHook(() => useArcanumGating(CYCLIC, entry));
    expect(result.current.unlocked).toBe(false);
  });

  it('unlocks on the fallback path when marks reach the threshold without the flag', () => {
    // A pre-existing entry (unlocked under the old behavior, never latched) still resolves unlocked.
    const entry = entryFor({ marksValue: 5 });
    const { result } = renderHook(() => useArcanumGating(CYCLIC, entry));
    expect(result.current.unlocked).toBe(true);
  });

  it('stays unlocked via everUnlocked even at zero marks', () => {
    // The erase-to-zero case: marks are back to 0 but the latch keeps the Mysteries revealed.
    const entry = entryFor({ marksValue: 0, everUnlocked: true });
    const { result } = renderHook(() => useArcanumGating(CYCLIC, entry));
    expect(result.current.unlocked).toBe(true);
  });
});

describe('useArcanumGating widenDots consequence', () => {
  const furious = WIDENING.back!.sections[0].content[0] as MoveDefinition;
  const widenEntry = (overrides: Partial<ArcanaMajorEntry> = {}): ArcanaMajorEntry => ({
    id: 'widening',
    marksValue: 0,
    mysteryMovesChecked: {},
    consequencesMarked: {},
    ...overrides,
  });

  it('leaves the dot control unchanged while the consequence is unmarked', () => {
    const { result } = renderHook(() => useArcanumGating(WIDENING, widenEntry()));
    expect(result.current.getMoveGating(furious).dotOverride).toBeUndefined();
  });

  it('widens the target move by the amount once the consequence is marked', () => {
    const entry = widenEntry({ consequencesMarked: { 'widen-c1': true } });
    const { result } = renderHook(() => useArcanumGating(WIDENING, entry));
    expect(result.current.getMoveGating(furious).dotOverride).toEqual([
      { type: 'dot', number: 4, label: 'Fury' },
    ]);
  });
});
