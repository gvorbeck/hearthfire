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

// A back section carrying a multi-box consequence (three ◻ boxes → ids c1, c1#1, c1#2) plus a set of
// moves that exercise each lock rule: a marks-gated move, a consequence-count-gated move, and a
// parent/child pair where the child `requires` the parent.
const GATED: MajorArcanum = {
  id: 'gated',
  name: 'Gated',
  description: '',
  frontTrackers: [{ id: 'marks', label: 'marks', max: 4, role: 'marks' }],
  back: {
    label: 'Mysteries',
    sections: [
      {
        label: 'Moves',
        content: [
          {
            id: 'darksome',
            name: 'Darksome Vessel',
            requiresMarks: 4,
            body: [{ kind: 'para', text: 'Needs all four marks.' }],
          },
          {
            id: 'flicker',
            name: 'A Flickering Flame',
            requiresConsequences: 3,
            body: [{ kind: 'para', text: 'Needs three consequences.' }],
          },
          {
            id: 'parent',
            name: 'Parent Move',
            selectable: true,
            body: [{ kind: 'para', text: 'Pick me first.' }],
          },
          {
            id: 'child',
            name: 'Child Move',
            requires: ['parent'],
            body: [{ kind: 'para', text: 'Needs the parent.' }],
          },
        ],
      },
      {
        label: 'Consequences',
        // Back consequences take their box count from `checkboxes` (ids c1, c1#1, c1#2), not the glyph
        // prefix — that legacy prefix only drives box count for `mystery`-shape consequences.
        content: [
          { id: 'c1', value: 'Three-box consequence.', checkboxes: 3 },
        ],
      },
    ],
  },
};

const gatedEntry = (overrides: Partial<ArcanaMajorEntry> = {}): ArcanaMajorEntry => ({
  id: 'gated',
  marksValue: 0,
  mysteryMovesChecked: {},
  consequencesMarked: {},
  ...overrides,
});

const moveById = (id: string): MoveDefinition =>
  GATED.back!.sections[0].content.find((m) => (m as MoveDefinition).id === id) as MoveDefinition;

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

describe('useArcanumGating getConsequenceCheckedMarks', () => {
  it('derives each box from consequencesMarked in box order, box 0 unsuffixed', () => {
    // c1#1 marked but the base box and c1#2 not — the middle box reads checked, the others don't.
    const entry = gatedEntry({ consequencesMarked: { 'c1#1': true } });
    const { result } = renderHook(() => useArcanumGating(GATED, entry));
    expect(
      result.current.getConsequenceCheckedMarks('c1', '◻◻◻ Three-box consequence.'),
    ).toEqual([false, true, false]);
  });

  it('uses the explicit count over the glyph prefix when given', () => {
    const entry = gatedEntry({ consequencesMarked: { c1: true } });
    const { result } = renderHook(() => useArcanumGating(GATED, entry));
    // count=2 overrides the text's three glyphs, yielding two boxes.
    expect(result.current.getConsequenceCheckedMarks('c1', 'ignored', 2)).toEqual([
      true,
      false,
    ]);
  });
});

describe('useArcanumGating move lock requirements', () => {
  it('locks a requiresMarks move until the last mark is filled, then unlocks', () => {
    const locked = renderHook(() => useArcanumGating(GATED, gatedEntry({ marksValue: 3 })));
    expect(locked.result.current.getMoveGating(moveById('darksome')).requirement).toEqual([
      'Make the last mark',
    ]);

    const unlocked = renderHook(() => useArcanumGating(GATED, gatedEntry({ marksValue: 4 })));
    expect(unlocked.result.current.getMoveGating(moveById('darksome')).requirement).toEqual([]);
  });

  it('locks a requiresConsequences move until enough boxes are marked across all consequences', () => {
    // Two of the three boxes marked — still one short of the required three.
    const short = renderHook(() =>
      useArcanumGating(GATED, gatedEntry({ consequencesMarked: { c1: true, 'c1#1': true } })),
    );
    expect(short.result.current.getMoveGating(moveById('flicker')).requirement).toEqual([
      'Mark 3 Consequences',
    ]);

    const met = renderHook(() =>
      useArcanumGating(
        GATED,
        gatedEntry({ consequencesMarked: { c1: true, 'c1#1': true, 'c1#2': true } }),
      ),
    );
    expect(met.result.current.getMoveGating(moveById('flicker')).requirement).toEqual([]);
  });

  it('locks a child move until its required parent is checked, naming the parent', () => {
    const locked = renderHook(() => useArcanumGating(GATED, gatedEntry()));
    expect(locked.result.current.getMoveGating(moveById('child')).requirement).toEqual([
      'Requires Parent Move',
    ]);

    const met = renderHook(() =>
      useArcanumGating(GATED, gatedEntry({ mysteryMovesChecked: { parent: true } })),
    );
    expect(met.result.current.getMoveGating(moveById('child')).requirement).toEqual([]);
  });

  it('returns the shared empty gating for a move that is not in the arcanum', () => {
    const { result } = renderHook(() => useArcanumGating(GATED, gatedEntry()));
    expect(result.current.getMoveGating({ id: 'nope', name: 'Nope' }).requirement).toEqual([]);
    expect(result.current.getMoveGating({ id: 'nope', name: 'Nope' }).dotOverride).toBeUndefined();
  });
});
