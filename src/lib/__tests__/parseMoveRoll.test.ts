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
    expect(result).toEqual([{
      stat: 'INT',
      bands: [
        { label: '10+', min: 10, max: null },
        { label: '7-9', min: 7, max: 9 },
        { label: '6-', min: 0, max: 6 },
      ],
    }]);
  });

  it("parses an unbolded band roll (Death's Door style) with +nothing", () => {
    const result = parseMoveRoll(
      move([
        {
          kind: 'para',
          text: "When you **are dying**, roll +nothing: on a 10+, you return; on a 7-9, out of the action; on a 6-, choose 1:",
        },
        { kind: 'list', items: ['Make one last move', 'Refuse to go'] },
      ]),
    );
    expect(result?.[0]?.stat).toBe('nothing');
    expect(result?.[0]?.bands.map((b) => b.label)).toEqual(['10+', '7-9', '6-']);
  });

  it('parses a two-band 7+ move (no 6- band)', () => {
    const result = parseMoveRoll(
      move([{ kind: 'para', text: 'roll +WIS: on a 7+, it works.' }]),
    );
    expect(result?.[0]?.stat).toBe('WIS');
    expect(result?.[0]?.bands).toEqual([{ label: '7+', min: 7, max: null }]);
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
    expect(result?.[0]?.bands.map((b) => b.label)).toEqual(['12+', '10+', '7-9', '6-']);
  });

  it('returns null for a move with no roll', () => {
    expect(
      parseMoveRoll(move([{ kind: 'para', text: 'When you are touching the earth, you have 2 armor.' }])),
    ).toBeNull();
  });

  // Modifiers the sheet can't read roll from 0 and name the resource, so the player can dial the value
  // in by hand on the affordance's stepper.
  it('reports non-PC-stat modifiers as resource rolls', () => {
    for (const token of ['Favor', 'Population', 'Fortunes', 'Prosperity', 'Omens', 'Defenses', 'STAT']) {
      expect(
        parseMoveRoll(move([{ kind: 'para', text: `roll +${token}: on a 10+, good.` }])),
        `+${token} should produce a resource roll`,
      ).toMatchObject([{ stat: 'nothing', resource: token }]);
    }
  });

  it('keeps the resource spelled as the prose wrote it', () => {
    const result = parseMoveRoll(move([{ kind: 'para', text: 'spend 1-3 Favor and roll +Favor spent: on a 10+, good.' }]));
    expect(result?.[0]?.resource).toBe('Favor');
  });

  it('leaves `resource` unset for stat and +nothing rolls', () => {
    expect(parseMoveRoll(move([{ kind: 'para', text: 'roll +WIS: on a 10+, good.' }]))?.[0]?.resource).toBeUndefined();
    expect(parseMoveRoll(move([{ kind: 'para', text: 'roll +nothing: on a 10+, good.' }]))?.[0]?.resource).toBeUndefined();
  });

  // "Instead of rolling +STAT" is prose *about* rolling, not an instruction to roll — the trigger needs
  // the bare verb so a widened target group doesn't start lighting up narration.
  it('does not trigger on "rolling +X"', () => {
    expect(parseMoveRoll(move([{ kind: 'para', text: 'Instead of rolling +STAT, add +1.' }]))).toBeNull();
  });

  it('is case-insensitive on the roll trigger', () => {
    expect(parseMoveRoll(move([{ kind: 'para', text: 'Roll +Dex: on a 7+, ok.' }]))?.[0]?.stat).toBe('DEX');
  });

  it('returns null for an empty / bodyless move', () => {
    expect(parseMoveRoll({ id: 'm', name: 'M' })).toBeNull();
    expect(parseMoveRoll(move([]))).toBeNull();
  });

  it('does not treat a range like "7-9" as a "7-" miss band', () => {
    const result = parseMoveRoll(move([{ kind: 'para', text: 'roll +STR: on a 7-9, mixed.' }]));
    expect(result?.[0]?.bands).toEqual([{ label: '7-9', min: 7, max: 9 }]);
  });

  it('reads only the first stat in a multi-roll move', () => {
    const result = parseMoveRoll(
      move([
        { kind: 'para', text: 'First, roll +CHA: on a 10+, good. Later, roll +CON: on a 7-9, mixed.' },
      ]),
    );
    expect(result?.[0]?.stat).toBe('CHA');
  });

  // ── Ellipsis pattern (Defy Danger / Interfere) ──────────────────────────────
  it('parses an ellipsis roll with 6 stat targets (Defy Danger)', () => {
    const result = parseMoveRoll(
      move([
        { kind: 'para', text: 'When **danger looms**, roll...' },
        {
          kind: 'list',
          items: [
            '+STR to power through or test your might',
            '+DEX to employ speed, agility, or finesse',
            '+CON to endure or hold steady',
            '+INT to apply expertise or enact a clever plan',
            '+WIS to exert willpower or rely on your senses',
            '+CHA to charm, bluff, impress, or fit in',
          ],
        },
        { kind: 'para', text: 'On a 10+, great; on a 7-9, cost.' },
      ]),
    );
    expect(result).toHaveLength(6);
    expect(result?.map((r) => r.stat)).toEqual(['STR', 'DEX', 'CON', 'INT', 'WIS', 'CHA']);
    expect(result?.[0]?.bands.map((b) => b.label)).toEqual(['10+', '7-9']);
  });

  it('parses an ellipsis roll with unicode ellipsis (…)', () => {
    const result = parseMoveRoll(
      move([
        { kind: 'para', text: 'roll…' },
        { kind: 'list', items: ['+STR to smash', '+DEX to dodge'] },
        { kind: 'para', text: 'On a 10+, great; on a 7-9, cost; on a 6-, bad.' },
      ]),
    );
    expect(result).toHaveLength(2);
    expect(result?.map((r) => r.stat)).toEqual(['STR', 'DEX']);
  });

  it('does not treat numeric modifiers after ellipsis as stats (Wolf Pelt)', () => {
    const result = parseMoveRoll(
      move([
        {
          kind: 'para',
          text: 'Name your quarry and roll…\n\n… +1 if you have their scent;\n… +1 if they are alone, but -1 if not; and\n… -1 if they would not fear a pack of wolves.\n\n**On 7+**, you corner your prey.',
        },
      ]),
    );
    expect(result).toBeNull();
  });

  // ── Inline "or" pattern (Heavy Death's Door) ────────────────────────────────
  it('parses "roll +CON or +nothing" into two entries', () => {
    const result = parseMoveRoll(
      move([
        {
          kind: 'para',
          text: "When you **are at Death's Door**, you can roll +CON or +nothing (your choice). On a 7-9, recover.",
        },
      ]),
    );
    expect(result).toHaveLength(2);
    expect(result?.[0]?.stat).toBe('CON');
    expect(result?.[1]?.stat).toBe('nothing');
    expect(result?.[0]?.bands).toEqual(result?.[1]?.bands);
  });

  it('always returns an array for single-stat moves', () => {
    const result = parseMoveRoll(
      move([{ kind: 'para', text: 'roll +STR: on a 10+, hit.' }]),
    );
    expect(Array.isArray(result)).toBe(true);
    expect(result).toHaveLength(1);
  });

  // De-duplication: if a stat is mentioned twice, it only appears once.
  it('deduplicates stats in ellipsis moves', () => {
    const result = parseMoveRoll(
      move([
        { kind: 'para', text: 'roll...' },
        { kind: 'list', items: ['+STR to smash', '+STR to push'] },
        { kind: 'para', text: 'On a 10+, great.' },
      ]),
    );
    expect(result).toHaveLength(1);
    expect(result?.[0]?.stat).toBe('STR');
  });
});
