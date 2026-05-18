import type { CharacterData, PlaybookType } from '@/types';

export type PossessionSubItem = { label: string; uses?: number; usesLabel?: string } | string;

export type Possession = {
  id: string;
  name: string;
  uses?: number;
  isCustom?: boolean;
  isAlwaysSelected?: boolean;
  stockKey?: Extract<keyof CharacterData, 'sacredPouchStock'>;
  stockCapacity?: (level: number) => number;
  label: string;
  subItems?: PossessionSubItem[];
};

export type PlaybookSpecialPossessions = {
  pickNote?: string;
  items: Possession[];
};

export const SPECIAL_POSSESSIONS_OPTIONS: Partial<Record<PlaybookType, PlaybookSpecialPossessions>> = {
  blessed: {
    pickNote: 'in addition to your sacred pouch',
    items: [
      {
        id: 'sacred-pouch',
        name: 'Sacred pouch',
        isAlwaysSelected: true,
        stockKey: 'sacredPouchStock',
        stockCapacity: (level) => 3 + Math.floor(level / 2),
        label: '**Sacred pouch** (*magical*): see Sacred Pouch section.',
      },
      {
        id: 'apiary',
        name: 'Apiary',
        label: '**Apiary**: beeswax, candles (*close*, *area*, lasts ~1 hr), honey, ◇ bee smokers, ◇ hat & veils, etc.',
      },
      {
        id: 'collected-offerings',
        name: 'Collected offerings',
        uses: 3,
        label: '**Collected offerings**: Expend a use to produce something valuable to a spirit of the wild. Restore 1 use each season.',
      },
      {
        id: 'goat-herd',
        name: 'Goat herd',
        label: '**Goat herd**: milk, cheese, pelts, meat, blood, horn, wool, etc. Each season, 1 in 4 chance of having a bezoar (swallow it to cure poison).',
      },
      {
        id: 'herb-garden',
        name: 'Herb garden',
        label: '**Herb garden**: shears, mortars & pestles, herbs, seeds, remedies, mild poisons, ◇ spades, etc. Each spring, d4 uses of bendis root (*reach*, *area*, burns ~1 hr, fumes repel perversions of nature).',
      },
      {
        id: 'mastiffs',
        name: 'Mastiffs',
        label: '**Mastiffs**, 2–3 followers (*alert*, *keen-nosed*, *fierce*, *overprotective*); HP 6; Damage d6 (*hand*, *grabby*); Instinct: to bark & threaten; Cost: affection.',
      },
      {
        id: 'custom',
        name: 'Custom (discuss with GM)',
        isCustom: true,
        label: '(discuss with GM)',
      },
    ],
  },
  fox: {
    items: [
      {
        id: 'burglars-kit',
        name: "Burglar's kit",
        label: "**Burglar's kit**",
        subItems: [
          'picks, files, snippers, wire',
          '◇ prybars',
          '◇ hacksaws',
          { label: '◇ a lantern (*close*, *area*)', uses: 5, usesLabel: 'hours' },
          '◇ a grappling hook, etc.',
        ],
      },
      {
        id: 'carpenters-tools',
        name: "Carpenter's tools",
        label: "**Carpenter's tools**: chisels, files, nails, pitch, ◇ prybars, ◇ saws, ◇◇ firkins, barrels, etc.",
      },
      {
        id: 'distillery',
        name: 'Distillery',
        label: '**Distillery**',
        subItems: [
          { label: 'skins of fine whisky (grants advantage to Persuade)', uses: 2, usesLabel: 'uses' },
          'copper tubes, malt',
          '◇◇ firkins, stills, barrels, etc.',
        ],
      },
      {
        id: 'hidden-stash',
        name: 'Hidden stash',
        uses: 3,
        label: '**Hidden stash**: each use produces valuables worth a purse of silvers (Value 2)',
      },
      {
        id: 'mummers-kit',
        name: "Mummer's kit",
        label: "**Mummer's kit**: juggling balls, whirlybird seeds, motley, ribbons, bells, ◇ puppets, ◇ a fiddle, etc.",
      },
      {
        id: 'scribes-tools',
        name: "Scribe's tools",
        label: "**Scribe's tools**: parchment, ink, pigments, vials, quills, ◇ a notebook, etc.",
      },
      {
        id: 'tannery',
        name: 'Tannery',
        label: '**Tannery** (or access to it): lime, acid, salts, thick gloves, ◇ a boiled leather cuirass (1 armor), etc.',
      },
      {
        id: 'trade-contacts',
        name: 'Trade contacts',
        label: '**Trade contacts**: small amounts of salt, glass, silk, spice, medicinal herbs, pigments, ivory, etc.',
      },
      {
        id: 'custom',
        name: 'Custom (discuss with GM)',
        isCustom: true,
        label: '(discuss with GM)',
      },
    ],
  },
};
