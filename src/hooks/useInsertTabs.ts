import { useState, useCallback, useMemo } from 'react';
import { useToast } from '@/components/app';
import type { Character, CharacterData, PlaybookType } from '@/types';

const INSERT_OPTIONS = ['Revenant', 'Ghost', 'Thrall', 'Followers'] as const;
export type InsertOption = typeof INSERT_OPTIONS[number];

export { INSERT_OPTIONS };

export const useInsertTabs = (
  character: Character,
  onSave: (data: Partial<CharacterData>) => Promise<void>,
  getPlaybookTabCount: (playbook: PlaybookType, data: CharacterData | undefined) => number,
  setActiveIndex: (i: number) => void,
) => {
  const { addToast } = useToast();
  const [addTabOpen, setAddTabOpen] = useState(false);
  const [removeInsert, setRemoveInsert] = useState<InsertOption | null>(null);

  const handleOpenAddTab = useCallback(() => setAddTabOpen(true), []);
  const handleCloseAddTab = useCallback(() => setAddTabOpen(false), []);

  const handleRequestRemoveInsert = useCallback((insert: InsertOption) => {
    setRemoveInsert(insert);
  }, []);

  const removeInsertHandlers = useMemo(
    () => Object.fromEntries(INSERT_OPTIONS.map((opt) => [opt, () => handleRequestRemoveInsert(opt)])),
    [handleRequestRemoveInsert],
  );

  const handleCloseRemoveInsert = useCallback(() => setRemoveInsert(null), []);

  // Error/close/in-flight lifecycle is owned by RemoveInsertModal; let errors propagate.
  const handleConfirmRemoveInsert = useCallback(async () => {
    if (!removeInsert) return;
    const next = (character.data?.inserts ?? []).filter((i) => i !== removeInsert);
    const patch: Partial<CharacterData> = { inserts: next };
    // Followers must be explicitly deleted, not just omitted from playbookFeatures —
    // updateCharacterData's merge is additive, so an omitted key survives the spread
    // and reappears from the freshly-read doc (issue #241).
    if (removeInsert === 'Followers') patch.deleteFeatureKeys = ['followers'];
    await onSave(patch);
    setActiveIndex(0);
  }, [removeInsert, character.data, onSave, setActiveIndex]);

  const handleAddInsert = useCallback(async (insert: InsertOption) => {
    const current = character.data?.inserts ?? [];
    if (current.includes(insert)) {
      setAddTabOpen(false);
      return;
    }
    const next = [...current, insert];
    const fixedTabCount = 3 + getPlaybookTabCount(character.playbook, character.data);
    try {
      await onSave({ inserts: next });
      setActiveIndex(fixedTabCount + next.length - 1);
      setAddTabOpen(false);
    } catch {
      // Save failed — keep the modal open so the user knows it didn't take.
      addToast('Failed to add insert. Try again.', 'error');
    }
  }, [character.data, character.playbook, onSave, getPlaybookTabCount, setActiveIndex, addToast]);

  return {
    addTabOpen,
    removeInsert,
    removeInsertHandlers,
    handleOpenAddTab,
    handleCloseAddTab,
    handleRequestRemoveInsert,
    handleCloseRemoveInsert,
    handleConfirmRemoveInsert,
    handleAddInsert,
  };
};
