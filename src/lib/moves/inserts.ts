import type { MoveDefinition } from '@/types';

// ── Revenant ─────────────────────────────────────────────────────────────────

export const REVENANT_MOVES: MoveDefinition[] = [
  {
    id: "revenant-unliving",
    name: "Unliving",
    body: [
      {
        kind: "para",
        text: "You do not breathe. You need not eat nor drink nor sleep. You do not heal normally. You gain no benefit from magical healing, Make Camp, Recover or Convalesce.",
      },
    ],
  },
  {
    id: "revenant-undying",
    name: "Undying",
    body: [
      {
        kind: "para",
        text: "Neither poison nor disease do you harm. You feel little pain. When you *take damage from cutting, stabbing, or crushing*, take half damage (after armor, rounded up).",
      },
      {
        kind: "para",
        text: "When you *are reduced to 0 HP*, roll +CON: **on a 10+**, regain half your max HP and choose 1; **on a 7-9**, regain half your max HP and choose 2; **on a 6-**, either regain 1 HP and all 3 apply, or give up this insert and gain the Ghost insert instead.",
      },
      {
        kind: "para",
        text: "If *your body is completely destroyed* (burnt to ash, ground to jelly, etc.), treat it as if you were reduced to 0 HP and rolled a 6-.",
      },
      {
        kind: "list",
        items: [
          "Mark a consequence",
          "You're out of the action until the next sunset",
          "Your body is permanently maimed in some way of the GM's choosing",
        ],
      },
    ],
  },
  {
    id: "revenant-implacable",
    name: "Implacable",
    body: [
      {
        kind: "para",
        text: "When you *push the limits of your undead body*, lose 1d4 HP and choose 1:",
      },
      {
        kind: "list",
        items: [
          "Perform a feat of inhuman strength",
          "Act with uncanny speed and grace",
          "Refuse to be moved, held back, or knocked off course",
        ],
      },
    ],
  },
];

export const REVENANT_CONSEQUENCE_LABELS: { id: string; label: string }[] = [
  {
    id: "breakdown",
    label:
      "**BREAKDOWN** — You lash out in an unthinking, unfeeling rage that lasts until the next sunrise. Ask the GM what snippets you remember.",
  },
  {
    id: "unstable",
    label:
      "**UNSTABLE** *(Requires Breakdown)* — You are prone to episodes of unthinking, unfeeling rage. When you *roll a 6-*, the GM can choose to have you enter such a rage.",
  },
  {
    id: "carrion-stench",
    label:
      "**CARRION STENCH** — You are followed always by a horrible odor. Natural beasts will shun you; even predators will avoid you and your companions.",
  },
  {
    id: "deathly-visage",
    label:
      "**DEATHLY VISAGE** — It's clear to all who look upon you that you are dead. When you *use intimidation and your sinister appearance to Persuade*, you have advantage.",
  },
  {
    id: "home-to-vermin",
    label:
      "**HOME TO VERMIN** — Bugs, moths, and other vermin have taken up residence in your corpse. Treat them as followers: *group, tiny, gross, meek, stealthy*; HP 1 each; Instinct: to get distracted; Cost: genuine affection.",
  },
  {
    id: "nightkin",
    label:
      "**NIGHTKIN** — You can see clearly in even absolute darkness, though you see only in black and white and red. Sunlight blinds you, and direct sunlight burns your skin.",
  },
  {
    id: "quarry",
    label:
      "**QUARRY** — The Pale Hunter has caught your scent. Expect a visit, soon.",
  },
  {
    id: "strange-appetites",
    label:
      "**STRANGE APPETITES** — When you *consume your special fare*, heal damage equal to half your max HP or clear a debility.",
  },
  {
    id: "insatiable",
    label:
      "**INSATIABLE** *(Requires Strange Appetites)* — When you *have the opportunity to indulge your Strange Appetites*, gain advantage on your next roll if you choose to do so, or Defy Danger if you choose not to.",
  },
  {
    id: "final-consequence",
    label:
      "**THE FINAL CONSEQUENCE** — Your tenuous connection to humanity is lost and you become a monster under the GM's control.",
  },
];

