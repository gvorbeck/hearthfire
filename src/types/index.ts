export interface ChoiceConfig {
  min: number;
  max: number;
  levelGatedMax?: [number, number][];
  items: { label: string; value: string; locked?: boolean }[];
}

export interface BackgroundOption {
  value: string;
  title: string;
  content: string;
  postContent?: string;
  uses?: number;
  choices?: ChoiceConfig;
  freeText?: { key: string; label: string };
}

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

export interface PlaybookFeatures {
  sacredPouchIs?: Record<string, string>;
  sacredPouchTrait?: string;
  earthMotherShrine?: string;
  earthMotherOfferings?: Record<string, boolean>;
  foxTallTales?: Record<string, boolean>;
  heavyViolence?: Record<string, boolean>;
  judgeChronicle?: Record<string, boolean>;
  judgeLawkeeper?: Record<string, boolean>;
  lightbearerPraiseTheDay?: Record<string, boolean>;
  lightbearerInvocations?: Record<string, boolean>;
  lightbearerInvocationsBadgeDismissedAt?: number;
  marshalWarStories?: Record<string, boolean>;
  marshalWarStoriesAnswers?: Record<string, string>;
  crewHp?: string;
  crewArmor?: string;
  crewTags?: Record<string, boolean>;
  crewTagsCustom?: string[];
  crewInstinct?: string;
  crewInstinctCustom?: string;
  crewCost?: string;
  crewCostCustom?: string;
  crewLoyalty?: number;
  crewInventoryChecked?: Record<string, boolean>;
  crewCustomItems?: { checked: boolean; text: string }[];
  crewSuppliesUses?: number[];
  crewIndividuals?: { name: string; tag: string; traits: string }[];
  rangerSomethingWicked?: Record<string, boolean>;
  rangerSomethingWickedAnswers?: Record<string, string>;
  animalHp?: string;
  animalArmor?: string;
  animalDamage?: string;
  animalName?: string;
  animalDamageTags?: string;
  animalType?: string;
  animalTypePicks?: Record<string, boolean>;
  animalTypeCustom?: string;
  animalInstinct?: string;
  animalInstinctCustom?: string;
  animalCost?: string;
  animalCostCustom?: string;
  animalLoyalty?: number;
  animalBeastOfLegend?: Record<string, boolean>;
  seekerCollection?: Record<string, boolean>;
  seekerCollectionAnswers?: Record<string, string>;
  wouldBeHeroFearAnger?: Record<string, boolean>;
  wouldBeHeroFearAngerAnswers?: Record<string, string>;
  initiateHp?: Record<string, string>;
  initiateLoyalty?: Record<string, number>;
  initiatePicks?: Record<string, Record<string, string>>;
  initiateRites?: Record<string, string>;
}

export interface CharacterData {
  background?: string;
  backgroundChoices?: string[];
  backgroundFreeText?: Record<string, string>;
  backgroundUses?: Record<string, number>;
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
  typeMoveUses2?: Record<string, number>;
  typeMoveTakes?: Record<string, number>;
  typeMoveCheckList?: Record<string, Record<string, boolean>>;
  typeMoveCheckListLevels?: Record<string, Record<string, number>>;
  specialPossessions?: Record<string, boolean>;
  specialPossessionUses?: Record<string, number>;
  specialPossessionCustom?: string;
  sacredPouchStock?: number;
  introductionQuestions?: Record<string, boolean>;
  inserts?: string[];
  playbookFeatures?: PlaybookFeatures;
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
  prosperity?: number;
}
