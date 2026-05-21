import type { MoveDefinition } from '@/components/CharacterSheet/Move';

export const LIGHTBEARER_INVOCATIONS: MoveDefinition[] = [
  {
    id: 'inv-bath-of-healing-light',
    name: 'Bath of Healing Light',
    selectable: true,
    body: 'Cup your hands around your light and focus it. Your patient… (pick 2):',
    list: [
      'Regains 5 HP (can pick this twice)',
      'Clears a debility (can pick this twice)',
      'Has one of their problematic wounds stabilized',
      'Recovers from a minor condition (drunk, etc.)',
    ],
    footer: [
      '**Reduced**: pick only 1 (instead of 2).',
      '**Empowered**: add these to your possible choices: Regains 10 HP (can pick this twice); Fully recovers from a problematic wound; Is cured of a dire affliction, poison, or disease.',
    ],
  },
  {
    id: 'inv-blinding-light',
    name: 'Blinding Light *(ongoing)*',
    selectable: true,
    body: 'Your light blazes. Any in range who look at it are temporarily blinded. Those not looking at it directly must avert their eyes. You are unaffected.',
    footer: [
      '**Reduced**: the light flares only for a moment.',
      '**Empowered**: if you wish, your allies are unaffected.',
    ],
  },
  {
    id: 'inv-cleansing-light',
    name: 'Cleansing Light',
    selectable: true,
    body: 'Your light flares, dispelling magical effects within range. Potent, lasting magics are merely suppressed, and slowly return to power once removed from your light.',
    footer: [
      '**Reduced**: potent, lasting magics are unaffected; other magical effects are merely suppressed.',
      '**Empowered**: the invocation is *ongoing*; while it lasts, any magical effects created in or brought into range are dispelled/suppressed.',
    ],
  },
  {
    id: 'inv-cold-light-of-day',
    name: 'Cold Light of Day *(ongoing)*',
    selectable: true,
    body: 'All in your light appears as it really is, without the benefit of illusion, shapeshifting, or disguise.',
    footer: [
      '**Reduced**: it lasts only a few moments, just long enough to glimpse the truth.',
      '**Empowered**: illusions in the light are dispelled and shapeshifters are momentarily stunned.',
    ],
  },
  {
    id: 'inv-dancing-light',
    name: 'Dancing Light *(ongoing)*',
    selectable: true,
    body: 'Your light takes to the air, floating as you direct it, untethered from its fuel. You can move it anywhere that you can see it, and even change its shape or color.',
    footer: [
      '**Reduced**: it dims, reducing its range by one step.',
      '**Empowered**: you can use another Invocation through the Dancing Light while it is *ongoing*.',
    ],
  },
  {
    id: 'inv-go-back-to-the-shadow',
    name: 'Go Back to the Shadow',
    selectable: true,
    body: 'Spirits of darkness in your light take 2d8 damage (ignores armor). Roll damage for each spirit separately. A spirit reduced to 0 HP is either banished from this world or back to whatever tethers it here.',
    footer: [
      '**Reduced**: affected spirits take only 1d8 damage.',
      '**Empowered**: a spirit reduced to 0 HP is either utterly destroyed OR it\'s banished from the world and anything tethering it here is destroyed (GM\'s choice).',
    ],
  },
  {
    id: 'inv-hold-back-the-darkness',
    name: 'Hold Back the Darkness *(ongoing)*',
    selectable: true,
    body: 'Spirits and creatures of darkness are repelled by your light and cannot approach. The cowardly or mindless flee outright. Those forced into range of your light deal damage with disadvantage.',
    footer: [
      '**Reduced**: you must maintain an unbroken litany of prayers in order to maintain the effect.',
      '**Empowered**: affected entities that are forced into range of your light are vulnerable to mundane weapons, their supernatural defenses suppressed.',
    ],
  },
  {
    id: 'inv-moth-to-a-flame',
    name: 'Moth to a Flame *(ongoing)*',
    selectable: true,
    body: 'Name an individual or type of mortal creature. They gaze raptly at your light and will follow it, slowly. The effect ends if they take damage.',
    footer: [
      '**Reduced**: it lasts only briefly OR only some of the named creatures are affected (GM\'s choice).',
      '**Empowered**: the effect continues for a few moments after they first take damage. Taking damage a second time ends the effect immediately.',
    ],
  },
  {
    id: 'inv-terrible-as-the-dawn',
    name: 'Terrible as the Dawn *(ongoing)*',
    selectable: true,
    body: 'Name an individual or type of mortal creature. Your light fills them with dread, causing them to recoil and back away. The cowardly flee outright.',
    footer: [
      '**Reduced**: all mortal creatures but you are affected, including your allies.',
      '**Empowered**: even the brave must cower or flee.',
    ],
  },
  {
    id: 'inv-warmth-of-the-sun',
    name: 'Warmth of the Sun *(ongoing)*',
    selectable: true,
    body: 'While in your light, you and your allies are free of fear and doubt, and unharmed by extreme cold.',
    footer: [
      '**Reduced**: only one person in the light is protected.',
      '**Empowered**: the light also protects from necromantic and life-draining effects.',
    ],
  },
];
