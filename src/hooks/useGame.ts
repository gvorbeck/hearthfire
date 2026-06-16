import { useCallback, useEffect, useMemo, useState } from 'react';
import { arrayUnion, doc, onSnapshot, runTransaction, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { GAMES_COLLECTION } from '@/lib/constants';
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
  typeof v === 'object' && v !== null &&
  typeof (v as Record<string, unknown>).id === 'string' &&
  typeof (v as Record<string, unknown>).name === 'string' &&
  VALID_PLAYBOOKS.has((v as Record<string, unknown>).playbook as string) &&
  typeof (v as Record<string, unknown>).level === 'number';

export const parseCharacters = (raw: { characters?: unknown }): Character[] =>
  Array.isArray(raw?.characters) ? (raw.characters as unknown[]).filter(isCharacter) : [];

export const parseContent = (raw: unknown): ContentLists | undefined => {
  if (typeof raw !== 'object' || raw === null) return undefined;
  const r = raw as Record<string, unknown>;
  return {
    excluded: typeof r.excluded === 'string' ? r.excluded : '',
    veiled: typeof r.veiled === 'string' ? r.veiled : '',
    specialHandling: typeof r.specialHandling === 'string' ? r.specialHandling : '',
  };
};

const num = (v: unknown): number | undefined => typeof v === 'number' ? v : undefined;
const strArr = (v: unknown): string[] | undefined =>
  Array.isArray(v) ? (v as unknown[]).filter((x): x is string => typeof x === 'string') : typeof v === 'string' && v ? v.split('\n').filter(Boolean) : undefined;

const VALID_SIZES = new Set(['hamlet', 'village', 'town', 'city']);

const parseDebilities = (v: unknown): SteadingData['debilities'] => {
  if (typeof v !== 'object' || v === null) return undefined;
  const r = v as Record<string, unknown>;
  return {
    diminished: typeof r.diminished === 'boolean' ? r.diminished : undefined,
    lacking: typeof r.lacking === 'boolean' ? r.lacking : undefined,
    malcontent: typeof r.malcontent === 'boolean' ? r.malcontent : undefined,
  };
};

const isNpcRelationship = (v: unknown): v is NpcRelationship =>
  typeof v === 'object' && v !== null &&
  typeof (v as Record<string, unknown>).id === 'string' &&
  typeof (v as Record<string, unknown>).type === 'string' &&
  typeof (v as Record<string, unknown>).targetId === 'string' &&
  ((v as Record<string, unknown>).targetKind === 'pc' ||
   (v as Record<string, unknown>).targetKind === 'resident' ||
   (v as Record<string, unknown>).targetKind === 'neighbor');

const parseNpc = (v: unknown): SteadingNPC | null => {
  if (typeof v !== 'object' || v === null) return null;
  const r = v as Record<string, unknown>;
  if (typeof r.id !== 'string' || typeof r.name !== 'string') return null;
  return {
    id: r.id,
    name: r.name,
    pronouns: typeof r.pronouns === 'string' ? r.pronouns : undefined,
    occupation: typeof r.occupation === 'string' ? r.occupation : undefined,
    traits: Array.isArray(r.traits) ? (r.traits as unknown[]).filter((t): t is string => typeof t === 'string') : undefined,
    relationships: Array.isArray(r.relationships) ? (r.relationships as unknown[]).filter(isNpcRelationship) : undefined,
    notes: typeof r.notes === 'string' ? r.notes : undefined,
    dead: r.dead === true ? true : undefined,
  };
};

const parseNpcs = (v: unknown): SteadingNPC[] | undefined => {
  if (!Array.isArray(v)) return undefined;
  return (v as unknown[]).map(parseNpc).filter((n): n is SteadingNPC => n !== null);
};

const parseGmImprovement = (v: unknown, i: number): GmImprovement | null => {
  if (typeof v !== 'object' || v === null) return null;
  const r = v as Record<string, unknown>;
  if (typeof r.title !== 'string' || typeof r.summary !== 'string' ||
      typeof r.requirements !== 'string' || typeof r.effects !== 'string' ||
      typeof r.completed !== 'boolean') return null;
  const cat = r.category;
  return {
    id: typeof r.id === 'string' ? r.id : `gm-imp-legacy-${i}`,
    title: r.title,
    summary: r.summary,
    requirements: r.requirements,
    effects: r.effects,
    completed: r.completed,
    category: cat === 'resource' || cat === 'fortification' || cat === 'asset' ? cat : null,
  };
};

export const parseSteading = (raw: unknown): SteadingData | undefined => {
  if (typeof raw !== 'object' || raw === null) return undefined;
  const r = raw as Record<string, unknown>;
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
    improvements: typeof r.improvements === 'object' && r.improvements !== null
      ? Object.fromEntries(Object.entries(r.improvements as Record<string, unknown>).filter(([, iv]) => typeof iv === 'boolean')) as Record<string, boolean>
      : undefined,
    gmImprovements: Array.isArray(r.gmImprovements)
      ? (r.gmImprovements as unknown[]).map(parseGmImprovement).filter((g): g is GmImprovement => g !== null)
      : undefined,
    assetsList: Array.isArray(r.assetsList) ? (r.assetsList as unknown[]).filter((x): x is string => typeof x === 'string') : undefined,
    silverPurses: num(r.silverPurses),
    silverHandfuls: num(r.silverHandfuls),
    silverCoins: num(r.silverCoins),
    goldPurses: num(r.goldPurses),
    goldHandfuls: num(r.goldHandfuls),
    goldCoins: num(r.goldCoins),
    residents: parseNpcs(r.residents),
    neighbors: parseNpcs(r.neighbors),
    neighborNotes: typeof r.neighborNotes === 'object' && r.neighborNotes !== null
      ? Object.fromEntries(Object.entries(r.neighborNotes as Record<string, unknown>).filter(([, iv]) => typeof iv === 'string')) as Record<string, string>
      : undefined,
    placesOfInterest: Array.isArray(r.placesOfInterest) ? (r.placesOfInterest as unknown[]).filter((x): x is string => typeof x === 'string') : undefined,
  };
};

const parseGameSession = (raw: Record<string, unknown>, id: string): GameSession => {
  return {
    id,
    // Defaults to '' like every other field so a legacy/corrupt doc missing
    // name stays readable rather than failing the whole parse.
    name: typeof raw.name === 'string' ? raw.name : '',
    createdAt: typeof raw.createdAt === 'number' ? raw.createdAt : 0,
    characters: parseCharacters(raw),
    content: parseContent(raw.content),
    threats: typeof raw.threats === 'string' ? raw.threats : undefined,
    iWonder: typeof raw.iWonder === 'string' ? raw.iWonder : undefined,
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
    await updateDoc(gameRef, { characters: arrayUnion(character) });
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
      if (k === 'improvements' && v !== null && typeof v === 'object') {
        // Only write entries whose value is actually boolean — the patch is
        // cast at the Firestore boundary, so guard against a non-boolean slipping
        // into the dotted write.
        for (const [ik, iv] of Object.entries(v as Record<string, unknown>)) {
          if (typeof iv === 'boolean') dotted[`steading.improvements.${ik}`] = iv;
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
