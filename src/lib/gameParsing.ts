import { PLAYBOOKS, STAT_ABBRS } from '@/lib/constants';
import { filterByType, filterNestedRecordByType, filterRecordByType, isBoolean, isNumber, isPlainObject, isRecord, isString } from '@/lib/typeGuards';
import type { ArcanaMajorEntry, ArcanaMinorEntry, Character, CharacterData, ContentLists, GameSession, GmImprovement, LoggedRoll, NpcRelationship, PlaybookFeatures, RollStat, SteadingData, SteadingNPC } from '@/types';

// Derived from the canonical PLAYBOOKS list, not hand-copied: a character whose
// playbook isn't recognized gets filtered out of the array we write back (see
// withCharacters), so a set that drifted behind a newly-added playbook would
// silently delete every character of that playbook. Sourcing it here keeps them
// in lockstep.
const VALID_PLAYBOOKS = new Set<string>(PLAYBOOKS.map((p) => p.value));

const num = (v: unknown): number | undefined => isNumber(v) ? v : undefined;

// `level` is deliberately not checked here: a character with a non-numeric level is repaired (see
// parseCharacters), not dropped. `withCharacters` writes the parsed array back, so anything filtered out
// here is permanently deleted on the next edit — we only filter on fields with no safe default (id, name,
// an unrenderable playbook).
const isCharacter = (v: unknown): v is Omit<Character, 'level'> & { level?: unknown } =>
  isRecord(v) &&
  isString(v.id) &&
  isString(v.name) &&
  VALID_PLAYBOOKS.has(v.playbook as string);

// Only the id is required; every other field on an arcana entry is optional and read
// defensively by its own components, so we don't gate on them here — this just guarantees
// the entry itself is a record an id-merge (mergeById) can key on.
const isArcanaEntry = (v: unknown): v is (ArcanaMinorEntry | ArcanaMajorEntry) & Record<string, unknown> =>
  isRecord(v) && isString(v.id);

// `playbookFeatures` is a flat bag of per-playbook Record<string, boolean|string|number> fields
// (see the type's own comment on why it isn't namespaced). We don't validate each playbook's keys
// individually — components that read a specific feature already guard the value they pull out —
// but a field must at least be an object, since several playbooks' components call Object.entries()
// on their feature record directly and a stray string/number there throws.
const parsePlaybookFeatures = (v: unknown): CharacterData['playbookFeatures'] | undefined => {
  if (!isPlainObject(v)) return undefined;
  return Object.fromEntries(Object.entries(v).filter(([, fv]) => isPlainObject(fv) || Array.isArray(fv) || isString(fv) || isNumber(fv) || isBoolean(fv)));
};

