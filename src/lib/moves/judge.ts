import type { MoveDefinition } from '@/types';
import { IMPROVED_STAT_BASE, SUPERIOR_STAT_BASE } from './_statMoves';

export const JUDGE_MOVES: MoveDefinition[] = [
  {
    id: 'judge-aegis-of-faith',
    name: 'Aegis of Faith',
    leftControl: 1,
    body: [
      { kind: 'para', text: 'When you **wield a shield**, it can turn away spells, magical effects, and insubstantial attacks as if they were physical blows.' },
    ],
  },
  {
    id: 'judge-armored',
    name: 'Armored',
    leftControl: 1,
    body: [
      { kind: 'para', text: 'When you **carry a shield**, mark only ◈ (instead of ◈◈). Also, you can ignore the *cumbersome* tag on any armor you wear.' },
      { kind: 'para', text: 'If you take this move at the start of play, add an ◊◊ iron hauberk, ◊◊ bronze cuirass, or ◊◊ scale coat to your inventory (all are 2 armor, *warm, cumbersome*).' },
    ],
  },
  {
    id: 'judge-bear-witness',
    name: 'Bear Witness',
    leftControl: 1,
    body: [
      { kind: 'para', text: 'When you **speak the truth with conviction and candor**, none can doubt you. They might deny what you say, but in their hearts they recognize the truth.' },
    ],
  },
  {
    id: 'judge-break-bread',
    name: 'Break Bread',
    leftControl: 1,
    body: [
      { kind: 'para', text: 'When you **share a proper meal with someone and each of you eats their fill**, each of you recovers 1d8 (extra) HP.' },
    ],
  },
  {
    id: 'judge-bulwark',
    name: 'Bulwark',
    leftControl: 1,
    body: [
      { kind: 'para', text: 'When you **Defend**, you can spend 1 Readiness to stand fast, holding your position despite what befalls you.' },
    ],
  },
  {
    id: 'judge-censure',
    name: 'Censure',
    leftControl: 1,
    startingMove: true,
    body: [
      { kind: 'para', text: 'When you **first denounce an individual in your presence as an agent of chaos or anathema to civilization**, they pick 1:' },
      { kind: 'list', items: [
        'They are ashamed, and act accordingly',
        'They are doubtful, and hesitate, pause',
        'They are afraid, and seek to escape',
        'They are enraged, and lash out predictably (the next roll against them has advantage)',
      ] },
    ],
  },
  {
    id: 'judge-castigate',
    name: 'Castigate',
    leftControl: 1,
    requiresLevel: 2,
    requires: ['judge-censure'],
    body: [
      { kind: 'para', text: 'When you **Censure someone**, your voice deals 1d4 damage to them (*near*, *loud*, ignores armor).' },
    ],
  },
  {
    id: 'judge-chronicler-of-stonetop',
    name: 'Chronicler of Stonetop',
    leftControl: 1,
    startingMove: true,
    rightControl: [{ type: 'dot', number: 3 }],
    body: [
      { kind: 'para', text: 'When you **write up detailed session notes and share them with the other players**, hold +1 Diligence.' },
      { kind: 'para', text: 'You can spend 1 Diligence at any time to add +1 to a roll that you or a fellow player just made.' },
    ],
  },
  {
    id: 'judge-for-the-greater-good',
    name: 'For the Greater Good',
    leftControl: 1,
    body: [
      { kind: 'para', text: 'When you **Persuade someone to act in defense of their community or civilization at large**, you have advantage.' },
    ],
  },
  {
    id: 'judge-hound-of-aratis',
    name: 'Hound of Aratis',
    leftControl: 1,
    body: [
      { kind: 'para', text: 'When you **Seek Insight**, you can always ask "What here is tainted by chaos?" for free, even on a 6-.' },
    ],
  },
  {
    id: 'judge-like-a-dog-with-a-bone',
    name: 'Like a Dog With a Bone',
    leftControl: 1,
    requires: ['judge-hound-of-aratis'],
    body: [
      { kind: 'para', text: 'When you **attack something you know to be tainted by chaos**, deal +1d6 damage.' },
    ],
  },
  { ...IMPROVED_STAT_BASE, id: 'judge-improved-stat' },
  {
    id: 'judge-knowledge-is-power',
    name: 'Knowledge is Power',
    leftControl: 1,
    body: [
      { kind: 'para', text: 'When you **roll 10+ to Know Things**, you or an ally gain advantage on the next roll to act on what you learn.' },
    ],
  },
  {
    id: 'judge-many-hands-make-light-work',
    name: 'Many Hands Make Light Work',
    leftControl: 1,
    body: [
      { kind: 'para', text: 'When you **jump in to help another character who just rolled**, tell us how and ask the GM what else is required or what the consequences will be. If you accept, increase your ally\'s roll by +1.' },
    ],
  },
  {
    id: 'judge-a-bundle-of-sticks-unbroken',
    name: 'A Bundle of Sticks Unbroken',
    leftControl: 1,
    requires: ['judge-many-hands-make-light-work'],
    body: [
      { kind: 'para', text: 'When you Struggle as One, you and one ally of your choice have advantage.' },
    ],
  },
  {
    id: 'judge-the-hammer-and-the-book',
    name: 'The Hammer and the Book',
    leftControl: 1,
    body: [
      { kind: 'para', text: 'When you **strike a thing of supernatural chaos**, roll +WIS: **on a 10+**, deal your damage and choose 1 from the list below; **on a 7-9**, deal your damage and choose 1, but you also expose yourself to harm or unwanted attention.' },
      { kind: 'list', items: [
        'Deal +1d6 damage',
        "Ignore the thing's armor or other defenses",
        'Suppress one of its unnatural powers',
        'Force it from its host',
      ] },
    ],
  },
  {
    id: 'judge-truth-or-consequences',
    name: 'Truth or Consequences',
    leftControl: 1,
    body: [
      { kind: 'para', text: 'When you **look into someone\'s eyes and gaze upon their soul**, you can ask their player, "Are you lying or hiding something from me?" and get an honest answer. If the answer is "Yes," you have advantage on your next roll against them.' },
      { kind: 'para', text: 'When you **lie or otherwise deceive someone through words**, you have disadvantage on your next roll against them.' },
    ],
  },
  {
    id: 'judge-binding-arbitration',
    name: 'Binding Arbitration',
    leftControl: 1,
    requires: ['judge-truth-or-consequences'],
    body: [
      { kind: 'para', text: 'When you **bear witness to someone\'s promise or oath**, henceforth you may ask their player if they have kept their word. They must answer honestly. The character need not be present. If **they have broken their word**, you gain advantage on all rolls against them until they admit their wrong and suffer an appropriate consequence (your call).' },
    ],
  },
  {
    id: 'judge-vision-unclouded',
    name: 'Vision Unclouded',
    leftControl: 1,
    body: [
      { kind: 'para', text: 'When you **Seek Insight**, you can always ask "What here is hidden by illusion or magic?" for free, even on a 6-.' },
    ],
  },
  {
    id: 'judge-well-read',
    name: 'Well-Read',
    leftControl: 1,
    body: [
      { kind: 'para', text: 'When you **name the source in which you read about the matter at hand**, roll +WIS to Know Things instead of +INT.' },
    ],
  },
  {
    id: 'judge-a-mighty-rampart',
    name: 'A Mighty Rampart',
    leftControl: 1,
    requiresLevel: 6,
    requires: ['judge-bulwark'],
    body: [
      { kind: 'para', text: 'When you **hold Readiness** (from Defend), you cannot be forced from your position. Also, you can spend 1 Readiness to completely ignore the effects/damage of an attack that you suffer.' },
    ],
  },
  {
    id: 'judge-armistice',
    name: 'Armistice',
    leftControl: 1,
    requiresLevel: 6,
    requires: ['judge-bear-witness'],
    body: [
      { kind: 'para', text: 'When you **approach an enemy to negotiate in good faith**, they will at least hear you out. Even the most debased and savage foe will delay violence until you\'ve had your say.' },
    ],
  },
  {
    id: 'judge-condemn',
    name: 'Condemn',
    leftControl: 1,
    requiresLevel: 6,
    requires: ['judge-censure'],
    body: [
      { kind: 'para', text: 'When you **Censure someone**, they are marked with a mystical brand that cannot be removed or hidden until you dismiss it. Any intelligent creature who sees the mark recognizes the bearer as an agent of chaos and anathema to civilization.' },
    ],
  },
  {
    id: 'judge-proclamation',
    name: 'Proclamation',
    leftControl: 1,
    requiresLevel: 6,
    requires: ['judge-condemn'],
    body: [
      { kind: 'para', text: 'When you **Censure**, you may denounce a group or faction as long as you can clearly identify them. Apply the effects of Censure to every member of that group, regardless of distance.' },
    ],
  },
  {
    id: 'judge-mirrorshield',
    name: 'Mirrorshield',
    leftControl: 1,
    requiresLevel: 6,
    requires: ['judge-aegis-of-faith'],
    body: [
      { kind: 'para', text: 'When you **Defend with a shield**, you can spend 1 Readiness to intercept a magical force and redirect it to a different target (or none).' },
    ],
  },
  { ...SUPERIOR_STAT_BASE, id: 'judge-superior-stat' },
  {
    id: 'judge-the-tower-eternal',
    name: 'The Tower Eternal',
    leftControl: 1,
    requiresLevel: 6,
    body: [
      { kind: 'para', text: 'When you **Defy Danger against magic**, treat a result of 6- as a 7-9.' },
    ],
  },
];
