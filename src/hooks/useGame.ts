import { useCallback, useEffect, useMemo, useState } from 'react';
import { useLatest } from './useLatest';
import { doc, onSnapshot, runTransaction, setDoc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useSaveStatusOptional } from '@/components/app/SaveStatus/SaveStatusContext';
import { useToastOptional } from '@/components/app/Toast/ToastContext';
import { GAMES_COLLECTION, SAVE_ERROR_MESSAGE } from '@/lib/constants';
import { isBoolean, isPlainObject, isRecord } from '@/lib/typeGuards';
import { parseDiceRolls, parseGameSession, parseSteading, ROLL_LOG_CAP } from '@/lib/gameParsing';
import { FIRESTORE_ERROR_MESSAGES, friendlyFirestoreError, isFirestoreError, mergeById, STEADING_ID_ARRAY_FIELDS, stripUndefined, withCharacters } from '@/lib/gameMutations';
import type { Character, CharacterData, ContentLists, GameSession, LoggedRoll, SteadingData } from '@/types';

// Re-exported from their new home in lib/gameParsing so existing consumers and tests
// that import them from this hook keep working.
export { parseCharacterData, parseCharacters, parseContent, parseSteading } from '@/lib/gameParsing';

interface UseGameResult {
  game: GameSession | null;
  loading: boolean;
  error: string | null;
  updateGameName: (name: string) => Promise<void>;
  updateCharacterName: (characterId: string, name: string) => Promise<void>;
  updateCharacterData: (characterId: string, data: Partial<CharacterData>) => Promise<void>;
  adjustCharacterStats: (characterId: string, deltas: Partial<Record<'statArmor' | 'statHp', number>>) => Promise<void>;
  updateContent: (field: keyof ContentLists, value: string) => Promise<void>;
  updateField: (field: keyof Pick<GameSession, 'threats' | 'iWonder'>, value: string) => Promise<void>;
  updateSteading: (patch: Partial<SteadingData>) => Promise<void>;
  addCharacter: (character: Character) => Promise<void>;
  removeCharacter: (characterId: string) => Promise<void>;
  reorderCharacters: (characters: Character[]) => Promise<void>;
  logRoll: (roll: LoggedRoll) => Promise<void>;
  replaceGameData: (game: Record<string, unknown>) => Promise<void>;
}

