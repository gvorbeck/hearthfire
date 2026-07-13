import { useCallback, useEffect, useMemo, useState } from 'react';
import { useLatest } from './useLatest';
import { doc, onSnapshot, runTransaction, updateDoc } from 'firebase/firestore';
import type { FirestoreError } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useSaveStatusOptional } from '@/components/app/SaveStatus/SaveStatusContext';
import { useToastOptional } from '@/components/app/Toast/ToastContext';
import { GAMES_COLLECTION, PLAYBOOKS, SAVE_ERROR_MESSAGE } from '@/lib/constants';
import { filterByType, isBoolean, isNumber, isRecord, isString } from '@/lib/typeGuards';
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
};

const friendlyFirestoreError = (err: FirestoreError): string =>
  FIRESTORE_ERROR_MESSAGES[err.code] ?? 'Something went wrong loading this game. Please try again.';

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

const withCharacters = async (
  ref: ReturnType<typeof doc>,
  transform: (characters: Character[]) => Character[]
): Promise<void> => {
  await runTransaction(db, async (tx) => {
    const snap = await tx.get(ref);
    if (!snap.exists()) return;
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
      addToastRef.current?.(SAVE_ERROR_MESSAGE, 'error');
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
    await withCharacters(gameRef, (chars) =>
      chars.some((c) => c.id === character.id) ? chars : [...chars, character]
    );
  }, [gameRef]);

  const removeCharacter = useCallback(async (characterId: string) => {
    await withCharacters(gameRef, (chars) => chars.filter((c) => c.id !== characterId));
  }, [gameRef]);

  const reorderCharacters = useCallback(async (characters: Character[]) => {
    const ids = characters.map((c) => c.id);
    await withCharacters(gameRef, (current) => {
      const lookup = new Map(current.map((c) => [c.id, c]));
      return ids.map((id) => lookup.get(id)).filter(Boolean) as Character[];
    });
  }, [gameRef]);

  const updateCharacterName = useCallback(async (characterId: string, name: string) => {
    await reportSave(() => withCharacters(gameRef, (chars) => chars.map((c) => c.id === characterId ? { ...c, name } : c)));
  }, [gameRef, reportSave]);

  const updateCharacterData = useCallback(async (characterId: string, data: Partial<CharacterData>) => {
    await reportSave(() => withCharacters(gameRef, (chars) => chars.map((c) => {
      if (c.id !== characterId) return c;
      // Deep-merge playbookFeatures against the freshly-read doc so concurrent
      // saves to different feature keys don't clobber each other — the incoming
      // patch is built from a (possibly stale) prop snapshot of the whole object.
      const next = { ...c.data, ...data };
      if (data.playbookFeatures) {
        next.playbookFeatures = { ...c.data?.playbookFeatures, ...data.playbookFeatures };
      }
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
    const dotted: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(patch)) {
      if (k === 'improvements' && isRecord(v)) {
        // Only write entries whose value is actually boolean — the patch is
        // cast at the Firestore boundary, so guard against a non-boolean slipping
        // into the dotted write.
        for (const [ik, iv] of Object.entries(v)) {
          if (isBoolean(iv)) dotted[`steading.improvements.${ik}`] = iv;
        }
      } else {
        // Strip undefined fields from array elements (e.g. parsed NPCs with optional fields)
        // before writing to Firestore, which rejects undefined values.
        dotted[`steading.${k}`] = Array.isArray(v)
          ? JSON.parse(JSON.stringify(v))
          : v;
      }
    }
    await reportSave(() => updateDoc(gameRef, dotted));
  }, [gameRef, reportSave]);

  return { game, loading, error, updateGameName, updateCharacterName, updateCharacterData, adjustCharacterStats, updateContent, updateField, updateSteading, addCharacter, removeCharacter, reorderCharacters };
};
