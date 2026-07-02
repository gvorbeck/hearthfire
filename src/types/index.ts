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
  // Major Arcana back moves only: show a select checkbox even with no prerequisite, so a move the
  // player activates by choice (not one granted outright on unlock) gets a box. Moves with `requires`
  // are selectable regardless; this opts in the ones that are selectable without a prerequisite.
  selectable?: boolean;
  // Constraint engine — consumed by getLockReason in the parent, unchanged.
  startingMove?: boolean;
  requires?: string[];
  requiresLevel?: number;
  // Major Arcana only: a granted mystery move that stays locked until this many Consequences are
  // marked (e.g. A Flickering Flame unlocks at 3). Gated by MajorArcanaCard, not the character engine.
  requiresConsequences?: number;
  // Major Arcana only: a granted mystery move that stays locked until this many marks are filled on
  // the arcanum's marks track (e.g. the Codex's Darksome Vessel, which needs all 4). Gated by
  // MajorArcanaCard, not the character engine.
  requiresMarks?: number;
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
  // Most followers have an HP box; a few (e.g. the Ring of Daagon's knowledge-follower) have none.
  hp?: number;
  hpCount?: number;
  armor?: number;
  damage?: string;
  instinct: string;
  qualities?: string[];
  cost?: string;
  // A follower tracked by Loyalty rather than HP (e.g. the Demonhide Cloak) renders an interactive
  // dot tracker with this many dots; its value persists on the entry under trackerValues[entry id].
  loyalty?: number;
}

// A presented stat line on a creature card — a bold label (e.g. "Damage") and its value.
export interface CreatureQuality {
  label: string;
  value: string;
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
  qualities?: CreatureQuality[];
  loyalty?: number;
  // Some creatures don't track their own Loyalty (e.g. the Servants of Daagon share the Ring's pool);
  // hide the dot control for them rather than show a stat the player isn't meant to fill.
  hideLoyalty?: boolean;
  moves?: string[];
  notes?: string;
}

// A declarative mutation a consequence applies to its creature when marked. Book-data fields
// (tags, moves, qualities) are always a pure projection of the seed plus the effects of every
// currently-marked consequence, so toggling a box is fully reversible without an undo trail.
export type CreatureEffect =
  | { op: "addTag"; tag: string }
  | { op: "removeTag"; tag: string }
  | { op: "replaceTag"; from: string; to: string }
  | { op: "addMove"; move: string }
  | { op: "replaceQuality"; label: string; value: string };

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

// The three PC debilities, keyed by the stat pair they impair. Used by consequence actions that
// mark a debility and by the Stats section.
export type DebilityType = "weakened" | "dazed" | "miserable";

// A side effect a consequence checkbox fires when checked (and reverses when unchecked). This is the
// extensible heart of the back-section consequence system: every cross-section thing a consequence
// can do is one member of this union, dispatched centrally in lib/consequenceActions.ts. Add a new
// member plus one dispatch case to teach consequences a new trick.
export type ConsequenceAction =
  // Mark a PC debility and lock its Stats box for as long as the consequence is marked (e.g. the
  // Lidless Orb's withered eye → permanent miserable).
  | { type: "permanentDebility"; debility: DebilityType }
  // Overwrite the PC's Instinct while marked, restoring the prior text on unmark (e.g. the
  // Blood-quenched Sword's "Paranoia").
  | { type: "setInstinct"; text: string }
  // Adjust the PC's Armor stat by `amount` while marked (e.g. the Lidless Orb's scales → +1 armor),
  // undoing the same delta on unmark. Additive, so it composes with manual edits and other armor grants.
  | { type: "armor"; amount: number };

// A checkbox consequence on an arcanum's back. Marking it can fire `actions` (see ConsequenceAction)
// and reveal `children`. The prose lives in `value`; `id` is the persistence key for its checked state.
export interface ArcanaConsequence {
  id: string;
  value: string;
  // How many mark boxes this consequence has; defaults to 1. Replaces the legacy ◻-glyph prefix used by
  // mystery consequences (e.g. El'rash-Orra's three boxes). Each box persists under its own mark id.
  checkboxes?: number;
  actions?: ConsequenceAction[];
  children?: ArcanaConsequence[];
}

