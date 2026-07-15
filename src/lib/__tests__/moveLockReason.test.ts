import { describe, it, expect } from 'vitest';
import { getLockReason } from '../moveLockReason';
import type { MoveDefinition } from '@/types';

const move = (overrides: Partial<MoveDefinition> & { id: string; name: string }): MoveDefinition => overrides;

describe('getLockReason', () => {
  const cases: {
    name: string;
    move: MoveDefinition;
    typeMoves: MoveDefinition[];
    level: number;
    selected: Record<string, boolean>;
    expected: string[];
  }[] = [
    {
      name: 'unlocked move with no constraints',
      move: move({ id: 'a', name: 'Move A' }),
      typeMoves: [],
      level: 1,
      selected: {},
      expected: [],
    },
    {
      name: 'excludes: locked when the conflicting move is selected at level 1',
      move: move({ id: 'a', name: 'Move A', excludes: ['b'] }),
      typeMoves: [move({ id: 'b', name: 'Move B' })],
      level: 1,
      selected: { b: true },
      expected: ['Conflicts with Move B'],
    },
    {
      name: 'excludes: unlocked when the conflicting move is not selected',
      move: move({ id: 'a', name: 'Move A', excludes: ['b'] }),
      typeMoves: [move({ id: 'b', name: 'Move B' })],
      level: 1,
      selected: {},
      expected: [],
    },
    {
      name: 'excludes: bypassed once level is above 1',
      move: move({ id: 'a', name: 'Move A', excludes: ['b'] }),
      typeMoves: [move({ id: 'b', name: 'Move B' })],
      level: 2,
      selected: { b: true },
      expected: [],
    },
    {
      name: 'excludes: id referencing a move not in typeMoves is ignored',
      move: move({ id: 'a', name: 'Move A', excludes: ['missing'] }),
      typeMoves: [],
      level: 1,
      selected: { missing: true },
      expected: [],
    },
    {
      name: 'requiresLevel: locked below the required level',
      move: move({ id: 'a', name: 'Move A', requiresLevel: 5 }),
      typeMoves: [],
      level: 3,
      selected: {},
      expected: ['Requires Level 5+'],
    },
    {
      name: 'requiresLevel: unlocked at exactly the required level',
      move: move({ id: 'a', name: 'Move A', requiresLevel: 5 }),
      typeMoves: [],
      level: 5,
      selected: {},
      expected: [],
    },
    {
      name: 'requires: locked when the prerequisite is unselected',
      move: move({ id: 'a', name: 'Move A', requires: ['b'] }),
      typeMoves: [move({ id: 'b', name: 'Move B' })],
      level: 1,
      selected: {},
      expected: ['Requires Move B'],
    },
    {
      name: 'requires: unlocked when the prerequisite is selected',
      move: move({ id: 'a', name: 'Move A', requires: ['b'] }),
      typeMoves: [move({ id: 'b', name: 'Move B' })],
      level: 1,
      selected: { b: true },
      expected: [],
    },
    {
      name: 'requires: a startingMove prerequisite counts as met even when unselected',
      move: move({ id: 'a', name: 'Move A', requires: ['b'] }),
      typeMoves: [move({ id: 'b', name: 'Move B', startingMove: true })],
      level: 1,
      selected: {},
      expected: [],
    },
    {
      name: 'requires: multiple unmet prerequisites join with "and"',
      move: move({ id: 'a', name: 'Move A', requires: ['b', 'c'] }),
      typeMoves: [move({ id: 'b', name: 'Move B' }), move({ id: 'c', name: 'Move C' })],
      level: 1,
      selected: {},
      expected: ['Requires Move B and Move C'],
    },
    {
      name: 'requiresLevel and requires combine into one "Requires" reason',
      move: move({ id: 'a', name: 'Move A', requiresLevel: 4, requires: ['b'] }),
      typeMoves: [move({ id: 'b', name: 'Move B' })],
      level: 1,
      selected: {},
      expected: ['Requires Level 4+ and Move B'],
    },
    {
      name: 'excludes takes precedence over an unmet requires at level 1',
      move: move({ id: 'a', name: 'Move A', excludes: ['b'], requires: ['c'] }),
      typeMoves: [move({ id: 'b', name: 'Move B' }), move({ id: 'c', name: 'Move C' })],
      level: 1,
      selected: { b: true },
      expected: ['Conflicts with Move B'],
    },
  ];

  it.each(cases)('$name', ({ move, typeMoves, level, selected, expected }) => {
    expect(getLockReason(move, typeMoves, level, selected)).toEqual(expected);
  });
});
