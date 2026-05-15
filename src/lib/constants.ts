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
    description: "",
  },
  {
    value: "heavy",
    label: "The Heavy",
    description: "",
  },
  {
    value: "judge",
    label: "The Judge",
    description: "",
  },
  {
    value: "lightbearer",
    label: "The Lightbearer",
    description: "",
  },
  {
    value: "marshal",
    label: "The Marshal",
    description: "",
  },
  {
    value: "ranger",
    label: "The Ranger",
    description: "",
  },
  {
    value: "seeker",
    label: "The Seeker",
    description: "",
  },
  {
    value: "would-be-hero",
    label: "The Would-be Hero",
    description: "",
  },
];
