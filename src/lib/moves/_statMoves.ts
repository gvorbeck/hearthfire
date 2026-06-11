import type { MoveDefinition } from '@/types';

export const IMPROVED_STAT_BASE: Omit<MoveDefinition, 'id'> = {
  name: 'Improved Stat',
  leftControl: 3,
  body: [
    { kind: 'para', text: 'Each time you take this move, increase one of your stats by 1 (to a max of +2).' },
  ],
};

export const SUPERIOR_STAT_BASE: Omit<MoveDefinition, 'id'> = {
  name: 'Superior Stat',
  leftControl: 1,
  requiresLevel: 6,
  body: [
    { kind: 'para', text: 'Increase one of your stats by +1 (to a max of +3).' },
  ],
};
