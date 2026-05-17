export type PlaybookType =
  | 'blessed'
  | 'fox'
  | 'heavy'
  | 'judge'
  | 'lightbearer'
  | 'marshal'
  | 'ranger'
  | 'seeker'
  | 'would-be-hero';

export interface CharacterData {
  background?: string;
  backgroundChoices?: string[];
  instinct?: string;
  instinctCustom?: string;
  appearance?: Record<string, string>;
  appearanceCustom?: string;
  placeOfOrigin?: string;
  statStr?: string;
  statDex?: string;
  statInt?: string;
  statWis?: string;
  statCon?: string;
  statCha?: string;
  debilityWeakened?: boolean;
  debilityDazed?: boolean;
  debilityMiserable?: boolean;
  statHp?: string;
  statArmor?: string;
  statXp?: string;
  statLevel?: string;
  typeMoves?: Record<string, boolean>;
  typeMoveUses?: Record<string, number>;
  typeMoveTakes?: Record<string, number>;
}

export interface Character {
  id: string;
  name: string;
  playbook: PlaybookType;
  level: number;
  data?: CharacterData;
}

export interface ContentLists {
  excluded: string;
  veiled: string;
  specialHandling: string;
}

export interface GameSession {
  id: string;
  name: string;
  createdAt: number;
  characters: Character[];
  content?: ContentLists;
  threats?: string;
  iWonder?: string;
}
