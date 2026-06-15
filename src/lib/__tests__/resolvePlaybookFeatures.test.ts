import { describe, it, expect } from 'vitest';
import { resolvePlaybookFeatures, featurePatch } from '../resolvePlaybookFeatures';
import type { CharacterData } from '@/types';

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

describe('featurePatch', () => {
  it('merges the patch over the resolved existing features', () => {
    const data = { playbookFeatures: { sacredPouchTrait: 'iron', foxTallTales: { a: true } } } as CharacterData;
    expect(featurePatch(data, { foxTallTales: { a: true, b: true } })).toEqual({
      playbookFeatures: { sacredPouchTrait: 'iron', foxTallTales: { a: true, b: true } },
    });
  });

  it('produces a patch from a single key when there are no existing features', () => {
    expect(featurePatch(undefined, { sacredPouchTrait: 'silver' })).toEqual({
      playbookFeatures: { sacredPouchTrait: 'silver' },
    });
  });

  it('drops malformed existing features before merging (corrupt doc safety)', () => {
    const data = { playbookFeatures: { good: 'keep', bad: null } } as never;
    expect(featurePatch(data, { sacredPouchTrait: 'x' })).toEqual({
      playbookFeatures: { good: 'keep', sacredPouchTrait: 'x' },
    });
  });
});
