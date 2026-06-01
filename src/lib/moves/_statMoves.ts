import type { MoveDefinition } from '@/types';

export const IMPROVED_STAT_BASE: Omit<MoveDefinition, 'id'> = {
  name: 'Improved Stat',
  selectable: true,
  takes: 2,
  body: 'Each time you take this move, increase one of your stats by 1 (to a max of +2).',
};

export const SUPERIOR_STAT_BASE: Omit<MoveDefinition, 'id'> = {
  name: 'Superior Stat',
  selectable: true,
  requiresLevel: 6,
  body: 'Increase one of your stats by +1 (to a max of +3).',
};
