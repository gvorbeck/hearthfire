import { describe, it, expect } from 'vitest';
import type { DropdownGroup } from '@/components/ui';
import { filterLinkedTargets } from '../npcData';
import type { RelTarget } from '../npcData';

const groups: DropdownGroup<RelTarget>[] = [
  {
    label: 'Player Characters',
    options: [
      { value: 'pc::pc1', label: 'Hero' },
      { value: 'pc::pc2', label: 'Sage' },
    ],
  },
  {
    label: 'Stonetop Residents',
    options: [
      { value: 'resident::r1', label: 'Ada' },
      { value: 'resident::r2', label: 'Bram' },
    ],
  },
];

describe('filterLinkedTargets', () => {
  it('returns all options when nothing is taken', () => {
    const result = filterLinkedTargets(groups, new Set());
    expect(result).toEqual(groups);
  });

  it('drops options whose target is already linked by another row', () => {
    const result = filterLinkedTargets(groups, new Set(['resident::r1']));
    const values = result.flatMap((g) => g.options.map((o) => o.value));
    // Bram (r1) is gone; everyone else remains.
    expect(values).toEqual(['pc::pc1', 'pc::pc2', 'resident::r2']);
  });

  it('drops a group entirely once all its options are taken', () => {
    const result = filterLinkedTargets(groups, new Set(['pc::pc1', 'pc::pc2']));
    expect(result.map((g) => g.label)).toEqual(['Stonetop Residents']);
  });

  it('does not mutate the input groups', () => {
    const before = JSON.stringify(groups);
    filterLinkedTargets(groups, new Set(['pc::pc1']));
    expect(JSON.stringify(groups)).toBe(before);
  });
});
