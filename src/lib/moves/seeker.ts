import type { MoveDefinition } from '@/types';
import { IMPROVED_STAT_BASE, SUPERIOR_STAT_BASE } from './_statMoves';

export const SEEKER_MOVES: MoveDefinition[] = [
  {
    id: 'seeker-well-versed',
    name: 'Well Versed',
    leftControl: 3,
    startingMove: true,
    body: [
      { kind: 'para', text: 'Mark 1 topic, in addition to the one noted in your Background. Each additional time you take this move, mark 2 more topics.' },
      { kind: 'checkbox', items: [
        { id: 'sk-wv-last-door', label: 'The Last Door, death, and the undead' },
        { id: 'sk-wv-civilizations', label: 'The civilizations of humanity' },
        { id: 'sk-wv-fae', label: 'The Fae and their strange ways' },
        { id: 'sk-wv-makers', label: 'The Makers and their arts' },
        { id: 'sk-wv-primordial', label: 'The primordial powers' },
        { id: 'sk-wv-things-below', label: 'The Things Below' },
        { id: 'sk-wv-wild-world', label: 'The wild world and its spirits' },
      ] },
      { kind: 'para', text: 'When you **Know Things about one of your topics**, you can ask the GM a follow-up question of your choice (even on a 6-).' },
    ],
  },
  {
    id: 'seeker-work-with-what-youve-got',
    name: "Work With What You've Got",
    leftControl: 1,
    startingMove: true,
    body: [
      { kind: 'para', text: 'When you **cleverly use your environment to harm or impede your foe(s)**, roll +INT: **on a 10+**, pick 2; **on a 7-9**, pick 1:' },
      { kind: 'list', items: [
        'Interrupt or thwart their action(s)',
        'Create an opportunity that grants you or an ally advantage on the next roll to exploit it',
        "Deal damage appropriate to the source (d4 for bruises/scrapes, d6 for bloodshed, d8 if it'd break bones, d10 if it'd kill a common person)",
      ] },
    ],
  },
  {
    id: 'seeker-attuned',
    name: 'Attuned',
    leftControl: 1,
    body: [
      { kind: 'para', text: 'When you **Seek Insight**, you can always ask, "What here is infused with magic?" for free, even on a 6-.' },
    ],
  },
  {
    id: 'seeker-conduit-of-power',
    name: 'Conduit of Power',
    leftControl: 1,
    rightControl: [{ type: 'dot', number: 3 }],
    body: [
      { kind: 'para', text: 'When you **would mark a Consequence from a major arcanum**, you can mark 1 box here instead, with no negative effect. (These marks never clear.)' },
    ],
  },
  {
    id: 'seeker-countermeasures',
    name: 'Countermeasures',
    leftControl: 1,
    body: [
      { kind: 'para', text: 'When you **witness a magical effect**, you may ask the GM, "how can this be countered or interrupted?" and get an honest answer. You or an ally gain advantage on your next roll to act on the answer.' },
    ],
  },
  {
    id: 'seeker-everything-bleeds',
    name: 'Everything Bleeds',
    leftControl: 1,
    body: [
      { kind: 'para', text: "When you **exploit an unnatural foe's specific weakness or vulnerability**, deal +1d6 damage." },
    ],
  },
  {
    id: 'seeker-everything-burns',
    name: 'Everything Burns',
    leftControl: 1,
    body: [
      { kind: 'para', text: 'When you **inspect a work of artifice or magic for a fatal flaw**, roll +INT: **on a 7+**, the GM will reveal the best way to destroy/sabotage it; **on a 10+**, you or an ally also gain advantage to act on the info.' },
    ],
  },
  { ...IMPROVED_STAT_BASE, id: 'seeker-improved-stat' },
  {
    id: 'seeker-initiate-of-the-secret-arts',
    name: 'Initiate of the Secret Arts',
    leftControl: 3,
    requiresLevel: 2,
    body: [
      { kind: 'para', text: 'You have a "Sacred Pouch" (3 Stock, *magical*), as per the Blessed, but with no remarkable traits. Each time you take this move, choose a Blessed move for which you otherwise qualify. (You can\'t take Improved Stat or Superior Stat.)' },
    ],
  },
  {
    id: 'seeker-lets-make-a-deal',
    name: "Let's Make a Deal",
    leftControl: 1,
    body: [
      { kind: 'para', text: 'When you **Seek Insight**, add "What do they really want or need?" to the list of questions. When you **Persuade by offering them something that you know they want or need**, treat a 7-9 as a 10+.' },
    ],
  },
  {
    id: 'seeker-logbook',
    name: 'Logbook',
    leftControl: 1,
    rightControl: [{ type: 'dot', number: 2 }],
    body: [
      { kind: 'para', text: 'You have a logbook (2 uses, *slow*) that doesn\'t take up space in your inventory. When you (and only you) **consult your logbook and expend a use**, you can ignore a Know Things roll you just made and treat the result as a 10+. When *the Seasons Change*, reset your logbook to 2 uses.' },
    ],
  },
  {
    id: 'seeker-magpie',
    name: 'Magpie',
    leftControl: 1,
    body: [
      { kind: 'para', text: 'When you **Have What You Need**, you can produce something strange, specific, maybe even valuable or a little bit magical, but if you do, tell us where you got it and 2 of the following:' },
      { kind: 'list', items: [
        "How it's not quite right, but maybe it'll do?",
        'The trouble you caused back home by getting it',
        'Why using it will draw unwanted attention',
        "That it's the only thing like this that you've got, and why it'll only work the one time",
      ] },
    ],
  },
  {
    id: 'seeker-never-at-a-loss',
    name: 'Never at a Loss',
    leftControl: 1,
    body: [
      { kind: 'para', text: "When you **Know Things and roll a 6-**, you may choose to not mark XP. If you don't mark XP, the worst that happens is that the GM tells you nothing interesting or useful about the subject, but instead tells you how you could learn more." },
    ],
  },
  {
    id: 'seeker-polyglot',
    name: 'Polyglot',
    leftControl: 1,
    body: [
      { kind: 'para', text: 'When you **first encounter a living language in play**, describe your proficiency with it (if any) and how you came to acquire it.' },
      { kind: 'para', text: 'When you **Know Things about any script, text, runes or symbols that you encounter**, you have advantage.' },
    ],
  },
  {
    id: 'seeker-cryptologist',
    name: 'Cryptologist',
    leftControl: 1,
    requires: ['seeker-polyglot'],
    body: [
      { kind: 'para', text: 'When you **study encoded, forgotten, or arcane marks or writing**, roll +INT: **on a 10+**, you can fully decipher them in just a few minutes; **on a 7-9**, you get the gist in a few minutes, but fully deciphering them will take an hour or so.' },
    ],
  },
  {
    id: 'seeker-quick-study',
    name: 'Quick Study',
    leftControl: 1,
    body: [
      { kind: 'para', text: 'When you **study something magical that should take months to understand**, it instead takes mere weeks. If it should take weeks, it takes days. If it should take days, it takes only a few hours.' },
    ],
  },
  {
    id: 'seeker-safety-first',
    name: 'Safety First',
    leftControl: 1,
    rightControl: [{ type: 'dot', number: 2 }],
    body: [
      { kind: 'para', text: 'When you **spend an hour or so preparing your mystical defenses**, hold 2 Protection. When you **are affected by harmful magic**, spend 1 Protection either to gain advantage on any roll to resist it or to halve its damage/effects.' },
    ],
  },
  {
    id: 'seeker-sage-advice',
    name: 'Sage Advice',
    leftControl: 1,
    body: [
      { kind: 'para', text: 'When **another PC asks you for guidance**, they get advantage on their next roll to follow your advice.' },
    ],
  },
  {
    id: 'seeker-arcane-adept',
    name: 'Arcane Adept',
    leftControl: 1,
    requiresLevel: 6,
    body: [
      { kind: 'para', text: 'When you **wish to invent a spell or magical effect**, detail its workings with the GM and Make a Plan to invent it. If you like, pick one requirement and ask the GM to provide an alternative (for example "first you must ___" could become "first you must ___, or it will take months").' },
    ],
  },
  {
    id: 'seeker-deep-insight',
    name: 'Deep Insight',
    leftControl: 1,
    requiresLevel: 6,
    requires: ['seeker-attuned'],
    body: [
      { kind: 'para', text: 'When you **Seek Insight about something magical**, you may ask one additional question, not limited to the list. Even on a 6-, you get to ask this question.' },
    ],
  },
  {
    id: 'seeker-improvise',
    name: 'Improvise',
    leftControl: 1,
    requiresLevel: 6,
    requires: ['seeker-quick-study'],
    body: [
      { kind: 'para', text: "When you **wish to use an arcanum's move or option without having unlocked it**, ask the GM what fool risk(s) it requires and/or what consequence(s) you'll incur. If you go for it, roll +INT: **on a 7+**, you get it to work this once — trigger the move or use the option as if you'd unlocked it; and **on a 10+**, also mark one step towards unlocking the arcanum's mysteries." },
    ],
  },
  { ...SUPERIOR_STAT_BASE, id: 'seeker-superior-stat' },
  {
    id: 'seeker-mind-over-magic',
    name: 'Mind Over Magic',
    leftControl: 1,
    requiresLevel: 6,
    body: [
      { kind: 'para', text: 'When you **roll to study or use an arcanum**, you can roll +INT instead of the stat you\'d normally roll.' },
    ],
  },
  {
    id: 'seeker-overchannel',
    name: 'Overchannel',
    leftControl: 1,
    requiresLevel: 6,
    requires: ['seeker-conduit-of-power'],
    body: [
      { kind: 'para', text: 'When you **would mark a Consequence from a major arcanum**, you may mark a debility instead.' },
    ],
  },
  {
    id: 'seeker-proof-against-detection',
    name: 'Proof Against Detection',
    leftControl: 1,
    requiresLevel: 6,
    requires: ['seeker-safety-first'],
    body: [
      { kind: 'para', text: "When you **hold Protection**, you can't be scried upon or sensed by magical means, and have advantage to Defy Danger by being stealthy." },
    ],
  },
];
