import { useCallback, useEffect, useState } from 'react';
import { arrayUnion, doc, onSnapshot, runTransaction, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { GAMES_COLLECTION } from '@/lib/constants';
import type { Character, CharacterData, ContentLists, GameSession } from '@/types';

interface UseGameResult {
  game: GameSession | null;
  loading: boolean;
  error: string | null;
  updateGameName: (name: string) => Promise<void>;
  updateCharacterName: (characterId: string, name: string) => Promise<void>;
  updateCharacterData: (characterId: string, data: Partial<CharacterData>) => Promise<void>;
  updateContent: (field: keyof ContentLists, value: string) => Promise<void>;
  updateField: (field: keyof Pick<GameSession, 'threats' | 'iWonder'>, value: string) => Promise<void>;
  addCharacter: (character: Character) => Promise<void>;
  removeCharacter: (characterId: string) => Promise<void>;
}

const parseCharacters = (raw: { characters?: unknown }): Character[] =>
  Array.isArray(raw?.characters) ? (raw.characters as Character[]).filter(Boolean) : [];

const withCharacters = async (
  ref: ReturnType<typeof doc>,
  transform: (characters: Character[]) => Character[]
): Promise<void> => {
  await runTransaction(db, async (tx) => {
    const snap = await tx.get(ref);
    if (!snap.exists()) return;
    tx.update(ref, { characters: transform(parseCharacters(snap.data())) as unknown[] });
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
        } else {
          const raw = snapshot.data();
          setGame({ ...raw, characters: parseCharacters(raw), id: snapshot.id } as unknown as GameSession);
        }
        setLoading(false);
        setError(null);
      },
      (err) => {
        setError(err.message);
        setLoading(false);
      }
    );

    return unsubscribe;
  }, [gameId]);

  const updateGameName = useCallback(async (name: string) => {
    try {
      await updateDoc(doc(db, GAMES_COLLECTION, gameId), { name });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update game name');
      throw err;
    }
  }, [gameId]);

  const updateContent = useCallback(async (field: keyof ContentLists, value: string) => {
    try {
      await updateDoc(doc(db, GAMES_COLLECTION, gameId), { [`content.${field}`]: value });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save content');
      throw err;
    }
  }, [gameId]);

  const updateField = useCallback(async (field: keyof Pick<GameSession, 'threats' | 'iWonder'>, value: string) => {
    try {
      await updateDoc(doc(db, GAMES_COLLECTION, gameId), { [field]: value });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save');
      throw err;
    }
  }, [gameId]);

  const addCharacter = useCallback(async (character: Character) => {
    try {
      await updateDoc(doc(db, GAMES_COLLECTION, gameId), { characters: arrayUnion(character) });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add character');
      throw err;
    }
  }, [gameId]);

  const removeCharacter = useCallback(async (characterId: string) => {
    try {
      await withCharacters(doc(db, GAMES_COLLECTION, gameId), (chars) => chars.filter((c) => c.id !== characterId));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to remove character');
      throw err;
    }
  }, [gameId]);

  const updateCharacterName = useCallback(async (characterId: string, name: string) => {
    try {
      await withCharacters(doc(db, GAMES_COLLECTION, gameId), (chars) => chars.map((c) => c.id === characterId ? { ...c, name } : c));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update character name');
      throw err;
    }
  }, [gameId]);

  const updateCharacterData = useCallback(async (characterId: string, data: Partial<CharacterData>) => {
    try {
      await withCharacters(doc(db, GAMES_COLLECTION, gameId), (chars) => chars.map((c) => c.id === characterId ? { ...c, data: { ...c.data, ...data } } : c));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update character data');
      throw err;
    }
  }, [gameId]);

  return { game, loading, error, updateGameName, updateCharacterName, updateCharacterData, updateContent, updateField, addCharacter, removeCharacter };
};
