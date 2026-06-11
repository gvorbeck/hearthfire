import type { MoveDefinition } from '@/types';

export const EXPEDITION_MOVES: MoveDefinition[] = ([
  {
    id: 'forage',
    name: 'Forage',
    body: [
      {
        kind: 'para',
        text: 'When you **spend a few hours seeking food in the wild**, roll +WIS. In winter, you have disadvantage. On a 10+, pick 2; on a 7-9, pick 1:',
      },
      {
        kind: 'list',
        items: [
          'You acquire provisions (1d6 uses)',
          'You acquire an extra 1d6 uses of provisions',
          'You discover something interesting or useful',
          'You avoid danger or risk (else, there is some)',
        ],
      },
      {
        kind: 'para',
        text: 'Provisions can substitute for supplies when you Make Camp, 1-for-1.',
      },
    ],
    citation: 'Book 1, p. 336',
  },
  {
    id: 'make-camp',
    name: 'Make Camp',
    body: [
      {
        kind: 'para',
        text: 'When you **settle in to rest in an unsafe area**, answer the GM\'s questions about your campsite. Each member of the party must consume 1 use of supplies or provisions; if you use a ◊ mess kit (requires fire & water), then 1 use can provide for up to four people.',
      },
      {
        kind: 'para',
        text: 'If you **eat and drink your fill**, and **get at least a few hours of sleep**, pick 1.',
      },
      {
        kind: 'list',
        items: [
          'Regain HP equal to ½ your max',
          'Clear a debility',
        ],
      },
      {
        kind: 'para',
        text: 'If **your rest was particularly peaceful, comfortable, or enjoyable**, you also gain advantage on your next roll.',
      },
    ],
    citation: 'Book 1, pp. 248, 334',
  },
  {
    id: 'return-triumphant',
    name: 'Return Triumphant',
    body: [
      {
        kind: 'para',
        text: 'When you **return home in triumph**, having saved your fellows, put down the threat, seized the opportunity, etc., then clear one of the steading\'s debilities (diminished, lacking, or malcontent). If the steading has no debilities marked, then increase Fortunes by 1.',
      },
    ],
    citation: 'Book 1, p. 339',
  },
  {
    id: 'chart-a-course',
    name: 'Chart a Course',
    body: [
      {
        kind: 'para',
        text: 'When you **wish to travel to a distant place**, name or describe your destination ("Gordin\'s Delve," "the hagr\'s lair," or "wherever these tracks lead"). If the route is unclear, tell the GM how you intend to reach it. The GM will then tell you what\'s required, the risks, and how long it will likely take.',
      },
      {
        kind: 'para',
        text: 'When you **set out on the journey**, the GM will present each of the challenges one at a time—plus any surprises that you couldn\'t have seen coming—in whatever order makes the most sense. Address them all and reach your destination.',
      },
    ],
    citation: 'Book 1, p. 302',
  },
  {
    id: 'have-what-you-need',
    name: 'Have What You Need',
    body: [
      {
        kind: 'para',
        text: 'When you **decide that you had something all along**, transfer a mark (or marks) from your "undefined" inventory to a specific item or a slot. If you mark a slot, fill it with a common mundane item or something from your personal possessions.',
      },
      {
        kind: 'para',
        text: 'Alternately, you can expend a use of supplies to mark an additional small item/slot (□).',
      },
      {
        kind: 'para',
        text: 'Whatever you produce, it must be something you could have had all along. The GM or any player can veto unreasonable items.',
      },
    ],
    citation: 'Book 1, p. 326',
  },
  {
    id: 'keep-company',
    name: 'Keep Company',
    body: [
      {
        kind: 'para',
        text: 'When you **spend a stretch of time together**, ask the others if they want to Keep Company. If they do, take turns asking a PC or NPC one of the following.',
      },
      {
        kind: 'list',
        items: [
          'What do you do that\'s annoying/endearing?',
          'What do I do that you find annoying/endearing?',
          'Who or what seems to be on your mind?',
          'What do we find ourselves talking about?',
          'How do you/we pass the time?',
          'What new thing do you reveal about yourself?',
        ],
      },
    ],
    citation: 'Book 1, p. 332',
  },
  {
    id: 'outfit',
    name: 'Outfit',
    body: [
      {
        kind: 'para',
        text: 'When you **prepare for an expedition in a friendly community**, mark as many ◊ on your Inventory insert as you wish to carry, either on specific items or in "undefined." Mark up to 3◊ for a light load (quick and quiet), 4-6◊ for a normal load, or 7-9◊ for a heavy load (noisy, slow, quick to tire). Also, mark a number of □ in the **Small items** section equal to 4+Prosperity (on specific items in "undefined").',
      },
      {
        kind: 'para',
        text: 'You can select...',
      },
      {
        kind: 'list',
        items: [
          'Items printed on the Inventory insert',
          'Other common, mundane items',
          'Any of your personal possessions',
          'Special items for which you Trade & Barter',
        ],
      },
      {
        kind: 'para',
        text: 'Tell the GM what you\'re bringing, and answer their questions about your gear and where you got it.',
      },
    ],
    citation: 'Book 1, p. 306',
  },
  {
    id: 'recover',
    name: 'Recover',
    body: [
      {
        kind: 'para',
        text: 'When you **take time to catch your breath and tend to what ails you**, expend 1 use of supplies and recover HP equal to 4+Prosperity. You can\'t gain this benefit again until you take more damage.',
      },
      {
        kind: 'para',
        text: 'When you **tend to a debility or a problematic wound**, say how. The GM will either say that it\'s taken care of or tell you what\'s required to do so (Defying Danger, expending supplies or some other resource, finding ___, Making Camp, etc.).',
      },
    ],
    citation: 'Book 1, p. 328',
  },
  {
    id: 'requisition',
    name: 'Requisition',
    body: [
      {
        kind: 'para',
        text: "When you **borrow some of the steading's assets for an expedition** (like the horses or a plow), roll +Fortunes: on a 10+, go ahead, but bring it back safely; on a 7-9, you'll need to do some convincing; on a 6-, don't mark XP—you can take the asset with you if you want, but if you do, reduce Fortunes by 1.",
      },
    ],
    citation: 'Book 1, p. 308',
  },
  {
    id: 'struggle-as-one',
    name: 'Struggle as One',
    body: [
      {
        kind: 'para',
        text: 'When you **Defy Danger as a group**, establish the party\'s approach and each roll +STAT (per Defy Danger): on a 6-, you find yourself in a spot, the GM will describe it or ask you to; on a 7-9, you pull your weight; on a 10+, you do well enough to get someone else out of a spot, if you can tell us how.',
      },
      {
        kind: 'para',
        text: 'If you roll a 6- but someone saves you, don\'t mark XP.',
      },
    ],
    citation: 'Book 1, p. 328',
  },
] satisfies MoveDefinition[]).sort((a, b) => a.name.localeCompare(b.name));
