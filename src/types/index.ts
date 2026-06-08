import type { ReactNode } from 'react';

export interface MoveDefinition {
  id: string;
  name: string;
  trigger?: string;
  triggerOverride?: string;
  body?: string | string[];
  bodyIcons?: readonly string[];
  bodyDividers?: boolean;
  list?: string[];
  listIndent?: boolean;
  checkList?: string[];
  checkListIds?: string[];
  checkListLeveled?: boolean;
  footer?: string | string[];
  list2?: string[];
  citation?: string;
  uses?: number;
  usesLabel?: string;
  // usesAlt tracks a second independent hold on the same move (e.g. Up With People: the current
  // player's Rapport dots vs. the other player's dot). Both groups are stored on this character's
  // document as a convenience; the other player is expected to track their own copy independently.
  usesAlt?: number;
  usesAltLabel?: string;
  takes?: number;
  selectable?: boolean;
  startingMove?: boolean;
  requires?: string[];
  requiresLevel?: number;
  excludes?: string[];
}

export interface RadioOption {
  value: string;
  label: string;
  description?: string;
  subtitle?: string;
  detail?: ReactNode;
  detailAlways?: boolean;
}

export interface CheckboxGroupItem {
  id: string;
  label: ReactNode;
  disabled?: boolean;
}

export interface Crumb {
  label: string;
  to?: string;
}

export interface IntroductionQuestion {
  id: string;
  text: string;
}

export interface IntroductionsConfig {
  step3: ReactNode;
  step4Questions: IntroductionQuestion[];
  step6Questions: IntroductionQuestion[];
}

export interface AnimalTypeConfig {
  id: string;
  label: string;
  examples: string;
  hp: string;
  armor: string;
  damage: string;
  pickCount: number;
  picks: { id: string; label: string; defaultChecked?: boolean }[];
}

export interface ArcanaFollower {
  name: string;
  tags: string;
  hp: number;
  hpCount?: number;
  armor?: number;
  damage?: string;
  instinct: string;
  qualities?: string[];
  cost?: string;
}

export interface ArcanaMove {
  name: string;
  subtitle?: string;
  tracker?: { label: string; max: number };
  text: string;
  follower?: ArcanaFollower;
}

export interface MinorArcanum {
  id: string;
  name: string;
  tags?: string;
  weight?: 1 | 2;
  description: string;
  requirements: string[];
  move: ArcanaMove;
}

export interface MajorArcanaMysteryMove {
  id: string;
  name: string;
  subtitle?: string;
  tracker?: { label: string; max: number };
  text: string;
  follower?: ArcanaFollower;
}

export interface MajorArcanaMysteryConsequence {
  id: string;
  text: string;
  children?: { id: string; text: string }[];
}

export interface MajorArcanaMystery {
  sectionLabel?: string;
  moves: MajorArcanaMysteryMove[];
  consequences: MajorArcanaMysteryConsequence[];
}

export interface MajorArcanum {
  id: string;
  name: string;
  tags?: string;
  weight?: 1 | 2;
  description: string;
  frontMoves: ArcanaMove[];
  marks: { label?: string; max: number; unlockAt?: number; tasks?: string[] };
  mystery: MajorArcanaMystery;
}

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

// Intentionally flat: Firestore shallow-merge (updateDoc with dot-notation) requires top-level keys.
// Per-playbook namespacing would require a data migration of all existing documents.
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
  animalTypeCustom?: Record<string, string>;
  animalTypeCustomChecked?: Record<string, boolean>;
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
  revenantInstinct?: string;
  revenantPurpose?: string;
  revenantPurposeName?: Record<string, string>;
  revenantConsequences?: Record<string, boolean>;
  ghostInstinct?: string;
  ghostPurpose?: string;
  ghostPurposeName?: Record<string, string>;
  ghostConsequences?: Record<string, boolean>;
  ghostPoltergeistFury?: number;
  thrallMaster?: string;
  thrallInstinct?: string;
  thrallImpulse?: string;
  thrallImpulseCustom?: string;
  thrallFavor?: number;
  thrallMarksGained?: Record<string, boolean>;
  thrallMarksCrossedOff?: Record<string, boolean>;
  followers?: FollowerData[];
}

export interface FollowerGearItem {
  checked: boolean;
  text: string;
  weight: 1 | 2;
}

export interface FollowerData {
  id: string;
  name?: string;
  tags?: string;
  hp?: string;
  maxHp?: string;
  armor?: string;
  damage?: string;
  exceptional?: boolean;
  group?: boolean;
  instinct?: string;
  moves?: string[];
  cost?: string;
  loyalty?: number;
  gear?: FollowerGearItem[];
  notes?: string;
}

export interface ArcanaMinorEntry {
  id: string;
  requirementsChecked: Record<string, boolean>;
  trackerValue?: number;
  followerHp?: number[];
  carried?: boolean;
}

export interface ArcanaMajorEntry {
  id: string;
  marksValue: number;
  mysteryMovesChecked: Record<string, boolean>;
  consequencesMarked: Record<string, boolean>;
  trackerValues?: Record<string, number>;
  followerHp?: Record<string, number[]>;
  carried?: boolean;
}

export interface CharacterData {
  inventoryChecked?: Record<string, boolean>;
  inventoryUses?: Record<string, number>;
  inventorySmallChecked?: Record<string, boolean>;
  inventorySmallCustom?: { checked: boolean; text: string }[];
  inventoryUndefined?: number;
  inventorySmallUndefined?: number;
  inventoryOtherThings?: string;
  inventoryPossessions?: { checked: boolean; text: string; weight: 1 | 2 }[];
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
  arcanaMinor?: ArcanaMinorEntry[];
  arcanaMajor?: ArcanaMajorEntry[];
}

export interface PlaybookSectionProps {
  data: CharacterData | undefined;
  onSave: (data: Partial<CharacterData>) => Promise<void>;
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
