import { addDoc, collection, doc, getDoc, runTransaction } from 'firebase/firestore';
import { db } from './firebase';
import { GAMES_COLLECTION } from './constants';

const newGame = () => ({ name: '', createdAt: Date.now(), characters: [] });

export const createGame = async (): Promise<string> => {
  const ref = await addDoc(collection(db, GAMES_COLLECTION), newGame());
  return ref.id;
};

export const gameIdExists = async (id: string): Promise<boolean> => {
  const snap = await getDoc(doc(db, GAMES_COLLECTION, id));
  return snap.exists();
};

export const slugifyGameId = (raw: string): string =>
  raw
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

export const createGameWithId = async (id: string): Promise<void> => {
  const ref = doc(db, GAMES_COLLECTION, id);
  await runTransaction(db, async (tx) => {
    const snap = await tx.get(ref);
    if (snap.exists()) throw new Error('Game ID already taken.');
    tx.set(ref, newGame());
  });
};
