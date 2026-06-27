import type { CharacterData } from '@/types';
import type { ArcanaWeights } from './useArcanaWeights';

export interface MainItem {
  id: string;
  label: string;
  weight: 1 | 2;
  uses?: number;
  usesLabel?: string;
}

export const MAIN_ITEMS: MainItem[] = [
  { id: 'supplies-1', label: '**Supplies** *(4+Prosperity uses ○○○○○)*', weight: 1, usesLabel: 'uses' },
  { id: 'supplies-2', label: '**More supplies** *(4+Prosperity uses ○○○○○)*', weight: 1, usesLabel: 'uses' },
  { id: 'supplies-3', label: '**Even more supplies** *(4+Prosperity uses ○○○○○)*', weight: 1, usesLabel: 'uses' },
  { id: 'mess-kit', label: '**Mess kit** *(requires fire & water; makes Supplies last longer)*', weight: 1 },
  { id: 'bedroll', label: '**Bedroll** *(recover 1d6 extra HP when you Make Camp)*', weight: 1 },
  { id: 'blanket', label: '**Blanket** *(warm)*', weight: 1 },
  { id: 'change-of-clothes', label: '**Change of clothes**', weight: 1 },
  { id: 'rope', label: '**Rope**, ~25 ft', weight: 1 },
  { id: 'shovel', label: '**Shovel**', weight: 1 },
  { id: 'sledge', label: '**Sledge/litter/travois**, roll-out', weight: 2 },
  { id: 'snow-shoes', label: '**Snow-shoes**', weight: 1 },
  { id: 'torch', label: '**Torch** *(lasts ~1 hour; reach, area, dangerous)*', weight: 1 },
  { id: 'oil-lamp', label: '**Oil lamp** *(○○○ hours, close, area, crude)*', weight: 1, uses: 3, usesLabel: 'hours' },
  { id: 'extra-oil', label: '**Extra oil** *(○○○○○ hours, for lamp/lantern, useless as a weapon)*', weight: 1, uses: 5, usesLabel: 'hours' },
  { id: 'firewood', label: '**Firewood** *(enough to last 1 full night, reach, area)*', weight: 2 },
  { id: 'hatchet', label: '**Hatchet**, iron *(hand, thrown, x piercing)*', weight: 1 },
  { id: 'mallet', label: '**Mallet**, iron and/or wood *(hand)*', weight: 1 },
  { id: 'mattock', label: '**Mattock**, iron *(close, x piercing, messy, awkward)*', weight: 1 },
  { id: 'maul', label: '**Maul**, iron *(close, forceful, awkward)*', weight: 2 },
  { id: 'staff', label: '**Staff** *(close)*', weight: 1 },
  { id: 'spear', label: '**Spear**, iron *(close, thrown, x piercing)*', weight: 1 },
  { id: 'long-spear', label: '**Long spear**, iron *(reach, x piercing)*', weight: 2 },
  { id: 'bow', label: '**Bow & iron arrows** *(near, x piercing, ○ low ammo, ○ all out)*', weight: 1, uses: 2, usesLabel: 'ammo' },
  { id: 'extra-arrows', label: '**Extra arrows** *(x piercing, ○ plenty left, ○ low ammo, ○ all out)*', weight: 1, uses: 3, usesLabel: 'ammo' },
  { id: 'javelins', label: '**Javelins**, a few, iron *(thrown, x piercing, +1 damage, ○ all out)*', weight: 1, uses: 1, usesLabel: 'ammo' },
  { id: 'shield', label: '**Shield** *(+1 armor, +1 Readiness on a 7+ to Defend)*', weight: 2 },
  { id: 'thick-hides', label: '**Thick hides** *(1 armor, warm)*', weight: 2 },
  { id: 'cloak', label: '**Cloak** *(warm)*', weight: 1 },
];

export interface SmallItem {
  id: string;
  label: string;
}

export const SMALL_ITEMS: SmallItem[] = [
  { id: 'knife', label: '**Knife** or dagger, iron *(hand)*' },
  { id: 'sling', label: '**Sling** *(near, reload, awkward, ○ low ammo, ○ all out)*' },
  { id: 'rushlight', label: '**Rushlight** *(lasts ~15-30 minutes, hand, crude)*' },
  { id: 'tinderbox', label: '**Tinderbox** *(slow)*' },
  { id: 'needle-thread', label: '**Needle & thread**' },
  { id: 'handful-coppers', label: '**Handful of coppers**' },
  { id: 'whisky', label: '**Whisky**, skin *(○○ uses)*' },
  { id: 'awl', label: '**Awl**' },
  { id: 'bowstring', label: '**Bowstring**' },
  { id: 'chalk', label: '**Chalk**' },
  { id: 'charcoal', label: '**Charcoal**' },
  { id: 'clay-jar', label: '**Clay jar**' },
  { id: 'cloth-rag', label: '**Cloth/rag**' },
  { id: 'comb', label: '**Comb**' },
  { id: 'cup', label: '**Cup**' },
  { id: 'extra-socks', label: '**Extra socks**' },
  { id: 'gloves', label: '**Gloves**' },
  { id: 'little-box', label: '**Little box**' },
  { id: 'sack', label: '**Sack** *(empty)*' },
  { id: 'sawdust', label: '**Sawdust**' },
  { id: 'tallow', label: '**Tallow**' },
  { id: 'twine', label: '**Twine/cord**' },
  { id: 'waterskin', label: '**Waterskin**' },
  { id: 'whetstone', label: '**Whetstone**' },
  { id: 'whistle', label: '**Whistle**' },
];

export const UNDEFINED_MAIN_COUNT = 9;
export const UNDEFINED_SMALL_COUNT = 6;

export const PROSPERITY_NOTES: Record<number, string> = { [-1]: 'Gear is crude', 0: 'Standard', 1: 'x = 1 piercing', 2: 'x = 2 piercing' };

export const getShieldWeight = (data: CharacterData | undefined): 1 | 2 =>
  data?.typeMoves?.['heavy-armored'] ? 1 : 2;

// Arcana weights live in the lazily-loaded datasets, so they're passed in as already-loaded
// maps (see useArcanaWeights). Until they arrive, callers should treat the total as pending
// rather than rendering a value that omits carried arcana.
export const computeTotalLoad = (
  data: CharacterData | undefined,
  minorWeights: ArcanaWeights,
  majorWeights: ArcanaWeights,
): number => {
  const checked = data?.inventoryChecked ?? {};
  const namedLoad = MAIN_ITEMS.reduce((sum, item) => {
    if (!checked[item.id]) return sum;
    const weight = item.id === 'shield' ? getShieldWeight(data) : item.weight;
    return sum + weight;
  }, 0);
  const possessionLoad = (data?.inventoryPossessions ?? []).reduce((sum, item) => item.checked ? sum + item.weight : sum, 0);
  const arcanaMinorLoad = (data?.arcanaMinor ?? []).reduce((sum, entry) => {
    if (!entry.carried) return sum;
    const weight = minorWeights[entry.id]?.weight;
    return weight ? sum + weight : sum;
  }, 0);
  const arcanaMajorLoad = (data?.arcanaMajor ?? []).reduce((sum, entry) => {
    if (!entry.carried) return sum;
    const weight = majorWeights[entry.id]?.weight;
    return weight ? sum + weight : sum;
  }, 0);
  return namedLoad + possessionLoad + arcanaMinorLoad + arcanaMajorLoad + (data?.inventoryUndefined ?? 0);
};
