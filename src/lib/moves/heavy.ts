import type { MoveDefinition } from '@/types';
import { IMPROVED_STAT_BASE, SUPERIOR_STAT_BASE } from './_statMoves';

export const HEAVY_MOVES: MoveDefinition[] = [
  {
    id: 'heavy-dangerous',
    name: 'Dangerous',
    leftControl: 1,
    startingMove: true,
    body: [
      { kind: 'para', text: 'When you **deal your damage**, you have advantage.' },
    ],
  },
  {
    id: 'heavy-hard-to-kill',
    name: 'Hard to Kill',
    leftControl: 1,
    startingMove: true,
    body: [
      { kind: 'para', text: 'When you **are at Death\'s Door**, you can roll +CON or +nothing (your choice). **On a 7-9**, you can mark a debility of your choice to regain 1 HP.' },
    ],
  },
  {
    id: 'heavy-armored',
    name: 'Armored',
    leftControl: 1,
    body: [
      { kind: 'para', text: 'When you *carry a shield*, mark only ◈ (instead of ◈◈). Also, you can ignore the *cumbersome* tag on any armor you wear.' },
      { kind: 'para', text: 'If you take this move at the start of play, add an ◊◊ iron hauberk, ◊◊ bronze cuirass, or ◊◊ scale coat to your inventory (all are 2 armor, *warm*, *cumbersome*).' },
    ],
  },
  {
    id: 'heavy-battle-joy',
    name: 'Battle Joy',
    leftControl: 1,
    requiresLevel: 2,
    body: [
      { kind: 'para', text: 'When you ***spill blood—yours or another\'s—and lose yourself in battle***, you ignore fear, pain, mind-control, and the effects of debilities as long as you keep fighting.' },
      { kind: 'para', text: 'When *the action stops*, roll +CON: **on a 10+**, that was a rush, regain 1d4 HP; **on a 7-9**, you\'re winded and out of it, but you\'ll be fine with a few minutes\' rest; **on a 6-**, mark a debility but don\'t mark XP.' },
    ],
  },
  {
    id: 'heavy-berserker',
    name: 'Berserker',
    leftControl: 1,
    requiresLevel: 2,
    requires: ['heavy-battle-joy'],
    body: [
      { kind: 'para', text: 'While ***in your Battle Joy***, add the *area* tag to your melee attacks, lashing out at anyone nearby (friend and foe alike). Roll damage separately for each target.' },
    ],
  },
  {
    id: 'heavy-carved-out-of-wood',
    name: 'Carved Out of Wood',
    leftControl: 1,
    requiresLevel: 2,
    body: [
      { kind: 'para', text: 'Increase your max HP by 4.' },
    ],
  },
  {
    id: 'heavy-formidable',
    name: 'Formidable',
    leftControl: 1,
    requiresLevel: 2,
    body: [
      { kind: 'para', text: 'When you ***wade into battle***, you can choose to roll +CHA: **on a 10+**, both; **on a 7-9**, pick 1:' },
      {
        kind: 'list',
        items: [
          'Lesser foes will quail, hesitate, or flee before you.',
          'Doughty foes will focus on you, seeing you as the greatest threat.',
        ],
      },
      { kind: 'para', text: '**On a 6-**, pick 1 but ask the GM what you\'ve missed.' },
    ],
  },
  {
    id: 'heavy-frosty',
    name: 'Frosty',
    leftControl: 1,
    requiresLevel: 2,
    body: [
      { kind: 'para', text: 'When you **Defy Danger by keeping calm and carrying on**, **on a 10+** you can also ask the GM a question that you could ask when Seeking Insight. You have advantage on your next move to act on the answer.' },
    ],
  },
  {
    id: 'heavy-guardian',
    name: 'Guardian',
    leftControl: 1,
    requiresLevel: 2,
    body: [
      { kind: 'para', text: 'When you **Defend**, hold 1 extra Readiness. Even on a 6-, hold 1 Readiness (plus whatever the GM says).' },
    ],
  },
  { ...IMPROVED_STAT_BASE, id: 'heavy-improved-stat', requiresLevel: 2 },
  {
    id: 'heavy-intimidating',
    name: 'Intimidating',
    leftControl: 1,
    requiresLevel: 2,
    body: [
      { kind: 'para', text: 'When you **Persuade using violence or threats**, you have advantage.' },
    ],
  },
  {
    id: 'heavy-musclebound',
    name: 'Musclebound',
    leftControl: 1,
    requiresLevel: 2,
    body: [
      { kind: 'para', text: 'When you ***make a hand-to-hand or thrown attack***, it\'s *forceful* and *messy*. If it would already be *forceful* and/or *messy*, it\'s even more so.' },
      { kind: 'para', text: '(Requires Strength +2 or higher)' },
    ],
  },
  {
    id: 'heavy-payback',
    name: 'Payback',
    leftControl: 1,
    requiresLevel: 2,
    body: [
      { kind: 'para', text: 'When you **deal damage to a foe that has harmed you or one of your allies**, deal +1d4 damage.' },
    ],
  },
  {
    id: 'heavy-relentless',
    name: 'Relentless',
    leftControl: 1,
    requiresLevel: 2,
    body: [
      { kind: 'para', text: 'When you **Clash and your foe survives**, you gain advantage the next time you Clash with them.' },
    ],
  },
  {
    id: 'heavy-seasoned-warrior',
    name: 'Seasoned Warrior',
    leftControl: 3,
    requiresLevel: 2,
    body: [
      { kind: 'para', text: 'Take a move from the Fox, Marshal, Ranger, or Seeker playbooks, for which you otherwise qualify. You can pick from a different playbook each time. (You can\'t pick Improved Stat or Superior Stat.)' },
    ],
  },
  {
    id: 'heavy-situational-awareness',
    name: 'Situational Awareness',
    leftControl: 1,
    requiresLevel: 2,
    body: [
      { kind: 'para', text: 'When you **Seek Insight**, add the following to the list of questions you can ask:' },
      {
        kind: 'list',
        items: [
          'Who or what here is the biggest threat?',
          'What is my enemy\'s true position?',
          'What here can I use as a weapon?',
        ],
      },
      { kind: 'para', text: 'When *a fight breaks out*, ask the GM 1 question that you could ask when Seeking Insight.' },
    ],
  },
  {
    id: 'heavy-uncanny-reflexes',
    name: 'Uncanny Reflexes',
    leftControl: 1,
    body: [
      { kind: 'para', text: 'When you ***are unarmored and carrying a normal or light load***, you impose disadvantage on any damage you take that you could dodge or roll with.' },
    ],
  },
  {
    id: 'heavy-unfettered',
    name: 'Unfettered',
    leftControl: 1,
    requiresLevel: 2,
    body: [
      { kind: 'para', text: 'When you ***are subject to physical or mental restraint***, you may mark a debility to immediately break free of that restraint.' },
    ],
  },
  {
    id: 'heavy-unstoppable',
    name: 'Unstoppable',
    leftControl: 1,
    requiresLevel: 2,
    rightControl: [{ type: 'dot', number: 5 }],
    requires: ['heavy-hard-to-kill'],
    body: [
      { kind: 'para', text: 'When you ***are reduced to 0 HP in battle***, you can keep fighting. Each time you take damage while at 0 HP, mark 1. If you would regain HP while fighting, clear one mark instead.' },
      { kind: 'para', text: 'When you ***stop fighting***, roll for Death\'s Door with a -1 penalty for each circle marked. If you survive, clear all your circles.' },
    ],
  },
  {
    id: 'heavy-terror-on-the-field',
    name: 'Terror on the Field',
    leftControl: 1,
    requiresLevel: 2,
    body: [
      { kind: 'para', text: 'When you ***reduce a foe to 0 HP***, describe how you take them out. If you fell them in a particularly brutal or impressive manner, their allies are impressed, dismayed, or frightened and respond accordingly.' },
    ],
  },
  {
    id: 'heavy-bringer-of-ruin',
    name: 'Bringer of Ruin',
    leftControl: 1,
    requiresLevel: 6,
    body: [
      { kind: 'para', text: 'When you ***roll a 12+ to Clash and your foe survives***, name something they possess (like their sword, their position, a limb, their dignity, etc.), but nothing that would kill them outright. Whatever you name, it is broken, shattered, lost. Tell us how.' },
    ],
  },
  {
    id: 'heavy-cut-from-granite',
    name: 'Cut from Granite',
    leftControl: 1,
    requiresLevel: 6,
    requires: ['heavy-carved-out-of-wood'],
    body: [
      { kind: 'para', text: 'Gain +1 armor (stacks with other sources) and increase your max HP by another 2 (+6 HP total).' },
    ],
  },
  {
    id: 'heavy-mighty-thews',
    name: 'Mighty Thews',
    leftControl: 1,
    requiresLevel: 6,
    requires: ['heavy-musclebound'],
    body: [
      { kind: 'para', text: 'When you ***perform a feat of extraordinary strength*** (bursting chains, smashing through a wall, heaving a boulder, etc.), you do it (OH YEAH!) but pick 1:' },
      {
        kind: 'list',
        items: [
          'It takes a while',
          'You cause unwanted damage or harm',
          'It takes a toll (mark a debility)',
        ],
      },
    ],
  },
  {
    id: 'heavy-nemesis',
    name: 'Nemesis',
    leftControl: 1,
    requiresLevel: 6,
    requires: ['heavy-relentless'],
    body: [
      { kind: 'para', text: 'When you **Clash and your foe survives**, all of your future attacks against them do +1d6 damage.' },
    ],
  },
  {
    id: 'heavy-steadfast-guardian',
    name: 'Steadfast Guardian',
    leftControl: 1,
    requiresLevel: 6,
    requires: ['heavy-guardian'],
    body: [
      { kind: 'para', text: 'While you ***hold Readiness (from Defend)***, you can always suffer the damage/effects of an attack instead of your ward; no need to spend Readiness, you can just do it.' },
    ],
  },
  {
    id: 'heavy-stone-cold',
    name: 'Stone Cold',
    leftControl: 1,
    requiresLevel: 6,
    requires: ['heavy-frosty'],
    body: [
      { kind: 'para', text: 'When you **Defy Danger (or Struggle as One) by keeping calm and carrying on**, treat a 6- as a 7-9.' },
    ],
  },
  { ...SUPERIOR_STAT_BASE, id: 'heavy-superior-stat' },
];
