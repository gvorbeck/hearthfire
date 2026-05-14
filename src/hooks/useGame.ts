import { useCallback, useEffect, useState } from 'react';
import { doc, onSnapshot, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { GAMES_COLLECTION } from '@/lib/constants';
import type { ContentLists, GameSession } from '@/types';

interface UseGameResult {
  game: GameSession | null;
  loading: boolean;
  error: string | null;
  updateGameName: (name: string) => Promise<void>;
  updateContent: (field: keyof ContentLists, value: string) => Promise<void>;
}

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

  return { game, loading, error, updateGameName, updateContent };
};
