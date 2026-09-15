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
  id: string; // `${characterId}-${rollId}` — stable across an advantage/disadvantage change to the roll
  characterId: string;
  characterName: string;
  moveName: string;
  stat: RollStat;
  // The non-stat resource the roll was against (+Favor, +Prosperity, …), when there was one. Without it
  // the log can't say what the modifier stood for.
  resource?: string;
  dice: number[];
  // Index into `dice` of the die advantage/disadvantage discarded, so the log can leave it out of the
  // arithmetic. Absent on normal rolls and on entries logged before this was recorded.
  dropped?: number | null;
  mod: number;
  total: number;
  mode: 'normal' | 'adv' | 'dis';
  band: string | null; // the outcome band label the total landed in, e.g. '7-9'
  createdAt: number;
}

// Who is currently typing in a shared notes editor. `clientId` identifies a browser tab (there's no
// auth); `at` is the holder's clock at the last heartbeat, used only to spot an abandoned lock when
// another tab tries to claim it. Cleared to null on release.
export interface NotesLock {
  clientId: string;
  at: number;
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
  // Shared rich-text notes (HTML) at the bottom of each playbook page, keyed by 'gm', 'steading', or a
  // character id. `notesLocks` holds the matching typing lock for each key (see NotesLock).
  notes?: Record<string, string>;
  notesLocks?: Record<string, NotesLock>;
}
