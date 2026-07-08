import { describe, it, expect } from 'vitest';
import { renderHook } from '@testing-library/react';
import type { ArcanaMajorEntry, MajorArcanum } from '@/types';
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
