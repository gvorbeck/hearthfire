import type { PlaybookType } from "@/types";

export const DEFAULT_GAME_NAME = "Stonetop Game";
export const GAMES_COLLECTION = "games";

export interface PlaybookOption {
  value: PlaybookType;
  label: string;
  description: string;
  hpMax: number;
  damage: string;
  choose?: number;
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
  },
  {
    value: "fox",
    label: "The Fox",
    description:
      "The elders tell a story about Fox, who knows lots of tricks, and Hedgehog, who knows one: how to curl up into a ball when there's danger. Fox can't eat Hedgehog when he's all curled up, so in the story Fox goes hungry. But you're not that Fox, and this is no story. You want that Hedgehog? Go get a knife.",
    hpMax: 16,
    damage: "d8",
  },
  {
    value: "heavy",
    label: "The Heavy",
    description:
      "These are good people. Hard-working, honest. They look out for each other. But sometimes, looking out for each other ain't enough. Sometimes, good people need someone to stick up for them. Someone who's not afraid to get a little bloody. To get heavy. Yeah, someone like you.",
    hpMax: 20,
    damage: "d10",
  },
  {
    value: "judge",
    label: "The Judge",
    description: "",
    hpMax: 20,
    damage: "d6",
  },
  {
    value: "lightbearer",
    label: "The Lightbearer",
    description: "",
    hpMax: 18,
    damage: "d4",
  },
  {
    value: "marshal",
    label: "The Marshal",
    description: "",
    hpMax: 20,
    damage: "d8",
  },
  {
    value: "ranger",
    label: "The Ranger",
    description: "",
    hpMax: 18,
    damage: "d8",
  },
  {
    value: "seeker",
    label: "The Seeker",
    description: "",
    hpMax: 16,
    damage: "d6",
  },
  {
    value: "would-be-hero",
    label: "The Would-be Hero",
    description: "",
    hpMax: 16,
    damage: "d6",
  },
];
