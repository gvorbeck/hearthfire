import { useCallback, useEffect, useRef, useState } from 'react';
import { arrayUnion, doc, onSnapshot, updateDoc } from 'firebase/firestore';
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
}

export const useGame = (gameId: string): UseGameResult => {
  const [game, setGame] = useState<GameSession | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const gameRef = useRef<GameSession | null>(null);
  gameRef.current = game;

  useEffect(() => {
    const ref = doc(db, GAMES_COLLECTION, gameId);

    const unsubscribe = onSnapshot(
      ref,
      (snapshot) => {
        if (!snapshot.exists()) {
          setGame(null);
        } else {
          setGame({ id: snapshot.id, ...snapshot.data() } as GameSession);
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

  const updateCharacterName = useCallback(async (characterId: string, name: string) => {
    const current = gameRef.current;
    if (!current) return;
    const updatedCharacters = current.characters.map((c: Character) => c.id === characterId ? { ...c, name } : c);
    try {
      await updateDoc(doc(db, GAMES_COLLECTION, gameId), { characters: updatedCharacters });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update character name');
      throw err;
    }
  }, [gameId]);

  const updateCharacterData = useCallback(async (characterId: string, data: Partial<CharacterData>) => {
    const current = gameRef.current;
    if (!current) return;
    const updatedCharacters = current.characters.map((c: Character) =>
      c.id === characterId ? { ...c, data: { ...c.data, ...data } } : c
    );
    try {
      await updateDoc(doc(db, GAMES_COLLECTION, gameId), { characters: updatedCharacters });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update character data');
      throw err;
    }
  }, [gameId]);

  return { game, loading, error, updateGameName, updateCharacterName, updateCharacterData, updateContent, updateField, addCharacter };
};