// CharacterData is the bulk of a character's persisted state (~50 fields) and the most-mutated
// surface in the app; unlike Character/SteadingData above, it previously passed through
// completely unvalidated. Several components (SpecialPossessions, MajorArcanaPanel, MarshalCrew)
// call Object.entries() on these fields directly, so a malformed value crashes the sheet — and
// since updateCharacterData deep-merges from whatever it last read, a bad value gets re-persisted
// forever once it lands. As with the parsers above, an unrecognized field is dropped (falls back
// to undefined) rather than failing the whole character.
export const parseCharacterData = (v: unknown): CharacterData | undefined => {
  if (!isPlainObject(v)) return undefined;
  const r = v;
  return {
    inventoryChecked: filterRecordByType(r.inventoryChecked, isBoolean),
    inventoryUses: filterRecordByType(r.inventoryUses, isNumber),
    inventorySmallChecked: filterRecordByType(r.inventorySmallChecked, isBoolean),
    inventorySmallCustom: filterByType(r.inventorySmallCustom, (x): x is { checked: boolean; text: string } =>
      isRecord(x) && isBoolean(x.checked) && isString(x.text)),
    inventoryUndefined: num(r.inventoryUndefined),
    inventorySmallUndefined: num(r.inventorySmallUndefined),
    inventoryOtherThings: isString(r.inventoryOtherThings) ? r.inventoryOtherThings : undefined,
    inventoryPossessions: filterByType(r.inventoryPossessions, (x): x is { checked: boolean; text: string; weight: 1 | 2 } =>
      isRecord(x) && isBoolean(x.checked) && isString(x.text) && (x.weight === 1 || x.weight === 2)),
    background: isString(r.background) ? r.background : undefined,
    backgroundChoices: filterByType(r.backgroundChoices, isString),
    backgroundFreeText: filterRecordByType(r.backgroundFreeText, isString),
    backgroundUses: filterRecordByType(r.backgroundUses, isNumber),
    instinct: isString(r.instinct) ? r.instinct : undefined,
    instinctCustom: isString(r.instinctCustom) ? r.instinctCustom : undefined,
    appearance: filterRecordByType(r.appearance, isString),
    appearanceCustom: isString(r.appearanceCustom) ? r.appearanceCustom : undefined,
    placeOfOrigin: isString(r.placeOfOrigin) ? r.placeOfOrigin : undefined,
    statStr: isString(r.statStr) ? r.statStr : undefined,
    statDex: isString(r.statDex) ? r.statDex : undefined,
    statInt: isString(r.statInt) ? r.statInt : undefined,
    statWis: isString(r.statWis) ? r.statWis : undefined,
    statCon: isString(r.statCon) ? r.statCon : undefined,
    statCha: isString(r.statCha) ? r.statCha : undefined,
    debilityWeakened: isBoolean(r.debilityWeakened) ? r.debilityWeakened : undefined,
    debilityDazed: isBoolean(r.debilityDazed) ? r.debilityDazed : undefined,
    debilityMiserable: isBoolean(r.debilityMiserable) ? r.debilityMiserable : undefined,
    debilityWeakenedLocked: isBoolean(r.debilityWeakenedLocked) ? r.debilityWeakenedLocked : undefined,
    debilityDazedLocked: isBoolean(r.debilityDazedLocked) ? r.debilityDazedLocked : undefined,
    debilityMiserableLocked: isBoolean(r.debilityMiserableLocked) ? r.debilityMiserableLocked : undefined,
    statHp: isString(r.statHp) ? r.statHp : undefined,
    statArmor: isString(r.statArmor) ? r.statArmor : undefined,
    statXp: isString(r.statXp) ? r.statXp : undefined,
    statLevel: isString(r.statLevel) ? r.statLevel : undefined,
    typeMoves: filterRecordByType(r.typeMoves, isBoolean),
    typeMoveUses: filterRecordByType(r.typeMoveUses, isNumber),
    typeMoveUses2: filterRecordByType(r.typeMoveUses2, isNumber),
    typeMoveTakes: filterRecordByType(r.typeMoveTakes, isNumber),
    typeMoveCheckList: filterNestedRecordByType(r.typeMoveCheckList, isBoolean),
    typeMoveCheckListLevels: filterNestedRecordByType(r.typeMoveCheckListLevels, isNumber),
    typeMoveTakeNotes: filterRecordByType(r.typeMoveTakeNotes, isString),
    specialPossessions: filterRecordByType(r.specialPossessions, isBoolean),
    specialPossessionUses: filterRecordByType(r.specialPossessionUses, isNumber),
    specialPossessionCustom: isString(r.specialPossessionCustom) ? r.specialPossessionCustom : undefined,
    sacredPouchStock: num(r.sacredPouchStock),
    herbGardenStock: num(r.herbGardenStock),
    introductionQuestions: filterRecordByType(r.introductionQuestions, isBoolean),
    introductionAnswers: filterRecordByType(r.introductionAnswers, isString),
    inserts: filterByType(r.inserts, isString),
    playbookFeatures: parsePlaybookFeatures(r.playbookFeatures),
    arcanaMinor: filterByType(r.arcanaMinor, isArcanaEntry) as ArcanaMinorEntry[] | undefined,
    arcanaMajor: filterByType(r.arcanaMajor, isArcanaEntry) as ArcanaMajorEntry[] | undefined,
    deleteFeatureKeys: filterByType(r.deleteFeatureKeys, isString) as (keyof PlaybookFeatures)[] | undefined,
    removedArcanaMinorIds: filterByType(r.removedArcanaMinorIds, isString),
    removedArcanaMajorIds: filterByType(r.removedArcanaMajorIds, isString),
  };
};

