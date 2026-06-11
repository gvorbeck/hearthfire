import type { MoveDefinition } from '@/types';
import { IMPROVED_STAT_BASE, SUPERIOR_STAT_BASE } from './_statMoves';

export const WOULD_BE_HERO_MOVES: MoveDefinition[] = [
  {
    id: 'wbh-anger-is-a-gift',
    name: 'Anger is a Gift',
    leftControl: 1,
    startingMove: true,
    rightControl: [{ type: 'dot', number: 2 }],
    body: [
      { kind: 'para', text: 'When you **burn with righteous anger** (see Fear & Anger on back of playbook), hold 2 Resolve. You can spend your Resolve 1-for-1 to:' },
      { kind: 'list', items: [
        'Set aside fear and doubt to do what must be done',
        'Act suddenly, catching them off-guard',
        'Inspire allies or bystanders to follow your lead',
        'Strike hard (+1d4 damage, *forceful*)',
        'Keep your footing, position, and/or your course despite what befalls you',
      ] },
    ],
  },
  {
    id: 'wbh-potential-for-greatness',
    name: 'Potential for Greatness',
    leftControl: 1,
    startingMove: true,
    requires: ['wbh-anger-is-a-gift'],
    body: [
      { kind: 'para', text: 'Once per level, **when you roll a stat and get a 10+**, mark one of the following (note the level during which you marked it). You don\'t have to mark them in order.' },
      { kind: 'tracked', items: [
        { id: 'pfg-stat-1', label: 'Increase the stat you rolled by 1, to a max of +2 (at level ___)' },
        { id: 'pfg-stat-2', label: 'Increase the stat you rolled by 1, to a max of +2 (at level ___)' },
        { id: 'pfg-stat-3', label: 'Increase the stat you rolled by 1, to a max of +2 (at level ___)' },
        { id: 'pfg-stat-4', label: 'Increase the stat you rolled by 1, to a max of +2 (at level ___)' },
        { id: 'pfg-hp', label: 'Increase your max HP by 4 (at level ___)' },
        { id: 'pfg-damage', label: 'Increase your damage die to a d8 (at level ___)' },
      ] },
    ],
  },
  {
    id: 'wbh-speak-truth-to-power',
    name: 'Speak Truth to Power',
    leftControl: 1,
    requires: ['wbh-anger-is-a-gift'],
    body: [
      { kind: 'para', text: 'When you **demand that someone does what is clearly good and right**, you have advantage to Persuade. If they refuse, gain +1 Resolve.' },
    ],
  },
  {
    id: 'wbh-better-part-of-valor',
    name: 'Better Part of Valor',
    leftControl: 1,
    body: [
      { kind: 'para', text: 'When you **are outnumbered or facing a foe bigger than you**, you have advantage to hide from, escape from, or sneak past them.' },
    ],
  },
  {
    id: 'wbh-i-get-knocked-down',
    name: 'I Get Knocked Down',
    leftControl: 1,
    body: [
      { kind: 'para', text: 'When you **take damage despite your best efforts to avoid it**, you can choose to halve the damage but pick 1 of the following:' },
      { kind: 'list', items: [
        'You lose something (footing, grip, etc.)',
        'Something on your person breaks',
        "You're out of it for a moment",
      ] },
      { kind: 'para', text: 'Whatever you choose, the GM will describe the details.' },
    ],
  },
  {
    id: 'wbh-but-i-get-up-again',
    name: 'But I Get Up Again',
    leftControl: 1,
    requires: ['wbh-i-get-knocked-down'],
    body: [
      { kind: 'para', text: 'When you **use I Get Knocked Down**, you have advantage on your next roll against whatever dealt the damage and your next blow against them does +1d4 damage.' },
    ],
  },
  { ...IMPROVED_STAT_BASE, id: 'wbh-improved-stat' },
  {
    id: 'wbh-in-over-your-head',
    name: 'In Over Your Head',
    leftControl: 1,
    body: [
      { kind: 'para', text: 'When **another PC rescues you from danger**, mark XP.' },
    ],
  },
  {
    id: 'wbh-iron-will',
    name: 'Iron Will',
    leftControl: 1,
    body: [
      { kind: 'para', text: 'When you **are subject to mind control or magic that affects your feelings**, you can take 1d4 damage (ignoring armor) to disregard its influence.' },
    ],
  },
  {
    id: 'wbh-inquiring-minds',
    name: 'Inquiring Minds',
    leftControl: 1,
    body: [
      { kind: 'para', text: 'When you **seek out and receive honest advice**, gain advantage on your next roll to follow that advice.' },
    ],
  },
  {
    id: 'wbh-never-gonna-keep-me-down',
    name: 'Never Gonna Keep Me Down',
    leftControl: 1,
    rightControl: [{ type: 'dot', number: 1 }],
    body: [
      { kind: 'para', text: 'When you **have 5 or fewer current HP**, you impose disadvantage on any damage you take.' },
      { kind: 'para', text: "Once per session, when you are at Death's Door, don't roll. You get a 10+." },
    ],
  },
  {
    id: 'wbh-resourceful',
    name: 'Resourceful',
    leftControl: 1,
    body: [
      { kind: 'para', text: 'When you **Defy Danger and roll a 6–**, ask the GM a question from Seek Insight after they describe what happens. Gain advantage on your next roll to act on the answer.' },
    ],
  },
  {
    id: 'wbh-something-to-remember-me-by',
    name: 'Something to Remember Me By',
    leftControl: 1,
    body: [
      { kind: 'para', text: 'When you **spend Readiness (from Defend) to strike back at an attacker**, you deal +1d4 damage and scar, mark, or diminish them in some way (the GM will say how, or ask you to).' },
    ],
  },
  {
    id: 'wbh-tough-love',
    name: 'Tough Love',
    leftControl: 1,
    body: [
      { kind: 'para', text: 'When you **honestly think another PC is in the wrong and call them on it**, they have disadvantage on any rolls against you until you two work it out.' },
    ],
  },
  {
    id: 'wbh-underestimated',
    name: 'Underestimated',
    leftControl: 1,
    body: [
      { kind: 'para', text: 'As long as you **avoid overt hostility**, no enemy will consider you a threat.' },
      { kind: 'para', text: 'When you **first make your move against an enemy who underestimates you**, you have advantage.' },
    ],
  },
  {
    id: 'wbh-up-with-people',
    name: 'Up With People',
    leftControl: 1,
    rightControl: [{ type: 'dot', number: 2, divider: true }, { type: 'dot', number: 1 }],
    body: [
      { kind: 'para', text: 'When you **converse with someone** (PC or NPC) you can hold 2 Rapport with them. If you do, they hold 1 Rapport with you. During the conversation, either of you can spend 1 Rapport to ask the other player one of the following and get an honest answer.' },
      { kind: 'list', items: [
        'What weighs you down or holds you back?',
        'What drives you forward?',
        'What lesson would you have me learn?',
        'What do you think of me, truly?',
      ] },
    ],
  },
  {
    id: 'wbh-versatile',
    name: 'Versatile',
    leftControl: 5,
    requiresLevel: 2,
    requires: ['wbh-potential-for-greatness'],
    body: [
      { kind: 'para', text: 'Choose a move from any other playbook, as long as you meet its requirements. You can pick a different playbook each time. You can\'t take Improved Stat or Superior Stat.' },
    ],
  },
  {
    id: 'wbh-a-force-to-be-reckoned-with',
    name: 'A Force to Be Reckoned With',
    leftControl: 1,
    requires: ['wbh-underestimated'],
    requiresLevel: 6,
    body: [
      { kind: 'para', text: 'When you **Defy Danger against something trying to harm or constrain you**, on a 12+ you turn the tables on them (the GM will say how, or ask you to).' },
      { kind: 'para', text: 'Any intelligent creature who looks you in the eye or hears the steel in your voice instinctively knows that you are a force to be reckoned with, and treats you appropriately.' },
    ],
  },
  {
    id: 'wbh-big-damn-hero',
    name: 'Big Damn Hero',
    leftControl: 1,
    requires: ['wbh-in-over-your-head'],
    requiresLevel: 6,
    body: [
      { kind: 'para', text: "When you **first leap into danger to protect someone**, don't roll to Defend. Instead, treat it as though you rolled a 10+." },
      { kind: 'para', text: 'When you **Defend**, you can spend 1 Readiness to lock eyes with an attacker; they have disadvantage on damage rolls against you and your ward for the rest of the fight.' },
    ],
  },
  {
    ...SUPERIOR_STAT_BASE,
    id: 'wbh-superior-stat',
    body: [
      { kind: 'para', text: 'Requires all 6 marks in Potential for Greatness. Increase one of your stats by +1 (to a max of +3).' },
    ],
  },
  {
    id: 'wbh-undaunted',
    name: 'Undaunted',
    leftControl: 1,
    requires: ['wbh-better-part-of-valor'],
    requiresLevel: 6,
    body: [
      { kind: 'para', text: 'When you **are outnumbered or facing a foe bigger than you**, you get +1 armor and deal +1d6 damage.' },
    ],
  },
  {
    id: 'wbh-voice-of-experience',
    name: 'Voice of Experience',
    leftControl: 1,
    requires: ['wbh-inquiring-minds'],
    requiresLevel: 6,
    body: [
      { kind: 'para', text: 'When **another PC comes to you for advice and you tell them what you think is best**, they have advantage on their first roll to follow your advice.' },
      { kind: 'para', text: 'When you **Seek Insight**, you can always ask, "What is about to happen?" for free, even on a 6–.' },
    ],
  },
];