export const useGame = (gameId: string): UseGameResult => {
  const [game, setGame] = useState<GameSession | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const gameRef = useMemo(() => doc(db, GAMES_COLLECTION, gameId), [gameId]);

  // Report every persisted write to the app-wide save-status indicator and the
  // error Toast. Held in refs so wrapping a mutation doesn't add the (per-render)
  // context objects to its dependency array — the callbacks stay stable.
  const saveStatus = useSaveStatusOptional();
  const saveStatusRef = useLatest(saveStatus);
  const addToast = useToastOptional()?.addToast;
  const addToastRef = useLatest(addToast);

  // Wraps a write so the indicator shows "Saving…" while it runs and "Saved"
  // once it settles. On failure it surfaces SAVE_ERROR_MESSAGE — every save path
  // funnels through here, so direct callers (radios, checkboxes) fail loud just
  // like debounced fields — then re-throws so callers' own .catch and the
  // debounce hook's retry still run. The shared constant keeps this and the
  // debounce hook on one string, so the Toast dedupe collapses them to one.
  const reportSave = useCallback(async (write: () => Promise<void>): Promise<void> => {
    saveStatusRef.current?.reportSaveStart();
    let succeeded = false;
    try {
      await write();
      succeeded = true;
    } catch (error) {
      // A code we have a specific line for (e.g. the 1 MiB doc-size ceiling) gets
      // that actionable message; everything else falls back to SAVE_ERROR_MESSAGE
      // so it still dedupes against the debounce hook's toast on the shared string.
      const message =
        isFirestoreError(error) && FIRESTORE_ERROR_MESSAGES[error.code]
          ? FIRESTORE_ERROR_MESSAGES[error.code]!
          : SAVE_ERROR_MESSAGE;
      addToastRef.current?.(message, 'error');
      throw error;
    } finally {
      saveStatusRef.current?.reportSaveSettled(succeeded);
    }
  }, []);

  useEffect(() => {
    const ref = gameRef;
    // Reset to the loading state before (re)subscribing to a new game's snapshot
    // stream. This is a store-subscription effect keyed on gameRef, not a
    // derived-state cascade — the reset must happen so stale data from the prior
    // game doesn't show while the new snapshot is in flight.
    // eslint-disable-next-line react-hooks/set-state-in-effect
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
          } catch {
            // A parse failure means the stored document is malformed — surface a
            // player-readable line rather than the raw thrown message.
            setError("This game's data couldn't be read. Please try again or contact your GM.");
          }
        }
        setLoading(false);
      },
      (err) => {
        setError(friendlyFirestoreError(err));
        setLoading(false);
      }
    );

    return unsubscribe;
  }, [gameRef]);

  const updateGameName = useCallback(async (name: string) => {
    await reportSave(() => updateDoc(gameRef, { name }));
  }, [gameRef, reportSave]);

  const updateContent = useCallback(async (field: keyof ContentLists, value: string) => {
    await reportSave(() => updateDoc(gameRef, { [`content.${field}`]: value }));
  }, [gameRef, reportSave]);

  const updateField = useCallback(async (field: keyof Pick<GameSession, 'threats' | 'iWonder'>, value: string) => {
    await reportSave(() => updateDoc(gameRef, { [field]: value }));
  }, [gameRef, reportSave]);

  const addCharacter = useCallback(async (character: Character) => {
    // Read-modify-write so a double-tap or post-blip retry can't append the
    // same id twice — arrayUnion treats each Character object as unique.
    await reportSave(() => withCharacters(gameRef, (chars) =>
      chars.some((c) => c.id === character.id) ? chars : [...chars, character]
    ));
  }, [gameRef, reportSave]);

  const removeCharacter = useCallback(async (characterId: string) => {
    await reportSave(() => withCharacters(gameRef, (chars) => chars.filter((c) => c.id !== characterId)));
  }, [gameRef, reportSave]);

  const reorderCharacters = useCallback(async (characters: Character[]) => {
    const ids = characters.map((c) => c.id);
    await reportSave(() => withCharacters(gameRef, (current) => {
      const lookup = new Map(current.map((c) => [c.id, c]));
      const reordered = ids.map((id) => lookup.get(id)).filter(Boolean) as Character[];
      // A character concurrently added by another player won't be in the dragging
      // client's stale `ids` list — append it rather than silently dropping it.
      const idSet = new Set(ids);
      const added = current.filter((c) => !idSet.has(c.id));
      return [...reordered, ...added];
    }));
  }, [gameRef, reportSave]);

  const updateCharacterName = useCallback(async (characterId: string, name: string) => {
    await reportSave(() => withCharacters(gameRef, (chars) => chars.map((c) => c.id === characterId ? { ...c, name } : c)));
  }, [gameRef, reportSave]);

  const updateCharacterData = useCallback(async (characterId: string, data: Partial<CharacterData>) => {
    await reportSave(() => withCharacters(gameRef, (chars) => chars.map((c) => {
      if (c.id !== characterId) return c;
      // Shallow-merge every plain-object field (typeMoves, specialPossessions,
      // appearance, etc.) against the freshly-read doc so a save built from a
      // (possibly stale) prop snapshot only touches the keys it actually changed —
      // a concurrent save to a sibling key on the same field can't be clobbered.
      // Arrays (e.g. arcanaMinor) are excluded here; they're id-merged below instead.
      const next = { ...c.data, ...data };
      for (const key of Object.keys(data) as (keyof CharacterData)[]) {
        const incoming = data[key];
        const existing = c.data?.[key];
        if (isPlainObject(incoming) && isPlainObject(existing)) {
          (next as Record<string, unknown>)[key] = { ...existing, ...incoming };
        }
      }
      // playbookFeatures additionally supports key deletion via the explicit
      // deleteFeatureKeys sentinel — omitting a key from the patch merges as
      // "unchanged" (see above), not "deleted".
      if (data.deleteFeatureKeys?.length && next.playbookFeatures) {
        next.playbookFeatures = { ...next.playbookFeatures };
        for (const key of data.deleteFeatureKeys) delete next.playbookFeatures[key];
      }
      delete next.deleteFeatureKeys;
      // Id-merge arcana entries instead of overwriting the whole array, so a
      // concurrent edit to a different entry (or a different field on the same
      // entry) survives rather than being reverted by a stale snapshot. Removal
      // uses the explicit removedArcana*Ids sentinel (see the type definition).
      if (data.arcanaMinor) {
        next.arcanaMinor = mergeById(c.data?.arcanaMinor, data.arcanaMinor, data.removedArcanaMinorIds);
      }
      if (data.arcanaMajor) {
        next.arcanaMajor = mergeById(c.data?.arcanaMajor, data.arcanaMajor, data.removedArcanaMajorIds);
      }
      delete next.removedArcanaMinorIds;
      delete next.removedArcanaMajorIds;
      return { ...c, data: next };
    })));
  }, [gameRef, reportSave]);

  // Add a signed delta to a character's Armor/HP inside the transaction, reading each stat off the
  // freshly-read doc rather than a caller-supplied snapshot. Arcana consequence actions use this so a
  // rapid check-then-uncheck (or a snapshot that hasn't echoed the last edit) can't compute the new
  // value from a stale number and strand the stat on the wrong total.
  const adjustCharacterStats = useCallback(async (characterId: string, deltas: Partial<Record<'statArmor' | 'statHp', number>>) => {
    await reportSave(() => withCharacters(gameRef, (chars) => chars.map((c) => {
      if (c.id !== characterId) return c;
      const next = { ...c.data };
      for (const [field, delta] of Object.entries(deltas) as ['statArmor' | 'statHp', number][]) {
        next[field] = String((Number(next[field]) || 0) + delta);
      }
      return { ...c, data: next };
    })));
  }, [gameRef, reportSave]);

  const updateSteading = useCallback(async (patch: Partial<SteadingData>) => {
    await reportSave(() => runTransaction(db, async (tx) => {
      const snap = await tx.get(gameRef);
      if (!snap.exists()) throw new Error('Game not found — it may have been deleted.');
      const existing = parseSteading(snap.data().steading) ?? {};

      const idArrayFields: Record<string, keyof SteadingData> = STEADING_ID_ARRAY_FIELDS;
      // The write-only sentinel keys (paired to an id-array field above) are consumed via
      // patch[idArrayFields[k]] below and never written under their own name — unlike
      // removedFixedItems, which has no paired incoming array and is a real persisted field.
      const sentinelKeys = new Set(Object.values(idArrayFields));

      const dotted: Record<string, unknown> = {};
      for (const [k, v] of Object.entries(patch)) {
        if (k === 'improvements' && isRecord(v)) {
          // Only write entries whose value is actually boolean — the patch is
          // cast at the Firestore boundary, so guard against a non-boolean slipping
          // into the dotted write.
          for (const [ik, iv] of Object.entries(v)) {
            if (isBoolean(iv)) dotted[`steading.improvements.${ik}`] = iv;
          }
        } else if (k in idArrayFields && Array.isArray(v)) {
          // Id-merge instead of overwriting the whole array, so a concurrent edit to a
          // different entry (e.g. another NPC) survives rather than being reverted by a
          // stale snapshot. Removal uses the explicit removedXIds sentinel.
          const removedIds = patch[idArrayFields[k]] as string[] | undefined;
          const merged = mergeById(existing[k as keyof SteadingData] as { id: string }[] | undefined, v as { id: string }[], removedIds);
          dotted[`steading.${k}`] = stripUndefined(merged);
        } else if (k === 'removedFixedItems' && Array.isArray(v)) {
          // Union against the freshly-read doc rather than overwrite: the Resources,
          // Fortifications, and Assets sections each hold their own optimistic copy of this
          // one shared field, so a stale copy's write must not drop another section's
          // concurrent removal (or another client's).
          const merged = new Set([...(existing.removedFixedItems ?? []), ...(v as string[])]);
          dotted[`steading.${k}`] = [...merged];
        } else if (!(k in idArrayFields) && !sentinelKeys.has(k as keyof SteadingData)) {
          dotted[`steading.${k}`] = (Array.isArray(v) || isPlainObject(v)) ? stripUndefined(v) : v;
        }
      }
      tx.update(gameRef, dotted);
    }));
  }, [gameRef, reportSave]);

  // Append a roll to the shared log. A discrete event — written straight through (not debounced) inside a
  // transaction so a stale snapshot can't drop a concurrent roll, then capped to the most recent
  // ROLL_LOG_CAP. Id-merge keeps another client's just-added roll; the trailing slice trims the oldest.
  const logRoll = useCallback(async (roll: LoggedRoll) => {
    await reportSave(() => runTransaction(db, async (tx) => {
      const snap = await tx.get(gameRef);
      if (!snap.exists()) throw new Error('Game not found — it may have been deleted.');
      const existing = parseDiceRolls(snap.data().diceRolls) ?? [];
      // mergeById is add/edit-by-id; our roll is always new, so this reduces to "keep everyone's rolls".
      const merged = mergeById(existing, [roll])
        .sort((a, b) => a.createdAt - b.createdAt)
        .slice(-ROLL_LOG_CAP);
      tx.update(gameRef, { diceRolls: stripUndefined(merged) });
    }));
  }, [gameRef, reportSave]);

  // Replace the whole document with a validated backup payload (see readImportFile).
  // Deliberately a `setDoc` overwrite, not a merge: restoring a backup has to be able to
  // remove things too — a merge would leave characters, NPCs, and improvements added since
  // the backup was taken sitting alongside the restored ones. The only caller confirms
  // through a destructive-action dialog and downloads a safety copy of the live doc first.
  const replaceGameData = useCallback(async (game: Record<string, unknown>) => {
    await reportSave(() => setDoc(gameRef, game));
  }, [gameRef, reportSave]);

  return { game, loading, error, updateGameName, updateCharacterName, updateCharacterData, adjustCharacterStats, updateContent, updateField, updateSteading, addCharacter, removeCharacter, reorderCharacters, logRoll, replaceGameData };
};
