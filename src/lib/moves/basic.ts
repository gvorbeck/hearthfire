import type { MoveDefinition } from '@/types';

export const BASIC_MOVES: MoveDefinition[] = ([
  {
    id: 'aid',
    name: 'Aid',
    body: [
      {
        kind: 'para',
        text: 'When you **help someone who has not yet rolled**, the GM picks 1:',
      },
      {
        kind: 'list',
        items: [
          'They can accomplish more than they could alone',
          'They gain advantage on their roll.',
        ],
      },
      {
        kind: 'para',
        text: 'Either way, you are exposed to any risk, cost, or consequence associated with their roll.',
      },
    ],
    citation: 'Book 1, p. 212',
  },
  {
    id: 'clash',
    name: 'Clash',
    body: [
      {
        kind: 'para',
        text: 'When you **fight in melee or close quarters**, roll +STR: on a 10+, your maneuver works as expected (deal your damage) and pick 1:',
      },
      {
        kind: 'list',
        items: [
          "Avoid, prevent, or counter your enemy's attack",
          "Strike hard and fast, for 1d6 extra damage, but suffer your enemy's attack",
        ],
      },
      {
        kind: 'para',
        text: "On a 7-9, your maneuver works, mostly (deal your damage), but you suffer your enemy's attack.",
      },
    ],
    citation: 'Book 1, p. 214',
  },
  {
    id: 'defend',
    name: 'Defend',
    body: [
      {
        kind: 'para',
        text: 'When you **take up a defensive stance or jump in to protect others**, roll +CON: on a 10+, hold 3 Readiness (or 4 if you bear a shield); on a 7-9, hold 1 Readiness (or 2 with a shield). You can spend Readiness 1-for-1 to:',
      },
      {
        kind: 'list',
        items: [
          "Suffer an attack's damage/effects instead of your ward",
          "Halve an attack's effect or damage",
          'Draw all attention from your ward to yourself',
          'Strike back at an attacker (deal your damage, with disadvantage)',
        ],
      },
      {
        kind: 'para',
        text: 'When you **go on the offense, cease to focus on defense, or the threat passes**, lose any Readiness that you hold.',
      },
    ],
    citation: 'Book 1, p. 216',
  },
  {
    id: 'defy-danger',
    name: 'Defy Danger',
    body: [
      {
        kind: 'para',
        text: 'When **danger looms, the stakes are high, and you do something chancy**, check if another move applies. If not, roll...',
      },
      {
        kind: 'list',
        items: [
          '+STR to power through or test your might',
          '+DEX to employ speed, agility, or finesse',
          '+CON to endure or hold steady',
          '+INT to apply expertise or enact a clever plan',
          '+WIS to exert willpower or rely on your senses',
          '+CHA to charm, bluff, impress, or fit in',
        ],
      },
      {
        kind: 'para',
        text: 'On a 10+, you pull it off as well as one could hope; on a 7-9, you can do it, but the GM will present a lesser success, a cost, or a consequence (and maybe a choice between them, or a chance to back down).',
      },
    ],
    citation: 'Book 1, p. 210',
  },
  {
    id: 'interfere',
    name: 'Interfere',
    body: [
      {
        kind: 'para',
        text: "When you **try to foil another PC's action and neither of you back down**, roll...",
      },
      {
        kind: 'list',
        items: [
          '+STR to power through or test your might',
          '+DEX to employ speed, agility, or finesse',
          '+CON to endure or hold steady',
          '+INT to apply expertise or enact a clever plan',
          '+WIS to exert willpower or rely on your senses',
          '+CHA to charm, bluff, impress, or fit in',
        ],
      },
      {
        kind: 'para',
        text: 'on a 10+, they pick 1 from the list below; on a 7-9, they pick 1 from the list below but you are left off-balance, exposed, or otherwise vulnerable.',
      },
      {
        kind: 'list',
        items: [
          'Do it anyway, but with disadvantage on their (next) roll',
          'Relent, change course, or otherwise allow their move to be foiled',
        ],
      },
    ],
    citation: 'Book 1, p. 218',
  },
  {
    id: 'know-things',
    name: 'Know Things',
    body: [
      {
        kind: 'para',
        text: "When you **consult your accumulated knowledge**, roll +INT: on a 10+, the GM will tell you something interesting and useful about the topic at hand; on a 7-9, the GM will tell you something interesting—it's on you to make it useful; either way, the GM might ask \"how do you know this?\"",
      },
    ],
    citation: 'Book 1, p. 220',
  },
  {
    id: 'let-fly',
    name: 'Let Fly',
    body: [
      {
        kind: 'para',
        text: "When you **take an easy shot with a ranged weapon**, deal your damage. **If the shot is tricky or you're under pressure**, first roll +DEX: on a 10+, you have a clear shot, deal your damage; on a 7-9, pick 1:",
      },
      {
        kind: 'list',
        items: [
          "Deal your damage, but deplete your ammo (mark the next status by your weapon; don't pick this if your weapon lacks such statuses)",
          "Hold steady and wait for a clear shot; when the moment arrives (GM's call), deal your damage",
          'Move to get a clear shot—exposing yourself to danger or giving up some advantage (GM says how)—then deal your damage',
          "Rush the shot and deal your damage, leading to a cost or complication of the GM's choice",
        ],
      },
    ],
    citation: 'Book 1, p. 222',
  },
  {
    id: 'persuade-npcs',
    name: 'Persuade (vs. NPCs)',
    body: [
      {
        kind: 'para',
        text: "When you **press or entice an NPC**, say what you want them to do (or not do). If they **have reason to resist**, roll +CHA: on a 10+, they either do as you want or reveal the easiest way to convince them; on a 7-9, they reveal something you can do to convince them, though it'll likely be costly, tricky, or distasteful.",
      },
    ],
    citation: 'Book 1, p. 224',
  },
  {
    id: 'persuade-pcs',
    name: 'Persuade (vs. PCs)',
    body: [
      {
        kind: 'para',
        text: 'When you **press or entice a PC and they resist**, ask their player: "Could I possibly get you to do this, yes or no?" If they say "no," let it drop.',
      },
      {
        kind: 'para',
        text: "If they say \"yes,\" you can roll +CHA: on a 10+, they mark XP if they do what you want, and if they don't, they must say how you could convince them; on a 7-9, they mark XP if they do what you want (but can refuse or make a counter-offer if they like).",
      },
    ],
    citation: 'Book 1, p. 226',
  },
  {
    id: 'seek-insight',
    name: 'Seek Insight',
    body: [
      {
        kind: 'para',
        text: 'When you **study a situation or person**, looking to the GM for insight, roll +WIS: on a 10+, ask the GM 3 questions from the list below; on a 7-9, ask 1; either way, take advantage on your next move to act on the answers.',
      },
      {
        kind: 'list',
        items: [
          'What happened here recently?',
          'What is about to happen?',
          'What should I be on the lookout for?',
          'What here is useful or valuable to me?',
          'Who or what is really in control here?',
          'What here is not what it appears to be?',
        ],
      },
    ],
    citation: 'Book 1, p. 228',
  },
] satisfies MoveDefinition[]).sort((a, b) => a.name.localeCompare(b.name));
