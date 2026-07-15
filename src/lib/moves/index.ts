import type { PlaybookType } from '@/types';
import type { MoveDefinition } from '@/types';

// Each playbook's moves are loaded on demand (not statically imported here) so a character
// sheet's bundle only ever pulls in the ~250 lines for the one playbook it's showing, instead
// of all nine playbooks' move data (~2,200 lines) — mirrors the lazy-loading already used for
// per-playbook components in CharacterPlaybook.tsx.
export const PLAYBOOK_MOVE_LOADERS: Record<PlaybookType, () => Promise<MoveDefinition[]>> = {
  'would-be-hero': () => import('./would-be-hero').then((m) => m.WOULD_BE_HERO_MOVES),
  blessed: () => import('./blessed').then((m) => m.BLESSED_MOVES),
  seeker: () => import('./seeker').then((m) => m.SEEKER_MOVES),
  judge: () => import('./judge').then((m) => m.JUDGE_MOVES),
  lightbearer: () => import('./lightbearer').then((m) => m.LIGHTBEARER_MOVES),
  marshal: () => import('./marshal').then((m) => m.MARSHAL_MOVES),
  ranger: () => import('./ranger').then((m) => m.RANGER_MOVES),
  heavy: () => import('./heavy').then((m) => m.HEAVY_MOVES),
  fox: () => import('./fox').then((m) => m.FOX_MOVES),
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

// Crew tags granted "in addition to your usual picks": forced on and excluded
// from the tag pick limit, computed at render time like the other grants here.
export const BACKGROUND_GRANTED_CREW_TAGS: Partial<Record<PlaybookType, Record<string, string>>> = {
  marshal: {
    scion: 'respected',
    penitent: 'warriors',
    luminary: 'devoted',
  },
};

// Background grants are computed at render time so they survive background changes without writing to Firestore.
export const BACKGROUND_FORCED_CHECKLIST: Partial<Record<PlaybookType, Record<string, Record<string, string[]>>>> = {
  seeker: {
    patriot: { 'seeker-well-versed': ['sk-wv-things-below'] },
    antiquarian: { 'seeker-well-versed': ['sk-wv-makers'] },
  },
};

export { BASIC_MOVES } from './basic';
export { SPECIAL_MOVES } from './special';
export { FOLLOWER_MOVES } from './follower';
export { EXPEDITION_MOVES } from './expedition';
export { HOMEFRONT_MOVES } from './homefront';
export { CUSTOM_MOVES } from './custom';
