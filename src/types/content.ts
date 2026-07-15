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
  // Constraint engine — consumed by getLockReason in lib/moveLockReason, unchanged.
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
  // Major Arcana only: a base move (e.g. Noruba's Ice Sphere's Mindwalking) that grants its
  // `requires`-children one at a time — one child unlocked "for every N Consequences you mark". The
  // per-arcanum ratio the book states; without it, requiring-children aren't budget-gated.
  grantsPerConsequences?: number;
  // Major Arcana only: a granted (non-selectable) base move that counts as active the moment the
  // arcanum unlocks, so children that `require` it aren't blocked waiting for a checkbox it never shows.
  autoActivateOnUnlock?: boolean;
  // Major Arcana only: while this move is selected, widen another move's dot control by `amount` (e.g.
  // A Mighty Will grants Mindwalking +1 Power dot). Read by MajorArcanaCard's gating.
  grantsDotBonus?: { targetId: string; amount: number };
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
  // A follower whose stats are rolled each time it's summoned (the Ring of Daagon's Servant of Daagon):
  // the player assigns a d4 to each aspect row and ticks the chosen Traits/Moves. Aspect write-in
  // values persist under entry.bodyInputs[followerId][rowId]; option checks under
  // entry.bodyChecks[followerId][optionId].
  aspects?: FollowerAspects;
}

