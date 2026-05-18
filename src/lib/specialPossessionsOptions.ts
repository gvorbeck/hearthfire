import type { CharacterData, PlaybookType } from '@/types';

export type PossessionSubItem = { id?: string; label: string; uses?: number; usesLabel?: string; selectable?: boolean } | string;

export type Possession = {
  id: string;
  name: string;
  uses?: number;
  usesLabel?: string;
  isCustom?: boolean;
  isAlwaysSelected?: boolean;
  selectOneSubItem?: boolean;
  maxSubItems?: number;
  stockKey?: Extract<keyof CharacterData, 'sacredPouchStock'>;
  stockCapacity?: (level: number) => number;
  label: string;
  subItems?: PossessionSubItem[];
};

export type PlaybookSpecialPossessions = {
  pickNote?: string;
  items: Possession[];
};

const APIARY: Possession = {
  id: 'apiary',
  name: 'Apiary',
  label: '**Apiary**: beeswax, candles (*close*, *area*, lasts ~1 hr), honey, ◇ bee smokers, ◇ hats & veils, etc.',
};

const CARPENTERS_TOOLS: Possession = {
  id: 'carpenters-tools',
  name: "Carpenter's tools",
  label: "**Carpenter's tools**: chisels, files, nails, pitch, ◇ prybars, ◇ saws, ◇◇ firkins, barrels, etc.",
};

const CHIRURGEONS_TOOLS: Possession = {
  id: 'chirurgeons-tools',
  name: "Chirurgeon's tools",
  label: "**Chirurgeon's tools**: catgut, straps, bandages, tubes, poultices, willow bark, ◇ bonesaws, etc.",
};

const DISTILLERY: Possession = {
  id: 'distillery',
  name: 'Distillery',
  label: '**Distillery**',
  subItems: [
    { id: 'whisky', label: 'skins of fine whisky (grants advantage to Persuade)', uses: 2, usesLabel: 'uses' },
    'copper tubes, malt',
    '◇◇ firkins, stills, barrels, etc.',
  ],
};

const ENGINEERS_TOOLS: Possession = {
  id: 'engineers-tools',
  name: "Engineer's tools",
  label: "**Engineer's tools**: rulers, tapes, rods, plumb-bobs, ◇ tripods, ◇ block & tackles, wheelbarrow, etc.",
};

const SCRIBES_TOOLS: Possession = {
  id: 'scribes-tools',
  name: "Scribe's tools",
  label: "**Scribe's tools**: parchment, ink, pigments, vials, quills, ◇ a notebook, etc.",
};

const SMITHY: Possession = {
  id: 'smithy',
  name: 'Smithy',
  label: '**Smithy** (or access to it): iron goods, ingots, thick gloves, ◇ tongs, ◇ bellows, an anvil, etc.',
};