// A standalone follower in a back "Followers" section (e.g. the Demonhide Cloak). Unlike a follower
// attached to a move, it stands on its own; `id` keys its persisted tracker state (HP or Loyalty).
export interface ArcanaFollowerEntry {
  id: string;
  follower: ArcanaFollower;
  // A follower gained only when a specific back consequence is marked (e.g. the Demonhide Cloak becomes
  // a follower via cloak-c5). Until that box is marked the follower renders inactive (dimmed, tracker
  // disabled). Omitted for followers granted outright on unlock.
  requiresConsequence?: string;
}

// One labeled section of an arcanum's back. Its `content` is the section's typed entries — Move
// definitions in a "Moves" section, ArcanaConsequences in a "Consequences" section, follower entries
// in a "Followers" section. The three are distinguished by shape: `body` / `value` / `follower`.
export interface ArcanaSection {
  label: string;
  content: (MoveDefinition | ArcanaConsequence | ArcanaFollowerEntry)[];
}

// The back side of an arcanum: a labeled wrapper around its sections. Replacing `mystery`; both
// coexist during the migration, with the card preferring `back` when present.
export interface ArcanaBack {
  label: string;
  sections: ArcanaSection[];
}

export interface MajorArcanaMysteryMove {
  id: string;
  name: string;
  subtitle?: string;
  tracker?: { label: string; max: number };
  text: string;
  follower?: ArcanaFollower;
}

// A selectable row in a consequence's roll table (e.g. the Mindgem's 1d4 purpose table). Picking a
// row applies its `effect` to the creature; the chosen row id persists on the entry.
export interface ConsequenceTableRow {
  id: string;
  roll: string;
  cells: string[];
  effect: CreatureEffect;
}

export interface ConsequenceTable {
  columnHeaders: string[];
  rows: ConsequenceTableRow[];
}

export interface MajorArcanaMysteryConsequence {
  id: string;
  text: string;
  // Effects applied to the arcanum's creature while this consequence is marked.
  effects?: CreatureEffect[];
  // A "hold up to max" dot tracker shown after the prose (e.g. the Blood-quenched Sword's Sustenance),
  // interactive only while the consequence is marked. Its value persists under entry.trackerValues[id].
  tracker?: { label: string; max: number };
  // A roll table whose row, once picked, drives an effect (e.g. the Mindgem's 1d4 new-cost table).
  table?: ConsequenceTable;
  children?: {
    id: string;
    text: string;
    effects?: CreatureEffect[];
    // When marked, overwrites the character's main Instinct with this text (and restores the prior
    // value on unmark) — e.g. the Blood-quenched Sword's "Paranoia" instinct.
    setsInstinct?: string;
  }[];
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
  // Most front moves are terse ArcanaMoves (a name + a string of prose). A few (e.g. the Hec'tumel
  // Codex's "Cast a Codex Spell") are full moves with typed body blocks and persistent dot controls,
  // authored as a MoveDefinition and rendered through the shared Move component. Being phased out in
  // favor of folding the front-side prose into `description`; optional during that migration.
  frontMoves?: (ArcanaMove | MoveDefinition)[];
  marks: { label?: string; max: number; unlockAt?: number; tasks?: string[] };
  // Extra front-side dot pools independent of Marks (which drives the unlock). E.g. Noruba's Ice Sphere
  // holds Acumen (2 dots) alongside its 3 Marks. Each renders below the marks row and persists under
  // entry.trackerValues[id], reusing the same tracker path moves use.
  frontTrackers?: { id: string; label: string; max: number }[];
  // The card prefers `back` when present and falls back to `mystery` otherwise, so arcana can be
  // converted to the new section-based shape one at a time. `mystery` is being phased out — arcana
  // fully migrated to `back` (e.g. the Twisted Spear) omit it entirely.
  back?: ArcanaBack;
  mystery?: MajorArcanaMystery;
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
  // Picked row id for a consequence's roll table: consequenceId -> rowId (e.g. the Mindgem's chosen
  // 1d4 purpose). Drives the row's effect on the creature.
  consequenceTableChoice?: Record<string, string>;
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