export const parseCharacters = (raw: { characters?: unknown }): Character[] =>
  (filterByType(raw?.characters, isCharacter) ?? []).map((c) => ({
    ...c,
    level: isNumber(c.level) ? c.level : 1,
    data: parseCharacterData(c.data),
  }));

export const parseContent = (raw: unknown): ContentLists | undefined => {
  if (!isRecord(raw)) return undefined;
  return {
    excluded: isString(raw.excluded) ? raw.excluded : '',
    veiled: isString(raw.veiled) ? raw.veiled : '',
    specialHandling: isString(raw.specialHandling) ? raw.specialHandling : '',
  };
};

const strArr = (v: unknown): string[] | undefined =>
  Array.isArray(v) ? v.filter(isString) : isString(v) && v ? v.split('\n').filter(Boolean) : undefined;

const VALID_SIZES = new Set(['hamlet', 'village', 'town', 'city']);

const parseDebilities = (v: unknown): SteadingData['debilities'] => {
  if (!isRecord(v)) return undefined;
  return {
    diminished: isBoolean(v.diminished) ? v.diminished : undefined,
    lacking: isBoolean(v.lacking) ? v.lacking : undefined,
    malcontent: isBoolean(v.malcontent) ? v.malcontent : undefined,
  };
};

const isNpcRelationship = (v: unknown): v is NpcRelationship =>
  isRecord(v) &&
  isString(v.id) &&
  isString(v.type) &&
  isString(v.targetId) &&
  (v.targetKind === 'pc' || v.targetKind === 'resident' || v.targetKind === 'neighbor');

const parseNpc = (v: unknown): SteadingNPC | null => {
  if (!isRecord(v)) return null;
  if (!isString(v.id) || !isString(v.name)) return null;
  return {
    id: v.id,
    name: v.name,
    pronouns: isString(v.pronouns) ? v.pronouns : undefined,
    occupation: isString(v.occupation) ? v.occupation : undefined,
    traits: filterByType(v.traits, isString),
    relationships: filterByType(v.relationships, isNpcRelationship),
    notes: isString(v.notes) ? v.notes : undefined,
    dead: v.dead === true ? true : undefined,
  };
};

const parseNpcs = (v: unknown): SteadingNPC[] | undefined => {
  if (!Array.isArray(v)) return undefined;
  return (v as unknown[]).map(parseNpc).filter((n): n is SteadingNPC => n !== null);
};

const parseGmImprovement = (v: unknown, i: number): GmImprovement | null => {
  if (!isRecord(v)) return null;
  const r = v;
  if (!isString(r.title) || !isString(r.summary) ||
      !isString(r.requirements) || !isString(r.effects) ||
      !isBoolean(r.completed)) return null;
  const cat = r.category;
  return {
    id: isString(r.id) ? r.id : `gm-imp-legacy-${i}`,
    title: r.title,
    summary: r.summary,
    requirements: r.requirements,
    effects: r.effects,
    completed: r.completed,
    category: cat === 'resource' || cat === 'fortification' || cat === 'asset' ? cat : null,
  };
};

