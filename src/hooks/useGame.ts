import { useCallback, useEffect, useMemo, useState } from 'react';
import { useLatest } from './useLatest';
import { doc, onSnapshot, runTransaction, updateDoc } from 'firebase/firestore';
import type { FirestoreError } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useSaveStatusOptional } from '@/components/app/SaveStatus/SaveStatusContext';
import { useToastOptional } from '@/components/app/Toast/ToastContext';
import { DOC_TOO_LARGE_MESSAGE, GAMES_COLLECTION, PLAYBOOKS, SAVE_ERROR_MESSAGE } from '@/lib/constants';
import { filterByType, isBoolean, isNumber, isPlainObject, isRecord, isString } from '@/lib/typeGuards';
import type { Character, CharacterData, ContentLists, GameSession, GmImprovement, NpcRelationship, SteadingData, SteadingNPC } from '@/types';

interface UseGameResult {
  game: GameSession | null;
  loading: boolean;
  error: string | null;
  updateGameName: (name: string) => Promise<void>;
  updateCharacterName: (characterId: string, name: string) => Promise<void>;
  updateCharacterData: (characterId: string, data: Partial<CharacterData>) => Promise<void>;
  adjustCharacterStats: (characterId: string, deltas: Partial<Record<'statArmor' | 'statHp', number>>) => Promise<void>;
  updateContent: (field: keyof ContentLists, value: string) => Promise<void>;
  updateField: (field: keyof Pick<GameSession, 'threats' | 'iWonder'>, value: string) => Promise<void>;
  updateSteading: (patch: Partial<SteadingData>) => Promise<void>;
  addCharacter: (character: Character) => Promise<void>;
  removeCharacter: (characterId: string) => Promise<void>;
  reorderCharacters: (characters: Character[]) => Promise<void>;
}

// Map raw Firestore error codes to messages a player can act on — the raw
// strings (e.g. "Missing or insufficient permissions") are infra noise. Any
// unmapped code falls through to a generic line, so raw text never reaches the UI.
const FIRESTORE_ERROR_MESSAGES: Partial<Record<FirestoreError['code'], string>> = {
  'permission-denied': "You don't have access to this game.",
  unavailable: "Can't reach the server — check your connection and try again.",
  'deadline-exceeded': "The server took too long to respond — try again.",
  unauthenticated: "Your session expired — reload the page and try again.",
  // A write that exceeds Firestore's 1 MiB per-doc ceiling surfaces as
  // `invalid-argument`. Without this it fell through to the generic "check your
  // connection" line, which is both wrong and offers no recovery path.
  'invalid-argument': DOC_TOO_LARGE_MESSAGE,
};

const friendlyFirestoreError = (err: FirestoreError): string =>
  FIRESTORE_ERROR_MESSAGES[err.code] ?? 'Something went wrong loading this game. Please try again.';

// A FirestoreError carries a string `code`; other throws (network, mock) don't.
const isFirestoreError = (err: unknown): err is FirestoreError =>
  isRecord(err) && isString(err.code);

// Derived from the canonical PLAYBOOKS list, not hand-copied: a character whose
// playbook isn't recognized gets filtered out of the array we write back (see
// withCharacters), so a set that drifted behind a newly-added playbook would
// silently delete every character of that playbook. Sourcing it here keeps them
// in lockstep.
const VALID_PLAYBOOKS = new Set<string>(PLAYBOOKS.map((p) => p.value));

// `level` is deliberately not checked here: a character with a non-numeric level is repaired (see
// parseCharacters), not dropped. `withCharacters` writes the parsed array back, so anything filtered out
// here is permanently deleted on the next edit — we only filter on fields with no safe default (id, name,
// an unrenderable playbook).
const isCharacter = (v: unknown): v is Omit<Character, 'level'> & { level?: unknown } =>
  isRecord(v) &&
  isString(v.id) &&
  isString(v.name) &&
  VALID_PLAYBOOKS.has(v.playbook as string);

export const parseCharacters = (raw: { characters?: unknown }): Character[] =>
  (filterByType(raw?.characters, isCharacter) ?? []).map((c) => ({
    ...c,
    level: isNumber(c.level) ? c.level : 1,
  }));

