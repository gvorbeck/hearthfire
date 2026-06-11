import type { MoveDefinition } from '@/types';
import { IMPROVED_STAT_BASE, SUPERIOR_STAT_BASE } from './_statMoves';

export const MARSHAL_MOVES: MoveDefinition[] = [
  {
    id: 'marshal-armored',
    name: 'Armored',
    leftControl: 1,
    body: [
      { kind: 'para', text: 'When you **carry a shield**, mark only ◈ (instead of ◈◈). Also, you can ignore the *cumbersome* tag on any armor you wear.' },
      { kind: 'para', text: 'If you take this move at the start of play, add an ◊◊ iron hauberk, ◊◊ bronze cuirass, or ◊◊ scale coat to your inventory (all are 2 armor, *warm, cumbersome*).' },
    ],
  },
  {
    id: 'marshal-arts-of-war',
    name: 'Arts of War',
    leftControl: 2,
    requiresLevel: 2,
    body: [
      { kind: 'para', text: 'Take a move from the Fox, Heavy, Judge, Ranger, or Seeker playbooks, for which you otherwise qualify. You can pick from a different playbook each time. You can\'t take Improved Stat or Superior Stat.' },
    ],
  },
  {
    id: 'marshal-crew',
    name: 'Crew',
    leftControl: 1,
    startingMove: true,
    body: [
      { kind: 'para', text: 'You\'ve got a crew of stalwarts, six or so residents of Stonetop with some steel to them. See the Crew insert for details.' },
    ],
  },
  {
    id: 'marshal-veteran-crew',
    name: 'Veteran Crew',
    leftControl: 2,
    requires: ['marshal-crew'],
    body: [
      { kind: 'para', text: 'Each time you take this move, pick 1. You can also choose to reselect their Instinct and Cost.' },
      { kind: 'checkbox', items: [
        { id: 'marshal-vc-tags', label: 'Select 2 new tags for your Crew' },
        { id: 'marshal-vc-damage', label: 'Increase their damage die from d6 to d8' },
        { id: 'marshal-vc-hp', label: 'Increase their max HP by 2 each' },
      ] },
    ],
  },
  {
    id: 'marshal-front-line-leader',
    name: 'Front Line Leader',
    leftControl: 1,
    rightControl: [{ type: 'dot', number: 2 }],
    body: [
      { kind: 'para', text: 'When you **lead your crew into battle**, hold 2 Presence. Spend Presence in lieu of your crew\'s Loyalty or as Readiness (as if you Defended them).' },
    ],
  },
  { ...IMPROVED_STAT_BASE, id: 'marshal-improved-stat' },
  {
    id: 'marshal-logistics',
    name: 'Logistics',
    leftControl: 1,
    startingMove: true,
    body: [
      { kind: 'para', text: 'When you **have a steading Muster or Pull Together**, or when you **Requisition**, you have advantage.' },
    ],
  },
  {
    id: 'marshal-read-the-land',
    name: 'Read the Land',
    leftControl: 1,
    body: [
      { kind: 'para', text: 'When you **first take a moment to survey the terrain**, ask the GM one of the following; gain advantage on your next roll to act on the answer.' },
      { kind: 'list', items: [
        'What\'s the best way in, out, through, or past?',
        'Where\'s the best spot for a trap or an ambush?',
        'Where\'s the most defensible position?',
        'What here is out of place?',
      ] },
    ],
  },
  {
    id: 'marshal-prepare-a-welcome',
    name: 'Prepare a Welcome',
    leftControl: 1,
    rightControl: [{ type: 'dot', number: 2 }],
    requires: ['marshal-read-the-land'],
    body: [
      { kind: 'para', text: 'When you **have your allies fortify a position and lie in wait for battle**, hold 1 Surprise if you\'re rushed or 2 Surprises if you can take your time.' },
      { kind: 'para', text: 'Once battle is joined, spend 1 Surprise to reveal a ploy, defense, or dirty trick you prepared in advance and roll +INT: **on a 10+**, it works as well as can be expected, and you\'ve still got a few tricks up your sleeve—regain 1 Surprise; **on a 7-9**, it works as well as can be expected.' },
    ],
  },
  {
    id: 'marshal-set-up-strike',
    name: 'Set-Up Strike',
    leftControl: 1,
    body: [
      { kind: 'para', text: 'When you **Clash and get a 7+**, you can choose to deal damage with disadvantage. If you do, you create an opening for an ally to act on, as if you provided Aid. Describe it!' },
    ],
  },
  {
    id: 'marshal-shake-it-off',
    name: 'Shake It Off',
    leftControl: 1,
    body: [
      { kind: 'para', text: 'When you **order an ally to overcome fear, pain, doubt, or delusion**, roll +CHA: **on a 10+**, they do it; **on a 7-9**, a PC gets advantage on their next roll to do it; an NPC will do it, but they\'ll need time, they\'ll resent you, or they\'ll feel humiliated (GM decides).' },
    ],
  },
  {
    id: 'marshal-shield-wall',
    name: 'Shield Wall',
    leftControl: 1,
    body: [
      { kind: 'para', text: 'When you **have your crew form a shield wall**, they Defend with advantage and **on a 7+** they hold +2 Readiness (instead of the usual +1 for shields). *As long as they maintain formation*, they can go on the offensive without losing Readiness.' },
    ],
  },
  {
    id: 'marshal-sir-permission-to-die-sir',
    name: 'Sir, Permission to Die, Sir',
    leftControl: 1,
    body: [
      { kind: 'para', text: 'When **one of your followers would die**, you can spend 1 of their Loyalty to have them survive (out of the action, but alive). If you let them go, mark XP.' },
    ],
  },
  {
    id: 'marshal-speak-softly',
    name: 'Speak Softly',
    leftControl: 1,
    body: [
      { kind: 'para', text: 'When you **offer peace but your enemy refuses**, gain advantage on your next roll against them.' },
    ],
  },
  {
    id: 'marshal-stentorian',
    name: 'Stentorian',
    leftControl: 1,
    rightControl: [{ type: 'dot', number: 2 }],
    body: [
      { kind: 'para', text: 'When you **raise your voice**, it carries far and cuts through even the din of battle. When you **go into battle**, hold 2 Command. Spend 1 Command to shout an order or warning and pick 1:' },
      { kind: 'list', items: [
        'PCs get advantage on their next roll to do as you say',
        'You have advantage to Order Followers or Deploy',
      ] },
    ],
  },
  {
    id: 'marshal-take-the-measure',
    name: 'Take the Measure',
    leftControl: 1,
    body: [
      { kind: 'para', text: 'When you **size someone up**, ask their player one of the questions below and get an honest answer. If they *fear or respect you* (their call), you can ask another question. You can\'t use this move on them again until your relationship significantly changes.' },
      { kind: 'list', items: [
        'Can I trust them (to _____)?',
        'What do they intend to do?',
        'How are they most useful/dangerous?',
        'What weakness of theirs can I exploit?',
      ] },
    ],
  },
  {
    id: 'marshal-we-happy-few',
    name: 'We Happy Few',
    leftControl: 1,
    body: [
      { kind: 'para', text: 'When you **give an inspiring speech to your allies before facing a dire threat**, roll +CHA: **on a 10+**, each ally holds 2 Inspiration; **on a 7-9**, each ally holds 1 Inspiration; **on a 6-**, each ally holds 1, but you have disadvantage on all rolls until you share your nagging doubts with someone else.' },
      { kind: 'para', text: 'Once battle is joined, your allies can spend their Inspiration at any time, 1-for-1 to do the following:' },
      { kind: 'list', items: [
        'Act fearlessly in the face of terror or overwhelming odds',
        'Keep 1 HP instead of being reduced to 0 HP',
        'Add 1d6 to a damage roll they just made',
      ] },
    ],
  },
  {
    id: 'marshal-battlefield-grace',
    name: 'Battlefield Grace',
    leftControl: 1,
    requiresLevel: 6,
    requires: ['marshal-front-line-leader'],
    body: [
      { kind: 'para', text: 'When you **take damage while leading your allies in battle**, the damage roll has disadvantage.' },
    ],
  },
  {
    id: 'marshal-heroes-to-the-last',
    name: 'Heroes to the Last',
    leftControl: 2,
    requiresLevel: 6,
    requires: ['marshal-veteran-crew'],
    body: [
      { kind: 'para', text: 'Each time you take this move, pick 1:' },
      { kind: 'checkbox', items: [
        { id: 'marshal-httl-exceptional', label: 'They are *exceptional* (and roll +2 instead of +1)' },
        { id: 'marshal-httl-terror', label: 'They are inured to terror & horror' },
        { id: 'marshal-httl-hp', label: 'Increase their max HP by 4 each' },
        { id: 'marshal-httl-damage', label: 'Increase their damage die one size (max d10)' },
      ] },
    ],
  },
  {
    id: 'marshal-focus-fire',
    name: 'Focus Fire',
    leftControl: 1,
    requiresLevel: 6,
    requires: ['marshal-stentorian'],
    body: [
      { kind: 'para', text: 'You can spend 1 Command to order your allies to bring down a foe. If you do, each ally has advantage on their next damage roll against that foe.' },
    ],
  },
  {
    id: 'marshal-like-an-open-book',
    name: 'Like an Open Book',
    leftControl: 1,
    requiresLevel: 6,
    requires: ['marshal-take-the-measure'],
    body: [
      { kind: 'para', text: 'When you **Take the Measure of someone who fears or respects you**, your second question can be anything you want. The GM might ask how you could possibly know this; tell them or ask something else.' },
    ],
  },
  {
    id: 'marshal-noble-mien',
    name: 'Noble Mien',
    leftControl: 1,
    requiresLevel: 6,
    body: [
      { kind: 'para', text: 'When you **lead an NPC through danger and return them to safety**, if they aren\'t part of your crew they will either offer to join your crew or pledge their future aid and support.' },
    ],
  },
  {
    id: 'marshal-peace-through-strength',
    name: 'Peace Through Strength',
    leftControl: 1,
    requiresLevel: 6,
    requires: ['marshal-speak-softly'],
    body: [
      { kind: 'para', text: 'When you **stand ready to fight alongside like-minded allies**, anything capable of fear recognizes you as a serious threat and treats you accordingly.' },
    ],
  },
  { ...SUPERIOR_STAT_BASE, id: 'marshal-superior-stat' },
];