export const parseSteading = (raw: unknown): SteadingData | undefined => {
  if (!isRecord(raw)) return undefined;
  const r = raw;
  return {
    size: VALID_SIZES.has(r.size as string) ? r.size as SteadingData['size'] : undefined,
    fortunes: num(r.fortunes),
    population: num(r.population),
    prosperity: num(r.prosperity),
    defenses: num(r.defenses),
    surplus: num(r.surplus),
    debilities: parseDebilities(r.debilities),
    resources: strArr(r.resources),
    fortifications: strArr(r.fortifications),
    improvements: isRecord(r.improvements)
      ? Object.fromEntries(Object.entries(r.improvements).filter(([, iv]) => isBoolean(iv))) as Record<string, boolean>
      : undefined,
    gmImprovements: Array.isArray(r.gmImprovements)
      ? (r.gmImprovements as unknown[]).map(parseGmImprovement).filter((g): g is GmImprovement => g !== null)
      : undefined,
    assetsList: filterByType(r.assetsList, isString),
    silverPurses: num(r.silverPurses),
    silverHandfuls: num(r.silverHandfuls),
    silverCoins: num(r.silverCoins),
    goldPurses: num(r.goldPurses),
    goldHandfuls: num(r.goldHandfuls),
    goldCoins: num(r.goldCoins),
    residents: parseNpcs(r.residents),
    neighbors: parseNpcs(r.neighbors),
    neighborNotes: isRecord(r.neighborNotes)
      ? Object.fromEntries(Object.entries(r.neighborNotes).filter(([, iv]) => isString(iv))) as Record<string, string>
      : undefined,
    placesOfInterest: filterByType(r.placesOfInterest, isString),
    removedFixedItems: filterByType(r.removedFixedItems, isString),
  };
};

// How many rolls the shared log keeps; older rolls fall off on the next write. Keeps the game doc well
// under Firestore's 1 MiB ceiling and the GM's view scannable.
export const ROLL_LOG_CAP = 50;

const ROLL_STATS = new Set<string>([...STAT_ABBRS, 'nothing']);
const ROLL_MODES = new Set<string>(['normal', 'adv', 'dis']);

// Validate a persisted roll, dropping any malformed entry rather than failing the whole game parse
// (mirrors how parseCharacters / parseSteading tolerate bad data).
export const parseDiceRolls = (raw: unknown): LoggedRoll[] | undefined => {
  if (!Array.isArray(raw)) return undefined;
  const rolls: LoggedRoll[] = [];
  for (const r of raw) {
    if (!isRecord(r)) continue;
    if (!isString(r.id) || !isString(r.characterId) || !isNumber(r.createdAt)) continue;
    if (!isString(r.stat) || !ROLL_STATS.has(r.stat)) continue;
    if (!isString(r.mode) || !ROLL_MODES.has(r.mode)) continue;
    if (!Array.isArray(r.dice) || !r.dice.every(isNumber)) continue;
    if (!isNumber(r.mod) || !isNumber(r.total)) continue;
    rolls.push({
      id: r.id,
      characterId: r.characterId,
      characterName: isString(r.characterName) ? r.characterName : '',
      moveName: isString(r.moveName) ? r.moveName : '',
      stat: r.stat as RollStat,
      ...(isString(r.resource) ? { resource: r.resource } : {}),
      dice: r.dice as number[],
      ...(isNumber(r.dropped) ? { dropped: r.dropped } : {}),
      mod: r.mod,
      total: r.total,
      mode: r.mode as LoggedRoll['mode'],
      band: isString(r.band) ? r.band : null,
      createdAt: r.createdAt,
    });
  }
  return rolls;
};

export const parseGameSession = (raw: Record<string, unknown>, id: string): GameSession => {
  return {
    id,
    // Defaults to '' like every other field so a legacy/corrupt doc missing
    // name stays readable rather than failing the whole parse.
    name: isString(raw.name) ? raw.name : '',
    createdAt: isNumber(raw.createdAt) ? raw.createdAt : 0,
    characters: parseCharacters(raw),
    content: parseContent(raw.content),
    threats: isString(raw.threats) ? raw.threats : undefined,
    iWonder: isString(raw.iWonder) ? raw.iWonder : undefined,
    steading: parseSteading(raw.steading),
    diceRolls: parseDiceRolls(raw.diceRolls),
  };
};
