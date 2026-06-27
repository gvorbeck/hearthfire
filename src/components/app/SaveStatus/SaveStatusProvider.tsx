import { useState, useRef, useCallback, useMemo, type ReactNode } from 'react';
import {
  SaveStatusContext,
  type SaveStatusContextValue,
  type SaveStatusState,
} from './SaveStatusContext';

/*
 * SaveStatusProvider — app-wide aggregator for Firestore write activity.
 *
 * useGame's reportSave wrapper reports start/settle here for every write. Saves
 * are reference-counted (activeRef) so a character sheet with many fields
 * writing at once surfaces as a single "Saving…" state, dropping to "Saved"
 * only when the last in-flight write settles.
 *
 * Failures are owned by the existing error Toast — this provider only tracks
 * success so the indicator never claims "Saved" when a write actually failed.
 */
export const SaveStatusProvider = ({ children }: { children: ReactNode }) => {
  const [status, setStatus] = useState<SaveStatusState>('idle');
  const [lastSavedAt, setLastSavedAt] = useState<number | null>(null);
  // Count of saves currently in flight across all hook instances.
  const activeRef = useRef(0);
  // Did any save in the current in-flight batch succeed? Drives whether we land
  // on 'saved' (and stamp the time) or fall back to the prior resting state.
  const batchSucceededRef = useRef(false);

  const reportSaveStart = useCallback(() => {
    activeRef.current += 1;
    if (activeRef.current === 1) batchSucceededRef.current = false;
    setStatus('saving');
  }, []);

  const reportSaveSettled = useCallback((succeeded: boolean) => {
    if (activeRef.current > 0) activeRef.current -= 1;
    if (succeeded) batchSucceededRef.current = true;
    if (activeRef.current === 0) {
      if (batchSucceededRef.current) {
        // Date.now is read at settle time, not render time, so the timestamp
        // reflects when the write actually committed.
        setLastSavedAt(Date.now());
        setStatus('saved');
      } else {
        // Whole batch failed — leave the failure to the Toast. Keep showing the
        // last good "Saved · …" if there was one, so the user doesn't lose that
        // reassurance; otherwise fall back to idle (nothing to show).
        setStatus(lastSavedAt !== null ? 'saved' : 'idle');
      }
    }
  }, [lastSavedAt]);

  const value = useMemo<SaveStatusContextValue>(
    () => ({ status, lastSavedAt, reportSaveStart, reportSaveSettled }),
    [status, lastSavedAt, reportSaveStart, reportSaveSettled],
  );

  return (
    <SaveStatusContext.Provider value={value}>
      {children}
    </SaveStatusContext.Provider>
  );
};
