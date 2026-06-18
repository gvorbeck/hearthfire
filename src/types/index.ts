import type { ReactNode } from 'react';
import type { IconName } from '@/components/ui/Icon/Icon';

// ---- New Move model (typed-block body + generalized controls) ----
// A move body is an ordered array of typed blocks. Order is explicit; blocks never reorder, so the
// renderer keys them by position. Interactive blocks attach persistence per item id (not block id).
export type MoveBlock =
  // Paragraph of inline-markdown text, optionally preceded by a leading icon (e.g. seasons).
  | { kind: 'para'; text: string; icon?: IconName; indent?: boolean }
  // Always-bullet list of inline-markdown strings.
  | { kind: 'list'; items: string[]; indent?: boolean }
  | { kind: 'divider' }
  // Persistent boolean checklist (e.g. Heroes to the Last). State stored in typeMoveCheckList.
  | { kind: 'checkbox'; items: { id: string; label: string }[] }
  // Per-level tracked checklist (e.g. Potential for Greatness): each mark records the level it was
  // made at and the label's '___' token is substituted with that level. State in typeMoveCheckListLevels.
  | { kind: 'tracked'; items: { id: string; label: string }[] };

// One slot in the right-control row. Generalizes the former uses/usesAlt pair.
export interface RightControlSpec {
  type: 'checkbox' | 'dot';
  number?: number; // dot count; default 1, min 1 (checkbox always renders one box)
  label?: string; // rendered to the right of the control
  divider?: boolean; // '|' after this control; only honored when rightControl has more than one slot
}

