import { describe, it, expect } from 'vitest';
import { rollNotation } from '../diceNotation';

// Deterministic rng: yields the given faces for a die with `sides` sides, in order. (face-1)/sides + a
// nudge lands floor(r*sides)+1 on the face.
const seq = (sides: number, faces: number[]) => {
  let i = 0;
  return () => (faces[i++ % faces.length] - 1 + 0.5) / sides;
};

const total = (input: string, rng?: () => number) => {
  const r = rollNotation(input, rng);
  if (!r.ok) throw new Error(r.error);
  return r.outcome;
};

describe('rollNotation', () => {
  it('rolls NdS and sums', () => {
    const o = total('3d6', seq(6, [2, 5, 6]));
    expect(o.total).toBe(13);
    expect(o.breakdown).toBe('[2, 5, 6]');
  });

  it('treats a missing count as 1 and ignores case/whitespace', () => {
    const o = total(' D20 ', seq(20, [17]));
    expect(o.notation).toBe('d20');
    expect(o.total).toBe(17);
  });

  it('applies flat modifiers', () => {
    expect(total('2d6+3', seq(6, [1, 2])).total).toBe(6);
    expect(total('2d6-3', seq(6, [1, 2])).total).toBe(0);
  });

  it('keeps highest / lowest', () => {
    expect(total('4d6kh3', seq(6, [1, 6, 5, 3])).total).toBe(14);
    expect(total('4d6k3', seq(6, [1, 6, 5, 3])).total).toBe(14);
    expect(total('2d20kl1', seq(20, [4, 18])).total).toBe(4);
  });

  it('drops lowest / highest and marks them in the breakdown', () => {
    const o = total('4d6dl1', seq(6, [1, 6, 5, 3]));
    expect(o.total).toBe(14);
    expect(o.breakdown).toBe('[(1), 6, 5, 3]');
    expect(total('4d6dh1', seq(6, [1, 6, 5, 3])).total).toBe(9);
  });

  it('explodes max-face dice', () => {
    // 6 explodes into 6 which explodes into 2.
    const o = total('1d6!', seq(6, [6, 6, 2]));
    expect(o.total).toBe(14);
    expect(o.breakdown).toBe('[6, 6, 2]');
  });

  it('supports percentile and fudge dice', () => {
    expect(total('d%', seq(100, [42])).total).toBe(42);
    const f = total('4dF', () => 0.99); // top third → +1 each
    expect(f.total).toBe(4);
  });

  it('handles multiple groups, multiplication, division and parentheses', () => {
    expect(total('1d6+1d4', () => 0).total).toBe(2); // rng 0 → face 1 on each group
    expect(total('2*3+4').total).toBe(10);
    expect(total('(1d8+2)*2', seq(8, [3])).total).toBe(10);
    expect(total('7/2').total).toBe(3);
    expect(total('-2+5').total).toBe(3);
  });

  it('accepts × and ÷', () => {
    expect(total('3×2÷4').total).toBe(1);
  });

  it.each([
    ['', /Enter a roll/],
    ['2d', /sides/],
    ['d1', /sides/],
    ['d1001', /sides/],
    ['0d6', /1–100/],
    ['101d6', /1–100/],
    ['2d6+', /ends early/],
    ['2d6)', /Unexpected/],
    ['(2d6', /closing/],
    ['hello', /Unexpected/],
    ['5/0', /divide/],
    ['4dF!', /explode/],
  ])('rejects %j', (input, message) => {
    const r = rollNotation(input);
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error).toMatch(message);
  });

  it('caps total dice per roll (including explosions)', () => {
    const r = rollNotation('100d6+100d6+100d6+1d6', () => 0.5);
    expect(r.ok).toBe(false);
    // Always-max exploding dice would loop forever without the cap.
    const bomb = rollNotation('1d6!', () => 0.999);
    expect(bomb.ok).toBe(false);
  });

  it('rejects absurdly long numbers', () => {
    expect(rollNotation('99999999999*99999999999').ok).toBe(false);
  });
});
