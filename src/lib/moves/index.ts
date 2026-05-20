import type { PlaybookType } from '@/types';
import type { MoveDefinition } from '@/components/CharacterSheet/Move';
import { WOULD_BE_HERO_MOVES } from './would-be-hero';
import { BLESSED_MOVES } from './blessed';
import { SEEKER_MOVES } from './seeker';
import { JUDGE_MOVES } from './judge';
import { LIGHTBEARER_MOVES } from './lightbearer';
import { MARSHAL_MOVES } from './marshal';
import { RANGER_MOVES } from './ranger';
import { HEAVY_MOVES } from './heavy';
import { FOX_MOVES } from './fox';

export const PLAYBOOK_MOVES: Partial<Record<PlaybookType, MoveDefinition[]>> = {
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

export const BACKGROUND_FORCED_MOVES: Partial<Record<PlaybookType, Record<string, string[]>>> = {
  blessed: {
    initiate: ['blessed-rites-of-the-land'],
    'raised-by-wolves': ['blessed-trackless-step'],
    vessel: ['blessed-danus-grasp'],
  },
  marshal: {
    scion: ['marshal-veteran-crew'],
    luminary: ['marshal-we-happy-few'],
  },
  ranger: {
    'mighty-hunter': ['ranger-expert-tracker', 'ranger-stalker'],
    'wide-wanderer': ['ranger-mental-map'],
    'beast-bonded': ['ranger-animal-companion'],
  },
  seeker: {
    patriot: ['seeker-lets-make-a-deal'],
    antiquarian: ['seeker-polyglot'],
    'witch-hunter': ['seeker-everything-bleeds'],
  },
};

// Background grants are computed at render time so they survive background changes without writing to Firestore.
export const BACKGROUND_FORCED_CHECKLIST: Partial<Record<PlaybookType, Record<string, Record<string, string[]>>>> = {
  seeker: {
    patriot: { 'seeker-well-versed': ['sk-wv-things-below'] },
    antiquarian: { 'seeker-well-versed': ['sk-wv-makers'] },
  },
};
