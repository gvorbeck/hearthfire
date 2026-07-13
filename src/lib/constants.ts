import type { PlaybookType } from "@/types";

export const DEFAULT_GAME_NAME = "Stonetop Game";
export const GAMES_COLLECTION = "games";

// Shown when a Firestore write fails. Both useGame's central reportSave wrapper
// and useDebouncedSave's per-field handler toast this on failure; the Toast
// dedupes by exact message, so a debounced field that fails through both paths
// collapses to one toast. Keep them sharing this constant — diverging the text
// would silently produce double toasts.
export const SAVE_ERROR_MESSAGE =
  "Couldn't save your changes — check your connection.";

// Shown when a write is rejected because the game document exceeds Firestore's
// 1 MiB per-doc ceiling (surfaced as the `invalid-argument` code). The whole
// game lives in one doc, so this is reachable with enough content. Both save
// paths (useGame's reportSave and useDebouncedSave's handler) map the code to
// this same string so the Toast dedupe collapses them to one — same reason
// SAVE_ERROR_MESSAGE is shared.
export const DOC_TOO_LARGE_MESSAGE =
  "This game has grown too large to save. Trim some content (long notes, unused characters) and try again.";

export interface PlaybookOption {
  value: PlaybookType;
  label: string;
  description: string;
  hpMax: number;
  damage: string;
  choose?: number;
  helperText?: string;
}

export const PLAYBOOKS: PlaybookOption[] = [
  {
    value: "blessed",
    label: "The Blessed",
    description:
      "Danu, the Great Mother, provides. We need only learn her secrets: the names by which the trees call each other; the mark made with redberry juice to ward off impure spirits; the language of the wolves. A thousand such secrets Danu keeps, to share with only her true children. Her Blessed.",
    hpMax: 18,
    damage: "d6",
    choose: 4,
    helperText:
      "You start with Spirit Tongue, Call the Spirits, 1 from your Background, and 1 of your choice.",
  },
  {
    value: "fox",
    label: "The Fox",
    description:
      "The elders tell a story about Fox, who knows lots of tricks, and Hedgehog, who knows one: how to curl up into a ball when there's danger. Fox can't eat Hedgehog when he's all curled up, so in the story Fox goes hungry. But you're not that Fox, and this is no story. You want that Hedgehog? Go get a knife.",
    hpMax: 16,
    damage: "d8",
    helperText:
      "You start with Ambush OR Skill at Arms; Danger Sense OR Perceptive; and 1 of your choice.",
  },
  {
    value: "heavy",
    label: "The Heavy",
    description:
      "These are good people. Hard-working, honest. They look out for each other. But sometimes, looking out for each other ain't enough. Sometimes, good people need someone to stick up for them. Someone who's not afraid to get a little bloody. To get heavy. Yeah, someone like you.",
    hpMax: 20,
    damage: "d10",
    helperText:
      "You start with Dangerous, Hard to Kill, and either Armored OR Uncanny Reflexes.",
  },
  {
    value: "judge",
    label: "The Judge",
    description:
      "Look here at this little town, this candleflame in the darkness. Its very existence is an act of courage and faith. And Aratis has charged you to keep it: to settle its disputes; to chronicle its tales; to defend it from darkness and ruin. Take up your hammer, Judge. Your town needs you.",
    hpMax: 20,
    damage: "d6",
    helperText:
      "You start with Censure, Chronicler of Stonetop, plus 2 more of your choice.",
  },
  {
    value: "lightbearer",
    label: "The Lightbearer",
    description:
      "Imagine yourself and your kin in a cave lit by a single torch, entranced by shadow puppet stories. Imagine realizing there is a greater truth, and stepping out of the cave into the true Light of day. Would you not bring that Light back into the darkness, to set your people free?",
    hpMax: 18,
    damage: "d4",
    helperText:
      "You start with Consecrated Flame and Invoke the Sun God, plus 1 more of your choice.",
  },
  {
    value: "marshal",
    label: "The Marshal",
    description:
      "Hoping for peace isn't enough. Trouble always comes knocking. And that's why we need you: to run the drills, to man the towers, to take charge when things get bad. To be cold enough to sendyour neighbors to a sure death in order to keep Stonetop safe. That's the job, Marshal. You up for it?",
    hpMax: 20,
    damage: "d8",
    helperText:
      "You start with Crew, Logistics, any moves from your Background, and 1 move of your choice.",
  },
  {
    value: "ranger",
    label: "The Ranger",
    description:
      "Your true home is out there. Away from the Old Roads, in the wild places, where you've facedstorm and beast alike. But unknown forces are at work beyond the Ringwall, and you fear for your kith and kin. These are strange times. Guide them, ranger, and keep them safe when darkness falls.",
    hpMax: 18,
    damage: "d8",
    helperText:
      "You start with Home on the Range, any moves from your Background, plus 1 of your choice.",
  },
  {
    value: "seeker",
    label: "The Seeker",
    description:
      "Look at us. Huddling behind our walls, hearing evil in every passing noise. Cowards, all. All, but you. You fear not the unknown. You plunge into it, searching. Grasping at what has been lost. What will you find, o Seeker? Signs of a bright new age? Or signs of our doom?",
    hpMax: 16,
    damage: "d6",
    helperText:
      "You start with Well Versed, Work With What You've Got, plus 1 from your Background.",
  },
  {
    value: "would-be-hero",
    label: "The Would-be Hero",
    description:
      "Most people hope for a quiet life. They spend their days a-worrying: about a leaky roof, a sick child, their crops. But you aren't like most people—you're on a different path. A path to adventure! There's greatness in you. Let's hope you live long enough for everyone else to see it.",
    hpMax: 16,
    damage: "d6",
    helperText:
      "You start with Anger is a Gift, Potential for Greatness, and 2 other moves of your choice.",
  },
];

export const getPlaybook = (value: PlaybookType): PlaybookOption | undefined =>
  PLAYBOOKS.find((p) => p.value === value);
