import { describe, it, expect } from 'vitest';
import { parseCharacters, parseContent, parseSteading } from '../../hooks/useGame';

describe('parseCharacters', () => {
  it('filters out null/undefined entries', () => {
    const raw = { characters: [{ id: '1', name: 'Aldric', playbook: 'heavy', level: 1 }, null, undefined] };
    const result = parseCharacters(raw as never);
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('1');
  });
});

describe('parseContent', () => {
  it('returns undefined when given a non-object', () => {
    expect(parseContent(null)).toBeUndefined();
    expect(parseContent('bad')).toBeUndefined();
  });

  it('defaults missing string fields to empty string', () => {
    const result = parseContent({});
    expect(result).toEqual({ excluded: '', veiled: '', specialHandling: '' });
  });
});

describe('parseSteading', () => {
  it('returns undefined when given a non-object', () => {
    expect(parseSteading(null)).toBeUndefined();
    expect(parseSteading(42)).toBeUndefined();
  });

  it('sets size to undefined when the enum value is unrecognized', () => {
    const result = parseSteading({ size: 'metropolis' });
    expect(result?.size).toBeUndefined();
  });

  it('accepts valid size enum values', () => {
    expect(parseSteading({ size: 'hamlet' })?.size).toBe('hamlet');
    expect(parseSteading({ size: 'village' })?.size).toBe('village');
    expect(parseSteading({ size: 'town' })?.size).toBe('town');
    expect(parseSteading({ size: 'city' })?.size).toBe('city');
  });
});
