import { describe, it, expect } from 'vitest';
import { resolvePlaybookFeatures } from '../resolvePlaybookFeatures';

describe('resolvePlaybookFeatures', () => {
  it('returns {} when data is undefined', () => {
    expect(resolvePlaybookFeatures(undefined)).toEqual({});
  });

  it('returns {} when playbookFeatures is a non-object (null, string, array)', () => {
    expect(resolvePlaybookFeatures({ playbookFeatures: null as never })).toEqual({});
    expect(resolvePlaybookFeatures({ playbookFeatures: 'bad' as never })).toEqual({});
    expect(resolvePlaybookFeatures({ playbookFeatures: [] as never })).toEqual({});
  });

  it('drops null/undefined keys and keeps valid scalar, object, and array values', () => {
    const result = resolvePlaybookFeatures({
      playbookFeatures: {
        sacredPouchTrait: 'iron',
        foxTallTales: { tale1: true },
        crewIndividuals: [{ name: 'Mira', tag: 'scout', traits: 'brave' }],
        revenantInstinct: null as never,
        ghostInstinct: undefined,
      },
    });
    expect(result.sacredPouchTrait).toBe('iron');
    expect(result.foxTallTales).toEqual({ tale1: true });
    expect(result.crewIndividuals).toHaveLength(1);
    expect(result.revenantInstinct).toBeUndefined();
    expect(result.ghostInstinct).toBeUndefined();
  });
});
