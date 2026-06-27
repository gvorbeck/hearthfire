import { createContext, useContext } from 'react';

// 'idle' — nothing in flight and nothing saved this session yet (no indicator).
// 'saving' — at least one write is in flight.
// 'saved' — the most recent save settled successfully; lastSavedAt is set.
export type SaveStatusState = 'idle' | 'saving' | 'saved';

export interface SaveStatusContextValue {
  // Read side — consumed by the SaveStatus pill.
  status: SaveStatusState;
  // Epoch ms of the last successful save, or null if none yet this session.
  lastSavedAt: number | null;
  // Write side — called by useGame's reportSave wrapper as writes start and
  // settle. Saves are reference-counted so a sheet with many fields saving at
  // once reads as a single "Saving…" until the last one finishes.
  reportSaveStart: () => void;
  reportSaveSettled: (succeeded: boolean) => void;
}

// Context lives apart from the provider component so the data layer (useGame)
// can report status without importing the UI layer.
export const SaveStatusContext = createContext<SaveStatusContextValue | null>(null);

export const useSaveStatus = (): SaveStatusContextValue => {
  const ctx = useContext(SaveStatusContext);
  if (!ctx) throw new Error('useSaveStatus must be used inside SaveStatusProvider');
  return ctx;
};

// For the data layer (useGame), which may render outside a SaveStatusProvider
// in bare renderHook tests — mirrors useToastOptional.
export const useSaveStatusOptional = (): SaveStatusContextValue | null =>
  useContext(SaveStatusContext);
