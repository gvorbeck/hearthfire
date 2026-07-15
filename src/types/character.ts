import type { Creature, FollowerData, PlaybookType } from './content';

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
  // Latches true the first time marks reach the unlock threshold. Some arcana (e.g. the Rune-laden
  // Scales, Ineffable Words) instruct the player to erase all marks after each unlock and re-earn them
  // for the next reward; once unlocked, the Mysteries must stay revealed even at 0 marks. Without this
  // flag, `unlocked` (marksValue >= unlockAt) would re-hide the moves and consequence they just earned.
  everUnlocked?: boolean;
  mysteryMovesChecked: Record<string, boolean>;
  consequencesMarked: Record<string, boolean>;
  // Picked row id for a consequence's roll table: consequenceId -> rowId (e.g. the Mindgem's chosen
  // 1d4 purpose). Drives the row's effect on the creature.
  consequenceTableChoice?: Record<string, string>;
  trackerValues?: Record<string, number>;
  followerHp?: Record<string, number[]>;
  // Per-move (or per-follower) checkbox state: ownerId -> itemId -> checked. Reused by the Servant of
  // Daagon follower for its Traits/Moves option ticks.
  bodyChecks?: Record<string, Record<string, boolean>>;
  // Per-follower write-in state for aspect rows: followerId -> rowId -> value (the Servant's d4 dice).
  bodyInputs?: Record<string, Record<string, string>>;
  // Player's working copy of an arcanum's granted creature (e.g. the Mindgem's Mighty Servant),
  // seeded from the arcanum's back section creature and editable via CreatureCard.
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
  // Set by a consequence's permanentDebility action: the matching debility box is force-checked and
  // disabled in Stats while marked. Cleared (and the debility unmarked) when the consequence is unchecked.
  debilityWeakenedLocked?: boolean;
  debilityDazedLocked?: boolean;
  debilityMiserableLocked?: boolean;
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
  introductionAnswers?: Record<string, string>;
  inserts?: string[];
  playbookFeatures?: PlaybookFeatures;
  arcanaMinor?: ArcanaMinorEntry[];
  arcanaMajor?: ArcanaMajorEntry[];
  // Explicit deletion sentinel for updateCharacterData's playbookFeatures merge: keys
  // named here are deleted from the merged result even though the merge is additive.
  // Omitting a key from playbookFeatures is NOT deletion — the freshly-read doc's value
  // for that key survives the spread and reappears.
  deleteFeatureKeys?: (keyof PlaybookFeatures)[];
  // Explicit deletion sentinels for updateCharacterData's id-keyed arcana merge: an id
  // named here is removed from the merged array even though the merge is additive.
  // Omitting an entry from arcanaMinor/arcanaMajor is NOT deletion — the freshly-read
  // doc's entry for that id survives the merge and reappears.
  removedArcanaMinorIds?: string[];
  removedArcanaMajorIds?: string[];
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