export const parseContent = (raw: unknown): ContentLists | undefined => {
  if (!isRecord(raw)) return undefined;
  return {
    excluded: isString(raw.excluded) ? raw.excluded : '',
    veiled: isString(raw.veiled) ? raw.veiled : '',
    specialHandling: isString(raw.specialHandling) ? raw.specialHandling : '',
  };
};

const num = (v: unknown): number | undefined => isNumber(v) ? v : undefined;
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
  };
};

const parseGameSession = (raw: Record<string, unknown>, id: string): GameSession => {
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
  };
};

// Merge an id-keyed array against the freshly-read doc's version so a save built from a
// (possibly stale) snapshot only touches the entries it actually changed. `incoming` wins
// for ids it knows about (including ones it added or edited); an id present only in
// `existing` was added concurrently by someone else and is kept, UNLESS it's named in
// `removedIds` — the explicit sentinel for intentional removal (mirrors deleteFeatureKeys),
// since omitting an id from `incoming` alone is ambiguous between "removed" and "never seen".
const mergeById = <T extends { id: string }>(
  existing: T[] | undefined,
  incoming: T[],
  removedIds?: string[],
): T[] => {
  const incomingIds = new Set(incoming.map((e) => e.id));
  const removed = new Set(removedIds ?? []);
  const onlyInExisting = (existing ?? []).filter((e) => !incomingIds.has(e.id) && !removed.has(e.id));
  return [...incoming, ...onlyInExisting];
};

// steading array fields that are id-merged (not overwritten) against the freshly-read doc,
// each paired with its SteadingData sentinel field for explicit-removal ids.
const STEADING_ID_ARRAY_FIELDS = {
  residents: 'removedResidentIds',
  neighbors: 'removedNeighborIds',
  gmImprovements: 'removedGmImprovementIds',
} as const;

const withCharacters = async (
  ref: ReturnType<typeof doc>,
  transform: (characters: Character[]) => Character[]
): Promise<void> => {
  await runTransaction(db, async (tx) => {
    const snap = await tx.get(ref);
    // Fail loud rather than silently no-op: a missing doc here means the game was
    // deleted mid-session, so returning would let reportSave flag "Saved." for a
    // write that never happened. Throwing routes it through the save-error path.
    if (!snap.exists()) throw new Error('Game not found — it may have been deleted.');
    tx.update(ref, { characters: transform(parseCharacters(snap.data())) });
  });
};