// ── Ghost ─────────────────────────────────────────────────────────────────────

export const GHOST_MOVES: MoveDefinition[] = [
  {
    id: 'ghost-unliving',
    name: 'Unliving',
    body: [
      { kind: 'para', text: 'You do not breathe. You need not eat nor drink nor sleep. You do not heal normally. You gain no benefit from magical healing, Make Camp, Recover or Convalesce.' },
    ],
  },
  {
    id: 'ghost-disembodied',
    name: 'Disembodied',
    body: [
      { kind: 'para', text: 'Your body is dead and gone, but you persist as a spirit. You can be harmed only by silver, salt, or that which harms spirits or ghosts.' },
      { kind: 'para', text: 'You normally go unseen, with the barest influence on the material world and a dim, distorted sense of reality. When you *manifest a ghostly presence in shadows or darkness*, the world becomes clear and pick 1. For each additional option you pick, lose 1d4 HP:' },
      { kind: 'para', text: 'You remain manifest for as long as you concentrate; pain or shock or direct sunlight threaten your concentration, for sure.' },
      { kind: 'list', items: [
        'You appear solid and whole, much as you did in life',
        'You can speak clearly and intelligibly',
        'Your touch (or ghostly weapons) can harm the living (ignores armor)',
      ] },
    ],
  },
  {
    id: 'ghost-tethered',
    name: 'Tethered',
    body: [
      { kind: 'para', text: 'Choose something to which you are bound: your mortal remains, the place where you died, an object of personal significance, etc.' },
      { kind: 'para', text: 'When you *are reduced to 0 HP*, mark a consequence and your essence disperses until the next sunset. You reform near your tether with half your max HP. If your tether has been destroyed, mark the Final Consequence.' },
    ],
  },
];

export const GHOST_CONSEQUENCE_LABELS: { id: string; label: string }[] = [
  {
    id: 'bodysnatcher',
    label: '**BODYSNATCHER** — When you *possess an unconscious or willing person*, lose 1d4 HP and control their actions.',
  },
  {
    id: 'breakdown',
    label: '**BREAKDOWN** — You lash out in an unthinking, unfeeling rage that lasts until the next sunrise. Ask the GM what snippets you remember.',
  },
  {
    id: 'disturbing',
    label: '**DISTURBING** — Your presence (even unseen) disturbs beasts and children. The air around you is notably cooler, especially when you manifest. When you *use intimidation and your disturbing presence to Persuade*, you have advantage.',
  },
  {
    id: 'otherworldly',
    label: '**OTHERWORLDLY** — When you *manifest a ghostly form*, strange things happen: statues weep, rocks bleed, plants wither, water pools on ceilings, etc.',
  },
  {
    id: 'poltergeist',
    label: '**POLTERGEIST** — When you *get angry*, lose 1d4 HP and hold that much Fury. Spend Fury, 1-for-1, to shatter objects, hurl things, or attack with telekinetic force.',
  },
  {
    id: 'quarry',
    label: '**QUARRY** — The Pale Hunter has caught your scent. Expect a visit, soon.',
  },
  {
    id: 'specter',
    label: '**SPECTER** — When you *terrify a living person, someone who is unconnected to your Terrible Purpose*, regain 1d8 HP or clear a debility of your choice.',
  },
  {
    id: 'unstable',
    label: '**UNSTABLE** *(Requires Breakdown)* — You are prone to episodes of unthinking, unfeeling rage (as per Breakdown). When you *roll a 6-*, the GM can choose to have you enter such a rage.',
  },
  {
    id: 'final-consequence',
    label: "**THE FINAL CONSEQUENCE** — Your tenuous connection to humanity is lost and you become a monster under the GM's control.",
  },
];

// ── Thrall ────────────────────────────────────────────────────────────────────

