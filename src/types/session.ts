import type { Character } from './character';

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
}
