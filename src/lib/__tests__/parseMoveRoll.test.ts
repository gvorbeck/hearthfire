import { describe, it, expect } from 'vitest';
import { parseMoveRoll } from '../parseMoveRoll';
import type { MoveDefinition } from '@/types';

const move = (body: MoveDefinition['body']): MoveDefinition => ({ id: 'm', name: 'M', body });

describe('parseMoveRoll', () => {
  it('parses a bolded three-band stat roll (blessed.ts style)', () => {
    const result = parseMoveRoll(
      move([
        {
          kind: 'para',
          text: 'When you **craft a charm**, roll +INT: **on a 10+**, they ignore the harm; **on a 7-9**, half; **on a 6-**, normally.',
        },
      ]),
    );
    expect(result).toEqual({
      stat: 'INT',
      bands: [
        { label: '10+', min: 10, max: null },
        { label: '7-9', min: 7, max: 9 },
        { label: '6-', min: 0, max: 6 },
      ],
    });
  });

  it('parses an unbolded band roll (Death’s Door style) with +nothing', () => {
    const result = parseMoveRoll(
      move([
        {
          kind: 'para',
          text: "When you **are dying**, roll +nothing: on a 10+, you return; on a 7-9, out of the action; on a 6-, choose 1:",
        },
        { kind: 'list', items: ['Make one last move', 'Refuse to go'] },
      ]),
    );
    expect(result?.stat).toBe('nothing');
    expect(result?.bands.map((b) => b.label)).toEqual(['10+', '7-9', '6-']);
  });

  it('parses a two-band 7+ move (no 6- band)', () => {
    const result = parseMoveRoll(
      move([{ kind: 'para', text: 'roll +WIS: on a 7+, it works.' }]),
    );
    expect(result?.stat).toBe('WIS');
    expect(result?.bands).toEqual([{ label: '7+', min: 7, max: null }]);
  });

  it('parses a 12+ crit band alongside the standard bands', () => {
    const result = parseMoveRoll(
      move([
        {
          kind: 'para',
          text: 'roll +CON: on a 12+, critical; on a 10+, good; on a 7-9, mixed; on a 6-, bad.',
        },
      ]),
    );
    expect(result?.bands.map((b) => b.label)).toEqual(['12+', '10+', '7-9', '6-']);
  });

  it('reads only the first stat in a multi-roll move', () => {
    const result = parseMoveRoll(
      move([
        { kind: 'para', text: 'First, roll +CHA: on a 10+, good. Later, roll +CON: on a 7-9, mixed.' },
      ]),
    );
    expect(result?.stat).toBe('CHA');
  });

  it('returns null for a move with no roll', () => {
    expect(
      parseMoveRoll(move([{ kind: 'para', text: 'When you are touching the earth, you have 2 armor.' }])),
    ).toBeNull();
  });

  it('returns null for non-PC-stat modifiers (the ignore tail)', () => {
    for (const token of ['favor', 'population', 'fortunes', 'prosperity', 'omens', 'defenses', 'stat']) {
      expect(
        parseMoveRoll(move([{ kind: 'para', text: `roll +${token}: on a 10+, good.` }])),
        `+${token} should not produce a roll`,
      ).toBeNull();
    }
  });

  it('is case-insensitive on the roll trigger', () => {
    expect(parseMoveRoll(move([{ kind: 'para', text: 'Roll +Dex: on a 7+, ok.' }]))?.stat).toBe('DEX');
  });

  it('returns null for an empty / bodyless move', () => {
    expect(parseMoveRoll({ id: 'm', name: 'M' })).toBeNull();
    expect(parseMoveRoll(move([]))).toBeNull();
  });

  it('does not treat a range like "7-9" as a "7-" miss band', () => {
    const result = parseMoveRoll(move([{ kind: 'para', text: 'roll +STR: on a 7-9, mixed.' }]));
    expect(result?.bands).toEqual([{ label: '7-9', min: 7, max: 9 }]);
  });
});
