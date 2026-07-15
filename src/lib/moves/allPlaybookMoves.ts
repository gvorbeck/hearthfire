import type { PlaybookType, MoveDefinition } from '@/types';
import { WOULD_BE_HERO_MOVES } from './would-be-hero';
import { BLESSED_MOVES } from './blessed';
import { SEEKER_MOVES } from './seeker';
import { JUDGE_MOVES } from './judge';
import { LIGHTBEARER_MOVES } from './lightbearer';
import { MARSHAL_MOVES } from './marshal';
import { RANGER_MOVES } from './ranger';
import { HEAVY_MOVES } from './heavy';
import { FOX_MOVES } from './fox';

// Statically imports every playbook's moves — for the GM playbook's move search, which needs
// all playbooks at once. Character sheets don't import this; they use PLAYBOOK_MOVE_LOADERS
// in ./index.ts so only the active playbook's moves end up in that bundle.
export const ALL_PLAYBOOK_MOVES: Record<PlaybookType, MoveDefinition[]> = {
  'would-be-hero': WOULD_BE_HERO_MOVES,
  blessed: BLESSED_MOVES,
  seeker: SEEKER_MOVES,
  judge: JUDGE_MOVES,
  lightbearer: LIGHTBEARER_MOVES,
  marshal: MARSHAL_MOVES,
  ranger: RANGER_MOVES,
  heavy: HEAVY_MOVES,
  fox: FOX_MOVES,
};
