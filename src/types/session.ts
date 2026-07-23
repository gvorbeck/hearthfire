import type { Character } from './character';
import type { RollStat } from './content';

export interface ContentLists {
  excluded: string;
  veiled: string;
  specialHandling: string;
}

export interface SteadingDebilities {
  diminished?: boolean;
  lacking?: boolean;
  malcontent?: boolean;
}

export interface NpcRelationship {
  id: string;
  type: string;
  targetId: string;
  targetKind: 'pc' | 'resident' | 'neighbor';
}

export interface SteadingNPC {
  id: string;
  name: string;
  pronouns?: string;
  occupation?: string;
  traits?: string[];
  relationships?: NpcRelationship[];
  notes?: string;
  dead?: boolean;
}

export type SteadingSize = 'hamlet' | 'village' | 'town' | 'city';

export interface GmImprovement {
  id: string;
  title: string;
  summary: string;
  requirements: string;
  effects: string;
  completed: boolean;
  category?: 'resource' | 'fortification' | 'asset' | null;
}

export interface SteadingData {
  size?: SteadingSize;
  fortunes?: number;
  population?: number;
  prosperity?: number;
  defenses?: number;
  surplus?: number;
  debilities?: SteadingDebilities;
  resources?: string[];
  fortifications?: string[];
  improvements?: Record<string, boolean>;
  gmImprovements?: GmImprovement[];
  assetsList?: string[];
  silverPurses?: number;
  silverHandfuls?: number;
  silverCoins?: number;
  goldPurses?: number;
  goldHandfuls?: number;
  goldCoins?: number;
  residents?: SteadingNPC[];
  neighbors?: SteadingNPC[];
  neighborNotes?: Record<string, string>;
  placesOfInterest?: string[];
  // Explicit deletion sentinels for updateSteading's id-keyed array merge: an id named
  // here is removed from the merged array even though the merge is additive. Omitting
  // an entry is NOT deletion — the freshly-read doc's entry for that id survives the
  // merge and reappears (mirrors CharacterData's deleteFeatureKeys/removedArcana*Ids).
  removedResidentIds?: string[];
  removedNeighborIds?: string[];
  removedGmImprovementIds?: string[];
  // Labels of fixed/improvement-derived resources, fortifications, and assets the GM has
  // removed (e.g. a requisitioned horse died, a trade fell through). Unlike the sentinels
  // above, this is a normal persisted field read back on every load — fixed items are
  // hard-coded constants, not Firestore records, so there's no id to merge against; the
  // label itself is the key, and this array is overwritten (not id-merged) on save.
  removedFixedItems?: string[];
}

// A dice roll made from a move card, appended to the shared game doc so the GM sees the party's rolls
// live. Ephemeral by nature: the log is capped and old rolls fall off (see useGame.logRoll).
export interface LoggedRoll {
  id: string; // `${characterId}-${createdAt}`
  characterId: string;
  characterName: string;
  moveName: string;
  stat: RollStat;
  dice: number[];
  mod: number;
  total: number;
  mode: 'normal' | 'adv' | 'dis';
  band: string | null; // the outcome band label the total landed in, e.g. '7-9'
  createdAt: number;
}

export interface GameSession {
  id: string;
  name: string;
  createdAt: number;
  characters: Character[];
  content?: ContentLists;
  threats?: string;
  iWonder?: string;
  steading?: SteadingData;
  // Shared roll log, newest-last, capped to the most recent rolls. Id-merged like the steading arrays;
  // `removedDiceRollIds` is the explicit-removal sentinel (a trimmed-off id must not resurrect on merge).
  diceRolls?: LoggedRoll[];
  removedDiceRollIds?: string[];
}
