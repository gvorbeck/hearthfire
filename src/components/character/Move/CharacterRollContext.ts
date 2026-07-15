import { createContext, useContext } from 'react';
import type { CharacterData } from '@/types';
import type { RollReport } from './RollAffordance';

// Everything the shared Move component needs to offer a roll affordance, provided once per character
// sheet so every Move — Moves tab, Arcana mysteries, playbook inserts — gets rolling without each caller
// threading it down. `data` resolves the stat modifier + debility; `onRoll` logs the result to the game
// doc. Kept in its own module (not the provider) so Move can import the hook without a UI dependency.
export interface CharacterRollContextValue {
  data: CharacterData | undefined;
  onRoll: (moveName: string, report: RollReport) => void;
}

export const CharacterRollContext = createContext<CharacterRollContextValue | null>(null);

// Optional by design: a Move rendered outside a character sheet (GM playbook move search, bare tests)
// gets null and simply shows no roll button. Mirrors useSaveStatusOptional.
export const useCharacterRollOptional = (): CharacterRollContextValue | null =>
  useContext(CharacterRollContext);
