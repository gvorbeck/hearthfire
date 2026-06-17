import { useCallback, useEffect, useMemo, useState } from 'react';
import { doc, onSnapshot, runTransaction, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { GAMES_COLLECTION } from '@/lib/constants';
import { filterByType, isBoolean, isNumber, isRecord, isString } from '@/lib/typeGuards';
import type { Character, CharacterData, ContentLists, GameSession, GmImprovement, NpcRelationship, SteadingData, SteadingNPC } from '@/types';

interface UseGameResult {
  game: GameSession | null;
  loading: boolean;
  error: string | null;
  updateGameName: (name: string) => Promise<void>;
  updateCharacterName: (characterId: string, name: string) => Promise<void>;
  updateCharacterData: (characterId: string, data: Partial<CharacterData>) => Promise<void>;
  updateContent: (field: keyof ContentLists, value: string) => Promise<void>;
  updateField: (field: keyof Pick<GameSession, 'threats' | 'iWonder'>, value: string) => Promise<void>;
  updateSteading: (patch: Partial<SteadingData>) => Promise<void>;
  addCharacter: (character: Character) => Promise<void>;
  removeCharacter: (characterId: string) => Promise<void>;
  reorderCharacters: (characters: Character[]) => Promise<void>;
}

const VALID_PLAYBOOKS = new Set<string>([
  'blessed', 'fox', 'heavy', 'judge', 'lightbearer', 'marshal', 'ranger', 'seeker', 'would-be-hero',
]);

const isCharacter = (v: unknown): v is Character =>
  isRecord(v) &&
  isString(v.id) &&
  isString(v.name) &&
  VALID_PLAYBOOKS.has(v.playbook as string) &&
  isNumber(v.level);

export const parseCharacters = (raw: { characters?: unknown }): Character[] =>
  filterByType(raw?.characters, isCharacter) ?? [];

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

  useEffect(() => {
    const ref = gameRef;
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
          } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to parse game data');
          }
        }
        setLoading(false);
      },
      (err) => {
        setError(err.message);
        setLoading(false);
      }
    );

    return unsubscribe;
  }, [gameRef]);

  const updateGameName = useCallback(async (name: string) => {
    await updateDoc(gameRef, { name });
  }, [gameRef]);

  const updateContent = useCallback(async (field: keyof ContentLists, value: string) => {
    await updateDoc(gameRef, { [`content.${field}`]: value });
  }, [gameRef]);

  const updateField = useCallback(async (field: keyof Pick<GameSession, 'threats' | 'iWonder'>, value: string) => {
    await updateDoc(gameRef, { [field]: value });
  }, [gameRef]);

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
    await withCharacters(gameRef, (chars) => chars.map((c) => c.id === characterId ? { ...c, name } : c));
  }, [gameRef]);

  const updateCharacterData = useCallback(async (characterId: string, data: Partial<CharacterData>) => {
    await withCharacters(gameRef, (chars) => chars.map((c) => {
      if (c.id !== characterId) return c;
      // Deep-merge playbookFeatures against the freshly-read doc so concurrent
      // saves to different feature keys don't clobber each other — the incoming
      // patch is built from a (possibly stale) prop snapshot of the whole object.
      const next = { ...c.data, ...data };
      if (data.playbookFeatures) {
        next.playbookFeatures = { ...c.data?.playbookFeatures, ...data.playbookFeatures };
      }
      return { ...c, data: next };
    }));
  }, [gameRef]);

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
    await updateDoc(gameRef, dotted);
  }, [gameRef]);

  return { game, loading, error, updateGameName, updateCharacterName, updateCharacterData, updateContent, updateField, updateSteading, addCharacter, removeCharacter, reorderCharacters };
};
