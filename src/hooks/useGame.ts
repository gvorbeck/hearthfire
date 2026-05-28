import { useCallback, useEffect, useState } from 'react';
import { arrayUnion, doc, onSnapshot, runTransaction, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { GAMES_COLLECTION } from '@/lib/constants';
import type { Character, CharacterData, ContentLists, GameSession, SteadingData } from '@/types';

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

export const parseCharacters = (raw: { characters?: unknown }): Character[] =>
  Array.isArray(raw?.characters) ? (raw.characters as Character[]).filter(Boolean) : [];

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
  Array.isArray(v) ? v as string[] : typeof v === 'string' && v ? v.split('\n').filter(Boolean) : undefined;

const VALID_SIZES = new Set(['hamlet', 'village', 'town', 'city']);

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
    debilities: typeof r.debilities === 'object' && r.debilities !== null ? r.debilities as SteadingData['debilities'] : undefined,
    resources: strArr(r.resources),
    fortifications: strArr(r.fortifications),
    improvements: typeof r.improvements === 'object' && r.improvements !== null ? r.improvements as Record<string, boolean> : undefined,
    gmImprovements: Array.isArray(r.gmImprovements)
      ? (r.gmImprovements as SteadingData['gmImprovements'])!.map((g, i) => ({ ...g, id: g.id ?? `gm-imp-legacy-${i}` }))
      : undefined,
    assetsList: Array.isArray(r.assetsList) ? r.assetsList as string[] : undefined,
    silverPurses: num(r.silverPurses),
    silverHandfuls: num(r.silverHandfuls),
    silverCoins: num(r.silverCoins),
    goldPurses: num(r.goldPurses),
    goldHandfuls: num(r.goldHandfuls),
    goldCoins: num(r.goldCoins),
    residents: Array.isArray(r.residents) ? r.residents as SteadingData['residents'] : undefined,
    neighbors: Array.isArray(r.neighbors) ? r.neighbors as SteadingData['neighbors'] : undefined,
    neighborNotes: typeof r.neighborNotes === 'object' && r.neighborNotes !== null ? r.neighborNotes as Record<string, string> : undefined,
    placesOfInterest: Array.isArray(r.placesOfInterest) ? r.placesOfInterest as string[] : undefined,
  };
};

const parseGameSession = (raw: Record<string, unknown>, id: string): GameSession => {
  if (typeof raw.name !== 'string') throw new Error('Game document missing required field: name');
  return {
    id,
    name: raw.name,
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

  useEffect(() => {
    const ref = doc(db, GAMES_COLLECTION, gameId);

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
  }, [gameId]);

  const updateGameName = useCallback(async (name: string) => {
    await updateDoc(doc(db, GAMES_COLLECTION, gameId), { name });
  }, [gameId]);

  const updateContent = useCallback(async (field: keyof ContentLists, value: string) => {
    await updateDoc(doc(db, GAMES_COLLECTION, gameId), { [`content.${field}`]: value });
  }, [gameId]);

  const updateField = useCallback(async (field: keyof Pick<GameSession, 'threats' | 'iWonder'>, value: string) => {
    await updateDoc(doc(db, GAMES_COLLECTION, gameId), { [field]: value });
  }, [gameId]);

  const addCharacter = useCallback(async (character: Character) => {
    await updateDoc(doc(db, GAMES_COLLECTION, gameId), { characters: arrayUnion(character) });
  }, [gameId]);

  const removeCharacter = useCallback(async (characterId: string) => {
    await withCharacters(doc(db, GAMES_COLLECTION, gameId), (chars) => chars.filter((c) => c.id !== characterId));
  }, [gameId]);

  const reorderCharacters = useCallback(async (characters: Character[]) => {
    const ids = characters.map((c) => c.id);
    await withCharacters(doc(db, GAMES_COLLECTION, gameId), (current) => {
      const lookup = new Map(current.map((c) => [c.id, c]));
      return ids.map((id) => lookup.get(id)).filter(Boolean) as Character[];
    });
  }, [gameId]);

  const updateCharacterName = useCallback(async (characterId: string, name: string) => {
    await withCharacters(doc(db, GAMES_COLLECTION, gameId), (chars) => chars.map((c) => c.id === characterId ? { ...c, name } : c));
  }, [gameId]);

  const updateCharacterData = useCallback(async (characterId: string, data: Partial<CharacterData>) => {
    await withCharacters(doc(db, GAMES_COLLECTION, gameId), (chars) => chars.map((c) => c.id === characterId ? { ...c, data: { ...c.data, ...data } } : c));
  }, [gameId]);

  const updateSteading = useCallback(async (patch: Partial<SteadingData>) => {
    const dotted: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(patch)) {
      if (k === 'improvements' && v !== null && typeof v === 'object') {
        for (const [ik, iv] of Object.entries(v as Record<string, boolean>)) {
          dotted[`steading.improvements.${ik}`] = iv;
        }
      } else {
        dotted[`steading.${k}`] = v;
      }
    }
    await updateDoc(doc(db, GAMES_COLLECTION, gameId), dotted);
  }, [gameId]);

  return { game, loading, error, updateGameName, updateCharacterName, updateCharacterData, updateContent, updateField, updateSteading, addCharacter, removeCharacter, reorderCharacters };
};
