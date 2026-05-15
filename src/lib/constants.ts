import type { PlaybookType } from "@/types";

export const DEFAULT_GAME_NAME = "Stonetop Game";
export const GAMES_COLLECTION = "games";

export interface PlaybookOption {
  value: PlaybookType;
  label: string;
  description: string;
}

export const PLAYBOOKS: PlaybookOption[] = [
  {
    value: "blessed",
    label: "The Blessed",
    description:
      "Danu, the Great Mother, provides. We need only learn her secrets: the names by which the trees call each other; the mark made with redberry juice to ward off impure spirits; the language of the wolves. A thousand such secrets Danu keeps, to share with only her true children. Her Blessed.",
  },
  {
    value: "fox",
    label: "The Fox",
    description:
      "Quick, clever, and hard to pin down. You solve problems others can't see coming, talk your way out of situations others can't escape, and find angles others miss entirely.",
  },
  {
    value: "heavy",
    label: "The Heavy",
    description:
      "Big, strong, and hard to put down. Violence is a tool you understand better than most. The question is whether you can control it—or whether it controls you.",
  },
  {
    value: "judge",
    label: "The Judge",
    description:
      "You keep the peace and see that justice is done. You know the law, you know people, and you know when someone's hiding something. Stonetop needs someone like you—whether it wants one or not.",
  },
  {
    value: "lightbearer",
    label: "The Lightbearer",
    description:
      "You carry a piece of the divine fire—literally. The Light you bear wards off darkness and draws the lost to safety, but it also draws things that hate the light.",
  },
  {
    value: "marshal",
    label: "The Marshal",
    description:
      "You lead. You organize, inspire, and hold people together when things get bad. Stonetop's militia, its defense, its coordination in a crisis—that's on you.",
  },
  {
    value: "ranger",
    label: "The Ranger",
    description:
      "The wilderness beyond Stonetop is your domain. You know its paths, its dangers, its rhythms. You keep watch so others don't have to—and you go where others can't.",
  },
  {
    value: "seeker",
    label: "The Seeker",
    description:
      "You pursue knowledge of the Ancient and the arcane. The world is full of old mysteries, and you can't help but pull at the threads—no matter where they lead.",
  },
  {
    value: "would-be-hero",
    label: "The Would-be Hero",
    description:
      "You're not chosen, not particularly gifted, not from a special bloodline. You're just someone who couldn't look away when things went wrong. That might be enough.",
  },
];
