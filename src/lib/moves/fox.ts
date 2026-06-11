import type { MoveDefinition } from '@/types';
import { IMPROVED_STAT_BASE, SUPERIOR_STAT_BASE } from './_statMoves';

export const FOX_MOVES: MoveDefinition[] = [
  {
    id: 'fox-ambush',
    name: 'Ambush',
    leftControl: 1,
    excludes: ['fox-skill-at-arms'],
    body: [
      { kind: 'para', text: 'When you ***get the drop on a nearby foe***, you can deal your damage or opt to roll +DEX: **on a 10+**, deal your damage and pick 2; **on a 7-9**, deal damage and pick 1:' },
      {
        kind: 'list',
        items: [
          'Deal +1d4 damage',
          'Stop them from making noise/raising an alarm',
          'Slip away before they can react',
          'Create an opportunity; you or an ally gains advantage on the next move to act on it',
        ],
      },
    ],
  },
  {
    id: 'fox-all-in-the-wrist',
    name: 'All In The Wrist',
    leftControl: 1,
    rightControl: [
      { type: 'dot', number: 1, label: 'a few left', divider: true },
      { type: 'dot', number: 1, label: 'out' },
    ],
    body: [
      { kind: 'para', text: 'Any knife or dagger gets the *thrown* tag in your hands. Also, you keep a few iron throwing blades (*near*) on you; they don\'t take up space in your inventory. Reset your ammo whenever you Outfit.' },
    ],
  },
  {
    id: 'fox-burgle',
    name: 'Burgle',
    leftControl: 1,
    body: [
      { kind: 'para', text: 'When you ***sneak off on your own into a dangerous place***, roll +INT: **on a 7+**, you make it back, and the GM says where you got to and what you learned. Then, **on a 10+**, also pick 2; **on a 7-9**, also pick 1:' },
      {
        kind: 'list',
        items: [
          'You got away clean, rousing no suspicion',
          'You swiped something valuable (GM\'s choice)',
          'You set something up to exploit on your return',
          'Ask a Seek Insight question about what you saw',
        ],
      },
      { kind: 'para', text: '**On a 6-**, you either make it back but with trouble in tow, or you\'re missing in action (your call).' },
    ],
  },
  {
    id: 'fox-catlike',
    name: 'Catlike',
    leftControl: 1,
    body: [
      { kind: 'para', text: 'When you ***carry a light load and act with care***, you move silently. When you ***hide in shadows or darkness***, you remain unseen until you draw attention to yourself, move positions, or attack.' },
    ],
  },
  {
    id: 'fox-dabbler',
    name: 'Dabbler',
    leftControl: 1,
    requiresLevel: 2,
    body: [
      { kind: 'para', text: 'Each time you take this move, choose a move from the Heavy, Marshal, Ranger, or Seeker playbooks for which you otherwise qualify. (You can\'t take Improved Stat or Superior Stat.)' },
    ],
  },
  {
    id: 'fox-danger-sense',
    name: 'Danger Sense',
    leftControl: 1,
    excludes: ['fox-perceptive'],
    body: [
      { kind: 'para', text: 'You can always ask the GM, "Is there an ambush or trap here?" If they say "yes," roll +INT: **on a 10+**, ask the GM both of the questions below; **on a 7-9**, ask 1; **either way**, gain advantage on your next roll to act on the answer(s).' },
      {
        kind: 'list',
        items: [
          'What will trigger the ambush or trap?',
          'What will happen once it\'s triggered?',
        ],
      },
      { kind: 'para', text: '**On a 6-**, don\'t mark XP; you know there\'s a trap or ambush, but nothing bad happens just yet.' },
    ],
  },
  {
    id: 'fox-free-running',
    name: 'Free Running',
    leftControl: 1,
    body: [
      { kind: 'para', text: 'When you ***carry a light load and move with speed and grace***, gain advantage on any move to surmount or bypass a physical obstacle.' },
    ],
  },
  { ...IMPROVED_STAT_BASE, id: 'fox-improved-stat', leftControl: 4 },
  {
    id: 'fox-irresistible',
    name: 'Irresistible',
    leftControl: 1,
    body: [
      { kind: 'para', text: 'When you ***interact with someone***, you can ask their player if they find you attractive and get an honest answer (usually "yes").' },
      { kind: 'para', text: 'When you **Persuade by using your considerable charms as leverage**, you have advantage.' },
    ],
  },
  {
    id: 'fox-laugh-at-danger',
    name: 'Laugh at Danger',
    leftControl: 1,
    body: [
      { kind: 'para', text: 'When you ***are about to roll +CON and you make a joke about the adversity you face***, you can roll +CHA instead.' },
    ],
  },
  {
    id: 'fox-light-fingers',
    name: 'Light Fingers',
    leftControl: 1,
    body: [
      { kind: 'para', text: 'When you ***perform sleight of hand on an unwary mark***, you succeed and no one\'s the wiser. If you\'re being watched, roll +DEX: **on a 10+**, you succeed and no one\'s the wiser; **on a 7-9**, you succeed OR no one\'s the wiser (your choice).' },
    ],
  },
  {
    id: 'fox-perceptive',
    name: 'Perceptive',
    leftControl: 1,
    excludes: ['fox-danger-sense'],
    body: [
      { kind: 'para', text: 'When you **Seek Insight**, you may ask 1 additional question. Even on a 6-, you can ask 1 question (though you might not like how you learn the answer).' },
    ],
  },
  {
    id: 'fox-rapier-wit',
    name: 'Rapier Wit',
    leftControl: 1,
    body: [
      { kind: 'para', text: 'When you ***pierce an NPC\'s pride with a well-placed quip***, they must do 1 (their choice):' },
      {
        kind: 'list',
        items: [
          'Attack, doing +1d4 damage if they hit but giving you advantage on your next roll against them',
          'Stoop to your level and respond in kind',
          'Spend a few moments fuming, sputtering, or controlling their temper',
        ],
      },
    ],
  },
  {
    id: 'fox-silver-tongued',
    name: 'Silver Tongued',
    leftControl: 1,
    rightControl: [{ type: 'dot', number: 3 }],
    body: [
      { kind: 'para', text: 'When you ***use words to avoid suspicion or trouble***, roll +CHA: **on a 10+**, hold 3 Nerve; **on a 7-9**, hold 1 Nerve. You may spend Nerve, 1-for-1, to:' },
      {
        kind: 'list',
        items: [
          'Move about or maneuver unchallenged',
          'Withstand direct scrutiny or questioning',
          'Direct suspicion or attention elsewhere',
        ],
      },
    ],
  },
  {
    id: 'fox-skill-at-arms',
    name: 'Skill at Arms',
    leftControl: 1,
    excludes: ['fox-ambush'],
    body: [
      { kind: 'para', text: 'When you ***wield a weapon with speed and grace***, roll +DEX to Clash (instead of +STR).' },
    ],
  },
  {
    id: 'fox-under-your-skin',
    name: 'Under Your Skin',
    leftControl: 1,
    body: [
      { kind: 'para', text: 'When you ***engage an NPC in conversation***, you can ask the GM 1 of these and get an honest answer:' },
      {
        kind: 'list',
        items: [
          'What are they expecting me to do?',
          'What, in general, are they trying to hide?',
          'What do they want to happen?',
        ],
      },
    ],
  },
  {
    id: 'fox-parry-riposte',
    name: 'Parry & Riposte',
    leftControl: 1,
    requires: ['fox-skill-at-arms'],
    body: [
      { kind: 'para', text: 'When you **Defend** ***with a weapon that you can wield quickly***, you can spend 1 Readiness to both halve an attack\'s effects/damage and strike back at the attacker (deal your damage with disadvantage), instead of spending 1 Readiness for each.' },
    ],
  },
  {
    id: 'fox-battle-dancer',
    name: 'Battle Dancer',
    leftControl: 1,
    requiresLevel: 6,
    requires: ['fox-skill-at-arms'],
    body: [
      { kind: 'para', text: 'When you **roll +DEX to Clash**, **on a 12+** you deal your damage, avoid your enemy\'s attack, and impress/embarrass/overawe your foes.' },
    ],
  },
  {
    id: 'fox-cheap-shot',
    name: 'Cheap Shot',
    leftControl: 1,
    requiresLevel: 6,
    requires: ['fox-ambush'],
    body: [
      { kind: 'para', text: 'When you **Ambush with a hand weapon**, you have advantage on your damage roll.' },
    ],
  },
  {
    id: 'fox-eye-on-the-door',
    name: 'Eye on the Door',
    leftControl: 1,
    requiresLevel: 6,
    body: [
      { kind: 'para', text: 'When you ***and your allies need to get out of here***, name your escape route and roll +INT: **on a 10+**, you\'re gone; **on a 7-9**, you can stay or go, but if you go, it costs you—the GM will tell you what (or who) you leave behind or take with you.' },
    ],
  },
  {
    id: 'fox-pants-on-fire',
    name: 'Pants on Fire',
    leftControl: 1,
    requiresLevel: 6,
    body: [
      { kind: 'para', text: 'When you **Defy Danger, Persuade, or Interfere by being deceitful**, you have advantage.' },
      { kind: 'para', text: 'When another move (like Seek Insight) allows a player to ask you a question, you can opt not to answer.' },
    ],
  },
  {
    id: 'fox-second-intent',
    name: 'Second Intent',
    leftControl: 1,
    requiresLevel: 6,
    requires: ['fox-parry-riposte', 'fox-ambush'],
    body: [
      { kind: 'para', text: 'When you **Defend and spend 1 Readiness to Parry & Riposte**, also pick 1 option from the Ambush list.' },
    ],
  },
  {
    id: 'fox-slippery',
    name: 'Slippery',
    leftControl: 1,
    requiresLevel: 6,
    body: [
      { kind: 'para', text: 'When you ***try to escape being caught or controlled***, treat a 6- as a 7-9. On a 12+, say how you turn the tables or use the circumstances to your advantage.' },
    ],
  },
  { ...SUPERIOR_STAT_BASE, id: 'fox-superior-stat' },
];