export interface MoveDefinition {
  id: string;
  name: string; // fallback title + sort/search
  body?: MoveBlock[];
  citation?: string;
  // Number of left-hand boxes including the select box (box 0 selects/gates; boxes 1..n track times
  // taken). Omit entirely for display-only moves. Replaces the former selectable + takes pair.
  leftControl?: number;
  rightControl?: RightControlSpec[];
  // Constraint engine — consumed by getLockReason in the parent, unchanged.
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
  step3: string;
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

// An NPC creature/follower stat block, modeled on the Stonetop creature card (name, tags, HP/Armor
// boxes, presented qualities, loyalty, a single instinct, bulleted moves, and a trailing rule).
// Rendered by the presentational ui/CreatureCard; the host owns persistence. Everything but HP, armor,
// and loyalty is presented book data, not user input.
export interface Creature {
  id: string;
  name?: string;
  tags?: string;
  hp?: string;
  hpMax?: string;
  armor?: string;
  armorNote?: string;
  qualities?: string[];
  loyalty?: number;
  instinct?: string;
  moves?: string[];
  notes?: string;
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
  // How many requirements must be checked to unlock the move. Defaults to all.
  requirementsUnlockAt?: number;
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
  moves: (MajorArcanaMysteryMove | MoveDefinition)[];
  consequences: MajorArcanaMysteryConsequence[];
  // When `sourceId` is selected, `targetId`'s dot control gains +1 (e.g. A Mighty Will grants
  // Mindwalking +1 Power). Read generically by MajorArcanaCard so no arcanum is special-cased.
  dotBonuses?: { targetId: string; sourceId: string }[];
  // Some arcana (e.g. the Mindgem) grant an editable creature instead of mystery moves. This is the
  // book seed rendered through CreatureCard; the player's working copy lives on the entry.
  mysteryCreature?: Creature;
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

/** The Blessed's sacred pouch and earth mother shrine (BlessedSacredPouch.tsx, BlessedEarthMother.tsx) */
export interface BlessedFeatures {
  sacredPouchIs?: Record<string, string>;
  sacredPouchTrait?: string;
  earthMotherShrine?: string;
  earthMotherOfferings?: Record<string, boolean>;
}

/** The Fox's tall tales (fox playbook) */
export interface FoxFeatures {
  foxTallTales?: Record<string, boolean>;
}

/** The Heavy's violence (heavy playbook) */
export interface HeavyFeatures {
  heavyViolence?: Record<string, boolean>;
}

/** The Judge's chronicle and lawkeeper (judge playbook) */
export interface JudgeFeatures {
  judgeChronicle?: Record<string, boolean>;
  judgeLawkeeper?: Record<string, boolean>;
}

/** The Lightbearer's praise and invocations (lightbearer playbook, useInvocationBadge.ts) */
export interface LightbearerFeatures {
  lightbearerPraiseTheDay?: Record<string, boolean>;
  lightbearerInvocations?: Record<string, boolean>;
  lightbearerInvocationsBadgeDismissedAt?: number;
}

/** The Marshal's war stories (marshal playbook) */
export interface MarshalFeatures {
  marshalWarStories?: Record<string, boolean>;
  marshalWarStoriesAnswers?: Record<string, string>;
}

/** The Marshal's crew (MarshalCrew.tsx, useCrewSave.ts) */
export interface CrewFeatures {
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
}

/** The Ranger's something wicked (ranger playbook) */
export interface RangerFeatures {
  rangerSomethingWicked?: Record<string, boolean>;
  rangerSomethingWickedAnswers?: Record<string, string>;
}

/** The Ranger's animal companion (RangerAnimalCompanion.tsx) */
export interface AnimalCompanionFeatures {
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
}

/** The Seeker's collection (seeker playbook) */
export interface SeekerFeatures {
  seekerCollection?: Record<string, boolean>;
  seekerCollectionAnswers?: Record<string, string>;
}

/** The Would-Be Hero's fear and anger (would-be-hero playbook) */
export interface WouldBeHeroFeatures {
  wouldBeHeroFearAnger?: Record<string, boolean>;
  wouldBeHeroFearAngerAnswers?: Record<string, string>;
}

/** The Blessed's initiates of Danu (BlessedInitiatesOfDanu.tsx) */
export interface InitiateFeatures {
  initiateHp?: Record<string, string>;
  initiateLoyalty?: Record<string, number>;
  initiatePicks?: Record<string, Record<string, string>>;
  initiateRites?: Record<string, string>;
}

/** The Revenant insert (revenant playbook, useConsequenceCheckboxes.tsx) */
export interface RevenantFeatures {
  revenantInstinct?: string;
  revenantPurpose?: string;
  revenantPurposeName?: Record<string, string>;
  revenantConsequences?: Record<string, boolean>;
}

/** The Ghost insert (GhostInsert.tsx, useConsequenceCheckboxes.tsx) */
export interface GhostFeatures {
  ghostInstinct?: string;
  ghostPurpose?: string;
  ghostPurposeName?: Record<string, string>;
  ghostConsequences?: Record<string, boolean>;
  ghostPoltergeistFury?: number;
}

/** The Thrall insert (ThrallInsert.tsx) */
export interface ThrallFeatures {
  thrallMaster?: string;
  thrallInstinct?: string;
  thrallImpulse?: string;
  thrallImpulseCustom?: string;
  thrallFavor?: number;
  thrallMarksGained?: Record<string, boolean>;
  thrallMarksCrossedOff?: Record<string, boolean>;
}

/** Follower list shared across playbooks (FollowersInsert.tsx) */
export interface FollowerFeatures {
  followers?: FollowerData[];
}

// Intentionally flat: Firestore shallow-merge (updateDoc with dot-notation) requires top-level keys.
// Per-playbook namespacing would require a data migration of all existing documents.
export interface PlaybookFeatures
  extends BlessedFeatures, FoxFeatures, HeavyFeatures, JudgeFeatures,
    LightbearerFeatures, MarshalFeatures, CrewFeatures, RangerFeatures,
    AnimalCompanionFeatures, SeekerFeatures, WouldBeHeroFeatures,
    InitiateFeatures, RevenantFeatures, GhostFeatures, ThrallFeatures,
    FollowerFeatures {}

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
  // Per-move checkbox-block state: moveId -> itemId -> checked.
  bodyChecks?: Record<string, Record<string, boolean>>;
  // Player's working copy of an arcanum's granted creature (e.g. the Mindgem's Mighty Servant),
  // seeded from mystery.mysteryCreature and editable via CreatureCard.
  mysteryCreature?: Creature;
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
  herbGardenStock?: number;
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
