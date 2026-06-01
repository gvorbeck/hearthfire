import type { MoveDefinition } from '@/types';

export const FOLLOWER_MOVES: MoveDefinition[] = [
  {
    id: 'order-followers',
    name: 'Order Followers',
    triggerOverride: 'When you **direct your follower to do something that would trigger a player move**, and they do it, they trigger the move. If the move involves rolling, you roll for them. Instead of rolling +STAT, roll and...',
    list: [
      'if they have at least one appropriate tag or move, add +1, or +2 if they\'re also exceptional;',
      'if they have no relevant tag or move, add +0; and',
      'if any of their tags would get in the way, roll with disadvantage.',
    ],
    footer: 'When a follower is without orders or they act on their own initiative, the GM says what they do and decides how it goes.',
    citation: 'Book 1, p. 462',
  },
  {
    id: 'strengthen-your-bond',
    name: 'Strengthen Your Bond',
    triggerOverride: "When you **pay your follower's cost**, and you haven't done so recently, they hold +1 Loyalty (max 3).",
    body: 'Spend your follower\'s Loyalty 1-for-1 to have them:',
    list: [
      'Overcome their fear to do as you say',
      'Resist acting on their instinct/tags/traits',
      "Do something they don't want to do (as long as it's not abhorrent or suicidal)",
    ],
    footer: 'When a follower is without orders or they act on their own initiative, the GM says what they do and decides how it goes.',
    citation: 'Book 1, p. 464',
  },
].sort((a, b) => a.name.localeCompare(b.name));
