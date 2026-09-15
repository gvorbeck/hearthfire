import { useMemo } from 'react';
import type { NotesActions } from '@/components/playbook/SharedNotes/SharedNotes';
import type { UseGameResult } from './useGame';

type NotesActionsSource = Pick<UseGameResult, 'updateNotes' | 'claimNotesLock' | 'refreshNotesLock' | 'releaseNotesLock'>;

// Bundles the four notes actions off a useGame() result into the one stable object
// SharedNotes expects, shared by all three playbook pages.
export const useNotesActions = ({ updateNotes, claimNotesLock, refreshNotesLock, releaseNotesLock }: NotesActionsSource): NotesActions =>
  useMemo(
    () => ({ updateNotes, claimNotesLock, refreshNotesLock, releaseNotesLock }),
    [updateNotes, claimNotesLock, refreshNotesLock, releaseNotesLock],
  );