// The roll-and-assign block a Servant-of-Daagon-style follower carries: intro/footer prose around a
// set of numeric write-in rows (each d4 clamped to [min, max]), some of which nest an option checklist.
export interface FollowerAspects {
  intro?: string;
  footer?: string;
  min: number;
  max: number;
  rows: {
    id: string;
    label: string;
    options?: { id: string; label: string }[];
  }[];
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
// The subset of ConsequenceAction that mutates the arcanum's creature (rather than the PC). Narrowed
// from the one action union so the roll-table effect and the projection pipeline take a creature-only
// type, while authors still use a single `actions` vocabulary. See ConsequenceAction below.
export type CreatureEffect = Extract<
  ConsequenceAction,
  { type: "addTag" | "removeTag" | "replaceTag" | "addMove" | "replaceQuality" }
>;

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

// Everything a consequence checkbox can do when checked (and reverse when unchecked), in one union.
// Two families, distinguished by subject:
//   • PC actions (permanentDebility, setInstinct, armor) mutate the player's own sheet and are applied
//     by the Firestore-writing dispatcher in lib/consequenceActions.ts.
//   • Creature actions (addTag … replaceQuality) reshape the arcanum's creature and are applied by the
//     pure projection in lib/creatureMutations.ts (nothing persisted — recomputed from marked state).
// Authors use one `actions` vocabulary; each member is routed to the right subsystem by its `type`.
// Add a new member plus its one dispatch case (PC) or projection case (creature) to teach a new trick.
export type ConsequenceAction =
  // --- PC-side: applied by lib/consequenceActions.ts ---
  // Mark a PC debility and lock its Stats box for as long as the consequence is marked (e.g. the
  // Lidless Orb's withered eye → permanent miserable).
  | { type: "permanentDebility"; debility: DebilityType }
  // Overwrite the PC's Instinct while marked, restoring the prior text on unmark (e.g. the
  // Blood-quenched Sword's "Paranoia").
  | { type: "setInstinct"; text: string }
  // Overwrite a back follower's Cost while marked (e.g. the Ring of Daagon's Cost becoming "Living,
  // helpless, intelligent sacrifices"). Read-only like setInstinct: derived from marked state at render,
  // never persisted. `followerId` is the ArcanaFollowerEntry id whose cost is replaced.
  | { type: "setFollowerCost"; followerId: string; text: string }
  // Adjust the PC's Armor stat by `amount` while marked (e.g. the Lidless Orb's scales → +1 armor),
  // undoing the same delta on unmark. Additive, so it composes with manual edits and other armor grants.
  | { type: "armor"; amount: number }
  // Adjust the PC's HP stat by `amount` while marked (e.g. the Hungering Maw's soul wound → -4 max HP),
  // undoing the same delta on unmark. Additive like `armor`, so it composes with manual edits.
  | { type: "maxHp"; amount: number }
  // Widen a back move's dot control by `amount` while marked (e.g. Storm Markings' "gain +1 Fury"
  // consequence widens Storm's Fury from 3 to 4 Fury). Like setInstinct, derived read-only from marked
  // state — nothing persisted; useArcanumGating's dotBonusFor reads it alongside a move's grantsDotBonus.
  | { type: "widenDots"; targetId: string; amount: number }
  // --- Creature-side: applied by lib/creatureMutations.ts (see CreatureEffect above) ---
  // Add/remove/replace a tag on the arcanum's creature (e.g. the Mindgem's Servant gaining *devious*).
  | { type: "addTag"; tag: string }
  | { type: "removeTag"; tag: string }
  | { type: "replaceTag"; from: string; to: string }
  // Append a move to the creature's move list.
  | { type: "addMove"; move: string }
  // Overwrite a named creature quality's value (e.g. the Servant's Damage or Cost).
  | { type: "replaceQuality"; label: string; value: string };

// A checkbox consequence on an arcanum's back. Marking it can fire `actions` (see ConsequenceAction)
// and reveal `children`. The prose lives in `value`; `id` is the persistence key for its checked state.
export interface ArcanaConsequence {
  id: string;
  value: string;
  // How many mark boxes this consequence has; defaults to 1. Replaces the legacy ◻-glyph prefix used by
  // mystery consequences (e.g. El'rash-Orra's three boxes). Each box persists under its own mark id.
  checkboxes?: number;
  // Everything the consequence does when marked — PC-side (debility/instinct/armor) and creature-side
  // (tag/quality/move mutations) alike. Creature actions are only meaningful in a section with a
  // `creature`. See ConsequenceAction.
  actions?: ConsequenceAction[];
  // A "hold up to max" dot tracker shown after the prose, interactive only while the consequence is
  // marked; its value persists under entry.trackerValues[id].
  tracker?: { label: string; max: number };
  // A roll table whose picked row drives a creature effect (e.g. the Mindgem's 1d4 new-cost table).
  // The chosen row id persists on entry.consequenceTableChoice[id].
  table?: ConsequenceTable;
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
  // Some arcana (e.g. the Mindgem) grant an editable creature whose stats are projected from the
  // marked consequences in this same section. The seed renders through MysteryCreatureCard; the
  // player's working copy lives on the entry. Set only on a creature-bearing section.
  creature?: Creature;
  // Trailing prose rendered after the section's content, with no checkbox of its own (e.g. the Redwood
  // Effigy's "when you would mark a consequence but they've all been marked…" overflow rule).
  note?: string;
}

// The back side of an arcanum: a labeled wrapper around its sections.
export interface ArcanaBack {
  label: string;
  sections: ArcanaSection[];
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

// A front-side dot tracker on a major arcanum. The one with `role: "marks"` is the unlock track (its
// value lives on entry.marksValue, gated by `unlockAt`); any others are resource pools persisting under
// entry.trackerValues[id]. `tasks` is the legacy fixed task list, only read on the marks tracker as a
// fallback when the description carries no inline "[ ]" task block.
export interface FrontTracker {
  id: string;
  label: string;
  max: number;
  role?: "marks";
  unlockAt?: number;
  tasks?: string[];
}

export interface MajorArcanum {
  id: string;
  name: string;
  tags?: string;
  weight?: 1 | 2;
  description: string;
  // Moves available the moment you hold the arcanum, before the Mysteries unlock (e.g. the Hec'tumel
  // Codex's "Cast a Codex Spell") — full moves with typed body blocks and persistent dot controls,
  // rendered through the shared Move component.
  baseMoves?: MoveDefinition[];
  // Every front-side dot tracker, in render order. Exactly one carries `role: "marks"` — the unlock
  // tracker, whose value drives the mysteries reveal and move prerequisites and persists under
  // entry.marksValue. The rest are free resource pools (e.g. Noruba's Ice Sphere's Acumen) persisting
  // under entry.trackerValues[id].
  frontTrackers: FrontTracker[];
  back?: ArcanaBack;
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
