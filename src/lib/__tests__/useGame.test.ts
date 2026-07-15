import { describe, it, expect } from 'vitest';
import { parseCharacterData, parseCharacters, parseContent, parseSteading } from '../../hooks/useGame';

describe('parseCharacters', () => {
  it('filters out null/undefined entries', () => {
    const raw = { characters: [{ id: '1', name: 'Aldric', playbook: 'heavy', level: 1 }, null, undefined] };
    const result = parseCharacters(raw as never);
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('1');
  });

  it('rejects entries with an unknown playbook or wrong-typed id/name', () => {
    const raw = {
      characters: [
        { id: '1', name: 'Ok', playbook: 'heavy', level: 1 },
        { id: '2', name: 'Bad PB', playbook: 'wizard', level: 1 },
        { id: 4, name: 'Numeric id', playbook: 'fox', level: 1 },
      ],
    };
    const result = parseCharacters(raw as never);
    expect(result.map((c) => c.id)).toEqual(['1']);
  });

  it('keeps a character with a missing or non-numeric level, repairing it to 1', () => {
    const raw = {
      characters: [
        { id: '1', name: 'Ok', playbook: 'heavy', level: 2 },
        { id: '2', name: 'No level', playbook: 'fox' },
        { id: '3', name: 'String level', playbook: 'ranger', level: 'five' },
      ],
    };
    const result = parseCharacters(raw as never);
    expect(result.map((c) => c.id)).toEqual(['1', '2', '3']);
    expect(result.find((c) => c.id === '1')!.level).toBe(2);
    expect(result.find((c) => c.id === '2')!.level).toBe(1);
    expect(result.find((c) => c.id === '3')!.level).toBe(1);
  });

  it('returns an empty array when characters is missing or not an array', () => {
    expect(parseCharacters({} as never)).toEqual([]);
    expect(parseCharacters({ characters: 'nope' } as never)).toEqual([]);
  });
});

describe('parseCharacterData', () => {
  it('returns undefined when given a non-object', () => {
    expect(parseCharacterData(null)).toBeUndefined();
    expect(parseCharacterData('bad')).toBeUndefined();
  });

  it('drops a record-shaped field whose value is the wrong primitive type', () => {
    const result = parseCharacterData({ typeMoves: { move1: true, move2: 'yes' } });
    expect(result?.typeMoves).toEqual({ move1: true });
  });

  it('drops arcanaMajor entirely when it is not an array, instead of throwing', () => {
    const result = parseCharacterData({ arcanaMajor: 'not-an-array' });
    expect(result?.arcanaMajor).toBeUndefined();
  });

  it('drops individual arcana entries missing an id, keeping well-formed ones', () => {
    const result = parseCharacterData({
      arcanaMajor: [
        { id: 'a1', marksValue: 2, consequencesMarked: { c1: true } },
        { marksValue: 3 }, // missing id -> dropped
      ],
    });
    expect(result?.arcanaMajor).toHaveLength(1);
    expect(result?.arcanaMajor?.[0].id).toBe('a1');
  });

  it('drops playbookFeatures entirely when it is not an object', () => {
    const result = parseCharacterData({ playbookFeatures: 'corrupt-string' });
    expect(result?.playbookFeatures).toBeUndefined();
  });

  it('keeps well-formed playbookFeatures, dropping malformed sub-fields', () => {
    const result = parseCharacterData({
      playbookFeatures: { foxTallTales: { tale1: true }, heavyViolence: null },
    });
    expect(result?.playbookFeatures).toEqual({ foxTallTales: { tale1: true } });
  });

  it('filters nested checklist maps, dropping non-object inner values', () => {
    const result = parseCharacterData({
      typeMoveCheckList: { move1: { box1: true, box2: 'nope' }, move2: 'not-a-map' },
    });
    expect(result?.typeMoveCheckList).toEqual({ move1: { box1: true } });
  });
});

describe('parseCharacters', () => {
  it('validates nested character.data through parseCharacterData', () => {
    const raw = {
      characters: [
        { id: '1', name: 'Ok', playbook: 'heavy', level: 1, data: { statHp: '10', arcanaMajor: 'bad' } },
      ],
    };
    const result = parseCharacters(raw as never);
    expect(result[0].data?.statHp).toBe('10');
    expect(result[0].data?.arcanaMajor).toBeUndefined();
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

  // parseDebilities (module-private) is exercised through parseSteading.
  it('keeps only boolean debility flags and drops the rest', () => {
    const result = parseSteading({
      debilities: { diminished: true, lacking: 'yes', malcontent: false },
    });
    expect(result?.debilities).toEqual({ diminished: true, lacking: undefined, malcontent: false });
  });

  // parseNpc / parseNpcs / parseNpcRelationship (module-private) via parseSteading.
  it('parses residents, dropping NPCs missing an id or name', () => {
    const result = parseSteading({
      residents: [
        { id: 'n1', name: 'Mara', occupation: 'smith' },
        { id: 'n2' }, // missing name -> dropped
        { name: 'No id' }, // missing id -> dropped
      ],
    });
    expect(result?.residents).toHaveLength(1);
    expect(result?.residents?.[0]).toMatchObject({ id: 'n1', name: 'Mara', occupation: 'smith' });
  });

  it('keeps only well-formed NPC relationships', () => {
    const result = parseSteading({
      residents: [{
        id: 'n1', name: 'Mara',
        relationships: [
          { id: 'r1', type: 'ally', targetId: 'p1', targetKind: 'pc' },
          { id: 'r2', type: 'rival', targetId: 'p2', targetKind: 'galaxy' }, // bad targetKind
        ],
      }],
    });
    expect(result?.residents?.[0].relationships).toHaveLength(1);
    expect(result?.residents?.[0].relationships?.[0].id).toBe('r1');
  });

  // parseGmImprovement (module-private) via parseSteading.
  it('falls back to a legacy id for gm improvements missing an id', () => {
    const result = parseSteading({
      gmImprovements: [
        { title: 'A', summary: 's', requirements: 'r', effects: 'e', completed: false },
        { id: 'real', title: 'B', summary: 's', requirements: 'r', effects: 'e', completed: true, category: 'asset' },
        { title: 'incomplete' }, // missing required fields -> dropped
      ],
    });
    expect(result?.gmImprovements).toHaveLength(2);
    expect(result?.gmImprovements?.[0].id).toBe('gm-imp-legacy-0');
    expect(result?.gmImprovements?.[1].id).toBe('real');
    expect(result?.gmImprovements?.[1].category).toBe('asset');
  });

  it('nulls out an unrecognized gm-improvement category', () => {
    const result = parseSteading({
      gmImprovements: [{ id: 'x', title: 'A', summary: 's', requirements: 'r', effects: 'e', completed: false, category: 'bogus' }],
    });
    expect(result?.gmImprovements?.[0].category).toBeNull();
  });

  it('keeps only boolean improvement-map values', () => {
    const result = parseSteading({ improvements: { wall: true, gate: 'open', moat: false } });
    expect(result?.improvements).toEqual({ wall: true, moat: false });
  });
});
