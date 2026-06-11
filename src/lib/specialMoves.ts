import type { MoveDefinition } from '@/types';

export const SPECIAL_MOVES: MoveDefinition[] = ([
  {
    id: 'advantage-disadvantage',
    name: 'Advantage/Disadvantage',
    body: [
      { kind: 'para', text: 'When you **make a roll with advantage**, roll an extra die and discard the lowest result.' },
      { kind: 'para', text: 'When you **make a roll with disadvantage**, roll an extra die and discard the highest result.' },
      { kind: 'para', text: 'When you **make a roll with both advantage and disadvantage**, they cancel each other out.' },
      { kind: 'para', text: 'If you **have advantage/disadvantage on a damage roll**, roll the main die twice and discard the lower/higher result. Then add any bonus dice that apply.' },
    ],
    citation: 'Book 1, p. 230',
  },
  {
    id: 'burn-brightly',
    name: 'Burn Brightly',
    body: [
      { kind: 'para', text: 'When you **have enough XP to Level Up (6 + twice your current level)**, you may spend 2 XP after any roll you make to add +1 to that roll (max +1 per roll).' },
    ],
    citation: 'Book 1, p. 231',
  },
  {
    id: 'deaths-door',
    name: "Death's Door",
    body: [
      { kind: 'para', text: "When you **are dying**, you glimpse the Last Door and the Lady of Crows (describe them). Then, roll +nothing: on a 10+, you wrest yourself back to the realm of the living—return to 1 HP but say how your brush with death has marked you; on a 7-9, the Lady waves you off—you're no longer dying but you're out of the action; on a 6-, your time has come—choose 1:" },
      { kind: 'list', items: [
        'Make one last move as if you rolled a 12+, then step through the Last Door',
        'Refuse to go; gain the Revenant or Ghost insert',
        'Call on one of the Things Below by name and beseech it to intercede; gain the Thrall insert',
      ] },
    ],
    citation: 'Book 1, p. 245',
  },
  {
    id: 'end-of-session',
    name: 'End of Session',
    body: [
      { kind: 'para', text: 'When a **session ends**, point out how you demonstrated or struggled with your instinct. If you can, mark XP.' },
      { kind: 'para', text: 'Say how your relationship with or opinion of a PC, NPC, or group has changed. If you can, mark XP.' },
      { kind: 'para', text: 'Answer these questions as a group. For each "yes," everyone marks XP.' },
      { kind: 'list', items: [
        'Did we learn more about the world or its history?',
        'Did we defeat a threat to Stonetop or the region?',
        'Did we improve our standing with our neighbors?',
        'Did we make a lasting improvement to Stonetop, or tangible progress towards doing so?',
      ] },
      { kind: 'para', text: 'Praise something about the session (in the fiction or around the table) that you enjoyed or appreciated.' },
      { kind: 'para', text: 'Finally, offer up a wish for future sessions: more __, less __, a chance to __, handling __ in a different way, etc. Wishes can be about what happens in the fiction or around the table. The GM will take notes.' },
    ],
    citation: 'Book 1, p. 232',
  },
] satisfies MoveDefinition[]).sort((a, b) => a.name.localeCompare(b.name));