const FAVOR_MOVE: MoveDefinition = {
  id: 'thrall-favor',
  name: 'Favor',
  rightControl: [{ type: 'dot', number: 3, label: 'Favor' }],
  body: [
    { kind: 'para', text: 'Your Favor starts at 0 and can go no higher than 3. When you ***have 3 Favor and would gain another***, reduce your Favor to 0 and choose 1:' },
    { kind: 'list', items: [
      'Ask a question of your master and gain advantage on your next roll to act on the answer.',
      "Gain a new Mark of your choice. Then ask the GM to choose a Mark that you don't have, and cross it off—you can never gain it.",
    ] },
  ],
};

const URGES_MOVE: MoveDefinition = {
  id: 'thrall-urges',
  name: 'Urges',
  body: [
    { kind: 'para', text: 'When ***the GM compels you to act on your impulse***, gain 1 Favor if you act as bidden. If you resist, roll +WIS: **on a 10+**, your actions are your own; **on a 7-9**, choose 1:' },
    { kind: 'list', items: [
      'Struggle for control until someone or something snaps you out of it',
      'Start acting as compelled, putting yourself or an ally in a spot before you regain control',
      'Harm yourself (d6 damage, ignores armor) to regain control',
    ] },
    { kind: 'para', text: 'On a 6-, you come to your senses later, having done gods-know-what.' },
    { kind: 'para', text: 'When you ***act on your impulse without being compelled to do so***, and your actions cause you or your allies trouble, gain 1 Favor.' },
  ],
};

const DARK_SUCCOR_MOVE: MoveDefinition = {
  id: 'thrall-dark-succor',
  name: 'Dark Succor',
  body: [
    { kind: 'para', text: "When you ***are dying or killed outright***, your master intercedes on your behalf. You will recover, here and now or at a time and place of the GM's choosing. Then, roll +Favor: **on a 10+**, choose 1; **on a 7-9**, choose 2; **on a 6-**, all 3 apply." },
    { kind: 'list', items: [
      "Gain a new Mark of the GM's choice",
      "Cross off a Mark that you don't have—you can never gain it",
      'Your master gives you a task; until you complete it, your Favor stays at 0.',
    ] },
    { kind: 'para', text: 'Regardless, reset your Favor to 0.' },
  ],
};

const UNHOLY_VESSEL_MOVE: MoveDefinition = {
  id: 'thrall-unholy-vessel',
  name: 'Unholy Vessel',
  body: [
    { kind: 'para', text: "When you ***would gain a Mark but there are none left to gain***, your humanity is utterly lost. You become a threat in the GM's control. Make a new character." },
  ],
};

export const THRALL_MOVES: MoveDefinition[] = [
  FAVOR_MOVE,
  URGES_MOVE,
  DARK_SUCCOR_MOVE,
  UNHOLY_VESSEL_MOVE,
];

