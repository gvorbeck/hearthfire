import { useState, useCallback, useMemo } from 'react';
import { resolvePlaybookFeatures } from '@/lib/resolvePlaybookFeatures';
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

  const handleConfirmRemoveInsert = useCallback(async () => {
    if (!removeInsert) return;
    const next = (character.data?.inserts ?? []).filter((i) => i !== removeInsert);
    const resolved = resolvePlaybookFeatures(character.data);
    const { followers, ...restFeatures } = resolved;
    void followers;
    const playbookFeatures = removeInsert === 'Followers' ? restFeatures : resolved;
    try {
      await onSave({ inserts: next, playbookFeatures });
      setActiveIndex(0);
      setRemoveInsert(null);
    } catch {
      setRemoveInsert(null);
    }
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
    } finally {
      setAddTabOpen(false);
    }
  }, [character.data, character.playbook, onSave, getPlaybookTabCount, setActiveIndex]);

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
