import { addDoc, collection } from 'firebase/firestore';
import { db } from './firebase';
import { GAMES_COLLECTION } from './constants';

export const createGame = async (): Promise<string> => {
  const ref = await addDoc(collection(db, GAMES_COLLECTION), {
    createdAt: Date.now(),
    characters: [],
  });
  return ref.id;
};