const CUSTOM: Possession = {
  id: 'custom',
  name: 'Custom (discuss with GM)',
  isCustom: true,
  label: '(discuss with GM)',
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
      { ...APIARY, label: '**Apiary**: beeswax, candles (*close*, *area*, lasts ~1 hr), honey, ◇ bee smokers, ◇ hat & veils, etc.' },
      {
        id: 'collected-offerings',
        name: 'Collected offerings',
        uses: 3,
        usesLabel: 'uses',
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
      CUSTOM,
    ],
  },
  heavy: {
    items: [
      DISTILLERY,
      CHIRURGEONS_TOOLS,
      {
        id: 'husbandry-tools',
        name: 'Husbandry tools',
        label: '**Husbandry tools**: brushes, muzzles, collars, feed, ◇ whips, ◇ bridles, etc. Gain advantage to Persuade domestic beasts (livestock, dogs, etc.).',
      },
      SMITHY,
      {
        id: 'stoneworkers-tools',
        name: "Stoneworker's tools",
        label: "**Stoneworker's tools**: chisels, drills, ◇ prybars, ◇ spikes, ◇ block & tackles, wheelbarrow, etc.",
      },
      {
        id: 'weapons-of-war',
        name: 'Weapons of war',
        maxSubItems: 3,
        label: '**Weapons of war**: choose up to 3 (now or later):',
        subItems: [
          { id: 'sword', label: '◇ **Sword**, iron (*close*, +1 damage)', selectable: true },
          { id: 'battleaxe', label: '◇ **Battleaxe**, iron (*close*, *messy*)', selectable: true },
          { id: 'warhammer', label: '◇ **Warhammer**, iron (*close*, 2 piercing)', selectable: true },
          { id: 'mace', label: '◇ **Mace** or **flail**, iron (*close*, *forceful*)', selectable: true },
          { id: 'crossbow', label: '◇ **Crossbow** (*far*, +1 damage, *reload*, x piercing)', uses: 2, usesLabel: 'low ammo / all out', selectable: true },
        ],
      },
      CUSTOM,
    ],
  },
  marshal: {
    items: [
      CHIRURGEONS_TOOLS,
      DISTILLERY,
      ENGINEERS_TOOLS,
      {
        id: 'personal-symbol',
        name: 'Personal symbol',
        label: '**Personal symbol** (a flag, crest, marking, etc.): when you ***display or reveal it in a dramatic fashion***, your crew holds +1 Loyalty (max 3).',
      },
      SCRIBES_TOOLS,
      {
        id: 'weapons-of-war',
        name: 'Weapons of war',
        maxSubItems: 3,
        label: '**Weapons of war**: choose up to 3 (now or later):',
        subItems: [
          { id: 'sword', label: '◇ **Sword**, iron (*close*, +1 damage)', selectable: true },
          { id: 'long-spear', label: '◇◇ **Long spear**, fine steel (*reach*, 2 piercing)', selectable: true },
          { id: 'battleaxe', label: '◇ **Battleaxe**, iron (*close*, *messy*)', selectable: true },
          { id: 'composite-bow', label: '◇ **Composite bow** (*far*, +1 damage, x piercing)', uses: 2, usesLabel: 'low ammo / all out', selectable: true },
        ],
      },
      CUSTOM,
    ],
  },
  lightbearer: {
    items: [
      APIARY,
      {
        id: 'books-and-scrolls',
        name: 'Books & scrolls',
        uses: 5,
        usesLabel: 'uses',
        label: '**Books & scrolls**: expend a use to consult your collection and turn a Know Things roll you just made into a 10+.',
      },
      {
        id: 'chandlery',
        name: 'Chandlery',
        label: '**Chandlery**: beeswax, candles (*close*, *area*, lasts ~1 hr), wicks, scented herbs, soap, lye, ash, etc.',
      },
      DISTILLERY,
      {
        id: 'glassworks',
        name: 'Glassworks',
        label: '**Glassworks**',
        subItems: [
          'vials, charms, lenses, sand, marbles, bellows, crucible',
          { id: 'lanterns', label: '◇ lanterns (*close*, *area*)', uses: 5, usesLabel: 'hours' },
          'etc.',
        ],
      },
      {
        id: 'holy-relics',
        name: 'Holy relics',
        uses: 3,
        usesLabel: 'uses',
        label: '**Holy relics**: if you have one in inventory when you Invoke the Sun God, you can mark a use in lieu of choosing a consequence.',
      },
      {
        id: 'luthiers-tools',
        name: "Luthier's tools",
        label: "**Luthier's tools**: chisels, files, catgut, various woods, stains, ◇ a lute, ◇ a fiddle, etc.",
      },
      CUSTOM,
    ],
  },
  judge: {
    pickNote: "in addition to your symbol of authority and scribe's kit",
    items: [
      {
        id: 'symbol-of-authority',
        name: 'Your symbol of authority',
        isAlwaysSelected: true,
        selectOneSubItem: true,
        label: '**Your symbol of authority** (pick 1):',
        subItems: [
          { id: 'black-iron-maul', label: '◇◇ **Black iron maul**, utterly immune to all magic (*close*, *forceful*, *awkward*, +1 damage)', selectable: true },
          { id: 'makerglass-shield', label: "◇◇ **Makerglass shield**, etched with Aratis's symbol (*indestructible*, +1 armor, +1 Readiness on a Defend 7+)", selectable: true },
          { id: 'helm', label: '◇ **Helm** set with a dark ice "jewel." Grants advantage to resist mind-affecting magic.', selectable: true },
        ],
      },
      { ...SCRIBES_TOOLS, isAlwaysSelected: true },
      {
        id: 'aviary',
        name: 'Aviary',
        label: '**Aviary**: thick gloves, bird hoods, tethers, seed, ◇ messenger birds, ◇ birdcages, etc.',
      },
      CARPENTERS_TOOLS,
      ENGINEERS_TOOLS,
      SMITHY,
      CUSTOM,
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
          { id: 'lantern', label: '◇ a lantern (*close*, *area*)', uses: 5, usesLabel: 'hours' },
          '◇ a grappling hook, etc.',
        ],
      },
      CARPENTERS_TOOLS,
      DISTILLERY,
      {
        id: 'hidden-stash',
        name: 'Hidden stash',
        uses: 3,
        usesLabel: 'uses',
        label: '**Hidden stash**: each use produces valuables worth a purse of silvers (Value 2)',
      },
      {
        id: 'mummers-kit',
        name: "Mummer's kit",
        label: "**Mummer's kit**: juggling balls, whirlybird seeds, motley, ribbons, bells, ◇ puppets, ◇ a fiddle, etc.",
      },
      SCRIBES_TOOLS,
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
      CUSTOM,
    ],
  },
};
