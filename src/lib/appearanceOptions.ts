import type { PlaybookType } from '@/types';

export type AppearanceRows = string[][];

export const APPEARANCE_OPTIONS: Partial<Record<PlaybookType, AppearanceRows>> = {
  blessed: [
    ['fresh-faced', 'hale & hearty', 'gray & wizened'],
    ['imperious voice', 'raspy voice', 'soothing voice'],
    ['curvy', 'strapping', 'rail-thin', 'solid', 'willowy'],
    ['ceremonial robes', 'furs, leather', 'work clothes'],
  ],
  'would-be-hero': [
    ['still a child', 'young & beautiful', 'all grown up'],
    ['confident voice', 'earnest voice', 'quiet voice'],
    ['big', 'scrawny', 'sinewy', 'slender', 'thick'],
    ['back unbowed', 'jaw firmly set', 'soulful eyes'],
  ],
  seeker: [
    ['curiously young', 'world-weary', 'bent with years'],
    ['haunted voice', 'rich voice', 'whispery'],
    ['ink-stained fingers', 'sinewy hands', 'soft hands'],
    ['bony limbed', 'lean & lanky', 'short', 'thick-set'],
  ],
  ranger: [
    ['fledgling', 'prime specimen', 'long in the tooth'],
    ['barking voice', 'growling voice', 'sing-song voice'],
    ['compact & sturdy', 'long & lean', 'wolfish'],
    ['shaggy', 'threadbare', 'well-groomed'],
  ],
  marshal: [
    ['upstart youth', 'experienced & sober', 'grizzled'],
    ['clear voice', 'resonant voice', 'rumbling voice'],
    ['stern frown', 'grim-set jaw', 'knowing smirk'],
    ['badge of office', 'spit & polish', 'timeworn gear'],
  ],
  lightbearer: [
    ['a youthful glow', 'well-weathered', 'old & merry'],
    ['a lilting voice', 'a melodious voice', 'a soft voice'],
    ['beatific', 'ethereal', 'intense', 'jovial', 'serene'],
    ['fine robes', 'threadbare cloak', 'working clothes'],
  ],
  judge: [
    ['eager youth', 'in my prime', 'showing my years'],
    ['calm voice', 'booming voice', 'a voice that carries'],
    ['hard body', 'powerful frame', 'slim', 'well-fed'],
    ['polished gear', 'robes of office', 'modest clothes'],
  ],
  heavy: [
    ['young & brash', 'in my prime', 'old & leathery'],
    ['gravelly voice', 'hearty voice', 'soft-spoken'],
    ['giant frame', 'just ripped', 'stocky', 'wiry'],
    ['distinctive scars', 'oft-broken nose', 'missing bits'],
  ],
  fox: [
    ['young pup', '"responsible" adult', 'cagey old-timer'],
    ['a pleasant voice', 'sharp & nasally', 'well-spoken'],
    ['lithe', 'heavyset', 'gangly', 'like a whippin\' stick'],
    ['a light step', 'a brisk stride', 'more like a strut'],
  ],
};