export const useGame = (gameId: string): UseGameResult => {
  const [game, setGame] = useState<GameSession | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const gameRef = useMemo(() => doc(db, GAMES_COLLECTION, gameId), [gameId]);

  // Report every persisted write to the app-wide save-status indicator and the
  // error Toast. Held in refs so wrapping a mutation doesn't add the (per-render)
  // context objects to its dependency array — the callbacks stay stable.
  const saveStatus = useSaveStatusOptional();
  const saveStatusRef = useLatest(saveStatus);
  const addToast = useToastOptional()?.addToast;
  const addToastRef = useLatest(addToast);

  // Wraps a write so the indicator shows "Saving…" while it runs and "Saved"
  // once it settles. On failure it surfaces SAVE_ERROR_MESSAGE — every save path
  // funnels through here, so direct callers (radios, checkboxes) fail loud just
  // like debounced fields — then re-throws so callers' own .catch and the
  // debounce hook's retry still run. The shared constant keeps this and the
  // debounce hook on one string, so the Toast dedupe collapses them to one.
  const reportSave = useCallback(async (write: () => Promise<void>): Promise<void> => {
    saveStatusRef.current?.reportSaveStart();
    let succeeded = false;
    try {
      await write();
      succeeded = true;
    } catch (error) {
      // A code we have a specific line for (e.g. the 1 MiB doc-size ceiling) gets
      // that actionable message; everything else falls back to SAVE_ERROR_MESSAGE
      // so it still dedupes against the debounce hook's toast on the shared string.
      const message =
        isFirestoreError(error) && FIRESTORE_ERROR_MESSAGES[error.code]
          ? FIRESTORE_ERROR_MESSAGES[error.code]!
          : SAVE_ERROR_MESSAGE;
      addToastRef.current?.(message, 'error');
      throw error;
    } finally {
      saveStatusRef.current?.reportSaveSettled(succeeded);
    }
  }, []);

  useEffect(() => {
    const ref = gameRef;
    // Reset to the loading state before (re)subscribing to a new game's snapshot
    // stream. This is a store-subscription effect keyed on gameRef, not a
    // derived-state cascade — the reset must happen so stale data from the prior
    // game doesn't show while the new snapshot is in flight.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLoading(true);
    setGame(null);

    const unsubscribe = onSnapshot(
      ref,
      (snapshot) => {
        if (!snapshot.exists()) {
          setGame(null);
          setError(null);
        } else {
          try {
            const raw = snapshot.data() as Record<string, unknown>;
            setGame(parseGameSession(raw, snapshot.id));
            setError(null);
          } catch {
            // A parse failure means the stored document is malformed — surface a
            // player-readable line rather than the raw thrown message.
            setError("This game's data couldn't be read. Please try again or contact your GM.");
          }
        }
        setLoading(false);
      },
      (err) => {
        setError(friendlyFirestoreError(err));
        setLoading(false);
      }
    );

    return unsubscribe;
  }, [gameRef]);

  const updateGameName = useCallback(async (name: string) => {
    await reportSave(() => updateDoc(gameRef, { name }));
  }, [gameRef, reportSave]);

  const updateContent = useCallback(async (field: keyof ContentLists, value: string) => {
    await reportSave(() => updateDoc(gameRef, { [`content.${field}`]: value }));
  }, [gameRef, reportSave]);

  const updateField = useCallback(async (field: keyof Pick<GameSession, 'threats' | 'iWonder'>, value: string) => {
    await reportSave(() => updateDoc(gameRef, { [field]: value }));
  }, [gameRef, reportSave]);

  const addCharacter = useCallback(async (character: Character) => {
    // Read-modify-write so a double-tap or post-blip retry can't append the
    // same id twice — arrayUnion treats each Character object as unique.
    await reportSave(() => withCharacters(gameRef, (chars) =>
      chars.some((c) => c.id === character.id) ? chars : [...chars, character]
    ));
  }, [gameRef, reportSave]);

  const removeCharacter = useCallback(async (characterId: string) => {
    await reportSave(() => withCharacters(gameRef, (chars) => chars.filter((c) => c.id !== characterId)));
  }, [gameRef, reportSave]);

  const reorderCharacters = useCallback(async (characters: Character[]) => {
    const ids = characters.map((c) => c.id);
    await reportSave(() => withCharacters(gameRef, (current) => {
      const lookup = new Map(current.map((c) => [c.id, c]));
      const reordered = ids.map((id) => lookup.get(id)).filter(Boolean) as Character[];
      // A character concurrently added by another player won't be in the dragging
      // client's stale `ids` list — append it rather than silently dropping it.
      const idSet = new Set(ids);
      const added = current.filter((c) => !idSet.has(c.id));
      return [...reordered, ...added];
    }));
  }, [gameRef, reportSave]);

  const updateCharacterName = useCallback(async (characterId: string, name: string) => {
    await reportSave(() => withCharacters(gameRef, (chars) => chars.map((c) => c.id === characterId ? { ...c, name } : c)));
  }, [gameRef, reportSave]);

  const updateCharacterData = useCallback(async (characterId: string, data: Partial<CharacterData>) => {
    await reportSave(() => withCharacters(gameRef, (chars) => chars.map((c) => {
      if (c.id !== characterId) return c;
      // Shallow-merge every plain-object field (typeMoves, specialPossessions,
      // appearance, etc.) against the freshly-read doc so a save built from a
      // (possibly stale) prop snapshot only touches the keys it actually changed —
      // a concurrent save to a sibling key on the same field can't be clobbered.
      // Arrays (e.g. arcanaMinor) are excluded here; they're id-merged below instead.
      const next = { ...c.data, ...data };
      for (const key of Object.keys(data) as (keyof CharacterData)[]) {
        const incoming = data[key];
        const existing = c.data?.[key];
        if (isPlainObject(incoming) && isPlainObject(existing)) {
          (next as Record<string, unknown>)[key] = { ...existing, ...incoming };
        }
      }
      // playbookFeatures additionally supports key deletion via the explicit
      // deleteFeatureKeys sentinel — omitting a key from the patch merges as
      // "unchanged" (see above), not "deleted".
      if (data.deleteFeatureKeys?.length && next.playbookFeatures) {
        next.playbookFeatures = { ...next.playbookFeatures };
        for (const key of data.deleteFeatureKeys) delete next.playbookFeatures[key];
      }
      delete next.deleteFeatureKeys;
      // Id-merge arcana entries instead of overwriting the whole array, so a
      // concurrent edit to a different entry (or a different field on the same
      // entry) survives rather than being reverted by a stale snapshot. Removal
      // uses the explicit removedArcana*Ids sentinel (see the type definition).
      if (data.arcanaMinor) {
        next.arcanaMinor = mergeById(c.data?.arcanaMinor, data.arcanaMinor, data.removedArcanaMinorIds);
      }
      if (data.arcanaMajor) {
        next.arcanaMajor = mergeById(c.data?.arcanaMajor, data.arcanaMajor, data.removedArcanaMajorIds);
      }
      delete next.removedArcanaMinorIds;
      delete next.removedArcanaMajorIds;
      return { ...c, data: next };
    })));
  }, [gameRef, reportSave]);

  // Add a signed delta to a character's Armor/HP inside the transaction, reading each stat off the
  // freshly-read doc rather than a caller-supplied snapshot. Arcana consequence actions use this so a
  // rapid check-then-uncheck (or a snapshot that hasn't echoed the last edit) can't compute the new
  // value from a stale number and strand the stat on the wrong total.
  const adjustCharacterStats = useCallback(async (characterId: string, deltas: Partial<Record<'statArmor' | 'statHp', number>>) => {
    await reportSave(() => withCharacters(gameRef, (chars) => chars.map((c) => {
      if (c.id !== characterId) return c;
      const next = { ...c.data };
      for (const [field, delta] of Object.entries(deltas) as ['statArmor' | 'statHp', number][]) {
        next[field] = String((Number(next[field]) || 0) + delta);
      }
      return { ...c, data: next };
    })));
  }, [gameRef, reportSave]);

  const updateSteading = useCallback(async (patch: Partial<SteadingData>) => {
    await reportSave(() => runTransaction(db, async (tx) => {
      const snap = await tx.get(gameRef);
      if (!snap.exists()) throw new Error('Game not found — it may have been deleted.');
      const existing = parseSteading(snap.data().steading) ?? {};

      const idArrayFields: Record<string, keyof SteadingData> = STEADING_ID_ARRAY_FIELDS;

      const dotted: Record<string, unknown> = {};
      for (const [k, v] of Object.entries(patch)) {
        if (k === 'improvements' && isRecord(v)) {
          // Only write entries whose value is actually boolean — the patch is
          // cast at the Firestore boundary, so guard against a non-boolean slipping
          // into the dotted write.
          for (const [ik, iv] of Object.entries(v)) {
            if (isBoolean(iv)) dotted[`steading.improvements.${ik}`] = iv;
          }
        } else if (k in idArrayFields && Array.isArray(v)) {
          // Id-merge instead of overwriting the whole array, so a concurrent edit to a
          // different entry (e.g. another NPC) survives rather than being reverted by a
          // stale snapshot. Removal uses the explicit removedXIds sentinel.
          const removedIds = patch[idArrayFields[k]] as string[] | undefined;
          const merged = mergeById(existing[k as keyof SteadingData] as { id: string }[] | undefined, v as { id: string }[], removedIds);
          // Strip undefined fields from array elements (e.g. parsed NPCs with optional fields)
          // before writing to Firestore, which rejects undefined values.
          dotted[`steading.${k}`] = JSON.parse(JSON.stringify(merged));
        } else if (!(k in idArrayFields) && !k.startsWith('removed')) {
          // Strip undefined fields from array elements (e.g. parsed NPCs with optional fields)
          // before writing to Firestore, which rejects undefined values.
          dotted[`steading.${k}`] = Array.isArray(v)
            ? JSON.parse(JSON.stringify(v))
            : v;
        }
      }
      tx.update(gameRef, dotted);
    }));
  }, [gameRef, reportSave]);

  return { game, loading, error, updateGameName, updateCharacterName, updateCharacterData, adjustCharacterStats, updateContent, updateField, updateSteading, addCharacter, removeCharacter, reorderCharacters };
};
