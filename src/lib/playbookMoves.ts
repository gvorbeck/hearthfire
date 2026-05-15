import type { MoveDefinition } from "@/components/CharacterSheet/Move";
import type { PlaybookType } from "@/types";

const BLESSED_MOVES: MoveDefinition[] = [
  {
    id: "blessed-anointed",
    name: "Anointed",
    trigger: "you mark someone with the sacred ash and speak a blessing over them",
    body: "Roll +WIS. On a 10+, hold 2. On a 7–9, hold 1. Spend your hold 1-for-1 to:",
    list: [
      "Grant them +1 forward on a roll of their choice",
      "Negate one instance of damage or a debility they would suffer",
      "Heal 1d6 damage they have taken",
    ],
    selectable: true,
  },
  {
    id: "blessed-beseeching",
    name: "Beseeching",
    trigger: "you call out to Danu in a moment of dire need",
    body: "Roll +WIS. On a 10+, she answers; the GM will tell you what she offers. On a 7–9, she answers, but her aid comes with a cost or condition.",
    selectable: true,
  },
  {
    id: "blessed-charmed-life",
    name: "Charmed Life",
    trigger: "you would take damage that would kill or incapacitate you",
    body: "Roll +WIS. On a 10+, Danu intervenes; reduce the damage to 1. On a 7–9, Danu softens the blow; take half damage instead.",
    selectable: true,
  },
  {
    id: "blessed-conduct-auspices",
    name: "Conduct Auspices",
    trigger: "you perform the rites and read the signs before an undertaking",
    body: "Roll +WIS. On a 10+, ask the GM 2 questions from the list below. On a 7–9, ask 1.",
    list: [
      "What omen does Danu send regarding this undertaking?",
      "What sacrifice or preparation would earn her favor?",
      "What danger or obstacle lies ahead that I should know of?",
      "Who among us does Danu watch over on this journey?",
    ],
    selectable: true,
  },
  {
    id: "blessed-hex",
    name: "Hex",
    trigger:
      "you call down Danu's wrath upon someone who has wronged the steading or her ways",
    body: "Roll +WIS. On a 10+, the curse takes hold; the GM picks 2 effects. On a 7–9, the curse takes hold; the GM picks 1 effect.",
    list: [
      "They suffer -1 ongoing until the wrong is righted",
      "Their next dangerous undertaking goes badly awry",
      "They are marked — spirits and animals shun or menace them",
      "They sicken slowly until the curse is lifted",
    ],
    selectable: true,
  },
  {
    id: "blessed-laying-on-hands",
    name: "Laying on Hands",
    trigger: "you tend to someone's wounds with prayer and touch",
    body: "Roll +WIS. On a 10+, heal 1d8 damage and, if they are debilitated, remove one debility. On a 7–9, heal 1d8 damage or remove a debility, your choice.",
    selectable: true,
  },
  {
    id: "blessed-light-the-fires",
    name: "Light the Fires",
    trigger: "you lead the steading in the sacred rites at season's turn",
    body: "Roll +WIS. On a 10+, hold 3 Favor. On a 7–9, hold 1 Favor. Spend Favor 1-for-1 in lieu of Stock on any Blessed move.",
    selectable: true,
    uses: 4,
  },
  {
    id: "blessed-polyglot",
    name: "Polyglot",
    trigger:
      "you attempt to communicate with a spirit, creature, or being whose language you don't speak",
    body: "Roll +WIS. On a 10+, you understand each other well enough. On a 7–9, you get the gist but something is lost in translation.",
    selectable: true,
  },
  {
    id: "blessed-spirit-tongue",
    name: "Spirit Tongue",
    trigger: "you commune with the spirits of a place",
    body: "Roll +WIS. On a 10+, the spirits are forthcoming; ask 3 questions from the list. On a 7–9, ask 1 and the spirits ask one of you in return.",
    list: [
      "What has disturbed this place recently?",
      "What power or presence lingers here?",
      "What do the spirits fear or desire?",
      "What hidden thing would you have me know?",
    ],
    selectable: true,
  },
  {
    id: "blessed-turn-the-dark",
    name: "Turn the Dark",
    trigger:
      "you brandish Danu's sign against creatures of darkness or corruption",
    body: "Roll +WIS. On a 10+, they are driven back or flee. On a 7–9, they are checked but not routed; they hold their ground and glower.",
    selectable: true,
  },
];

export const PLAYBOOK_MOVES: Partial<Record<PlaybookType, MoveDefinition[]>> = {
  blessed: BLESSED_MOVES,
};