export const THRALL_MARK_DEFINITIONS: MoveDefinition[] = [
  {
    id: 'festering-rot',
    name: 'A Festering Rot',
    leftControl: 1,
    body: [
      { kind: 'para', text: 'You are unharmed by poison, disease, caustic substances, and vermin bites. Things in your presence rot, crack, corrode, and spoil.' },
      { kind: 'para', text: 'When you *roll doubles*, something on your person is ruined. The GM will tell you what, and how.' },
    ],
  },
  {
    id: 'child-of-the-deeps',
    name: 'Child of the Deeps',
    leftControl: 1,
    body: [
      { kind: 'para', text: 'Reduce your max HP by 2.' },
      { kind: 'para', text: 'You can breathe water and suffer no harm from cold or pressure. Your skin becomes squamous. When you *go a day without bathing*, mark a debility.' },
      { kind: 'para', text: 'While near a body of water, you can spend 1 Favor to call forth a slimy tentacle to do your bidding. Treat it as a follower: *stealthy, relentless*; HP 6; Damage d10 (*reach, forceful, grabby*); Instinct: to squeeze the life from things; Cost: lives drowned.' },
    ],
  },
  {
    id: 'death-mask',
    name: 'Death Mask',
    leftControl: 1,
    body: [
      { kind: 'para', text: 'You find or craft a horrid mask. When you *do not wear your mask*, you have disadvantage on all rolls.' },
      { kind: 'para', text: 'When you *wear your mask*, undead treat as one of their own.' },
      { kind: 'para', text: 'When you *wear your mask*, you can spend 1 Favor to fill any living thing that sees you with dread. They must choose: flee, cower, or stand fast. If they stand fast, you have advantage on your first roll against them.' },
    ],
  },
  {
    id: 'quicksilver-dreams',
    name: 'Quicksilver Dreams',
    leftControl: 1,
    body: [
      { kind: 'para', text: 'Reduce your max HP by 2.' },
      { kind: 'para', text: 'When you *Make Camp*, everyone with you suffers nightmares and has disadvantage on their next roll.' },
      { kind: 'para', text: 'You can spend 1 Favor to inflict false sensations upon someone, as long as you can see them.' },
    ],
  },
  {
    id: 'ravenous',
    name: 'Ravenous',
    leftControl: 1,
    body: [
      { kind: 'para', text: 'You are filled with unending hunger. Gain an extra impulse: "Wantonly devour flesh."' },
      { kind: 'para', text: 'When you *Make Camp*, consume an extra 1d4 provisions or uses of supplies.' },
      { kind: 'para', text: 'You can spend 1 Favor to:' },
      { kind: 'list', items: [
        'Touch something. For as long as you hold it, everyone who sees it desires it.',
        'Gain a horrid, iron-rending maw (*hand*, 3 piercing, *messy*) for as long as you wish, and with it the ability to eat and digest anything.',
      ] },
    ],
  },
  {
    id: 'red-wrath',
    name: 'Red Wrath',
    leftControl: 1,
    body: [
      { kind: 'para', text: 'Reduce your max HP by 2. When *the GM compels you to violence*, you have disadvantage to resist.' },
      { kind: 'para', text: 'When you *let your fury fly and lash out at someone* (*hand, close*), spend 1-3 Favor and roll +Favor spent: **on a 10+**, deal 2d8 damage (*messy, forceful*) and shock, terrify, or impress any onlookers; **on a 7-9**, as a 10+ but you keep attacking your victim (or their corpse) in an unthinking rage, heedless of other danger.' },
    ],
  },
  {
    id: 'shadows-cold-embrace',
    name: "Shadow's Cold Embrace",
    leftControl: 1,
    body: [
      { kind: 'para', text: 'Reduce your max HP by 2. You cast no shadow and no reflection.' },
      { kind: 'para', text: 'When you *are exposed to sunlight or holy light*, you cannot spend Favor (for any reason).' },
      { kind: 'para', text: 'Otherwise you can spend 1 Favor to:' },
      { kind: 'list', items: [
        'Remain unnoticed, even when under scrutiny or after doing something to draw attention.',
        'Leave no trace of your comings or goings',
        'Pass off a lie as an obvious, evident truth',
      ] },
    ],
  },
  {
    id: 'speak-truth-whisper-secrets',
    name: 'Speak Truth, Whisper Secrets',
    leftControl: 1,
    body: [
      { kind: 'para', text: 'Reduce your max HP by 2. Your tongue grows unusually long and your teeth become stained and jagged.' },
      { kind: 'para', text: 'You can spend 1 Favor to look someone in the eye and learn (pick 1):' },
      { kind: 'list', items: [
        'What do they desire above all else?',
        'What secret shame do they bear?',
        'What is their greatest fear?',
        'What is their worst memory?',
      ] },
      { kind: 'para', text: 'When you *use the answer against them*, you have advantage.' },
    ],
  },
  {
    id: 'torments-blessing',
    name: "Torment's Blessing",
    leftControl: 1,
    body: [
      { kind: 'para', text: 'Your wounds are slow to heal. When you *recover HP*, recover only half the amount that you should. But, you never need to Defy Danger due to pain, blood loss, and weakness due to wounds.' },
      { kind: 'para', text: 'When you *speak a word of torment*, name someone nearby, spend 1-3 Favor, and roll +Favor spent: **on a 10+**, they take 2d4 damage and are wracked with pain—lesser victims are incapacitated, and mighty foes are momentarily stunned; **on a 7-9**, they take 1d6 damage (ignores armor) and lesser victims are momentarily stunned.' },
    ],
  },
];
