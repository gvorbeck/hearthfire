import { lazy, Suspense, useCallback } from 'react';
import { Icon, PlaybookColumns, Spinner, Text } from '@/components/ui';
import { PlaybookSection } from '@/components/playbook/PlaybookSection';
import type { UseGameResult } from '@/hooks/useGame';
import type { NotesLock } from '@/types';
import styles from './SharedNotes.module.css';

// TipTap/ProseMirror is heavy and only needed once a playbook page has rendered its tabs, so it gets its
// own chunk rather than riding in all three playbook page bundles.
const NotesEditor = lazy(() => import('./NotesEditor').then((m) => ({ default: m.NotesEditor })));

export type NotesActions = Pick<UseGameResult, 'updateNotes' | 'claimNotesLock' | 'refreshNotesLock' | 'releaseNotesLock'>;

interface SharedNotesProps {
  // 'gm', 'steading', or a character id.
  notesKey: string;
  html: string | undefined;
  lock: NotesLock | undefined;
  actions: NotesActions;
  warning?: string;
}

// Full-width shared notes for the bottom of a playbook page. One tab types at a time; see useNotesLock.
export const SharedNotes = ({ notesKey, html, lock, actions, warning }: SharedNotesProps) => {
  const { updateNotes, claimNotesLock, refreshNotesLock, releaseNotesLock } = actions;
  const handleSave = useCallback((value: string) => updateNotes(notesKey, value), [updateNotes, notesKey]);
  const handleClaim = useCallback(() => claimNotesLock(notesKey), [claimNotesLock, notesKey]);
  const handleRefresh = useCallback(() => refreshNotesLock(notesKey), [refreshNotesLock, notesKey]);
  const handleRelease = useCallback((value: string) => releaseNotesLock(notesKey, value), [releaseNotesLock, notesKey]);

  return (
    <PlaybookColumns
      className={styles.root}
      full={
        <PlaybookSection title="Notes">
          {warning && (
            <p className={styles.warning} role="note">
              <Icon name="warning" size="small" className={styles.warningIcon} aria-hidden="true" />
              <Text as="span" size="xs">{warning}</Text>
            </p>
          )}
          <Suspense fallback={<div className={styles.loading}><Spinner /></div>}>
            <NotesEditor
              html={html ?? ''}
              lock={lock}
              label="Notes"
              onSave={handleSave}
              onClaim={handleClaim}
              onRefresh={handleRefresh}
              onRelease={handleRelease}
            />
          </Suspense>
        </PlaybookSection>
      }
    />
  );
};
