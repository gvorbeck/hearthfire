import { useCallback, useId, useState } from 'react';
import { Button, Heading, Modal, Text } from '@/components/ui';
import type { GameExportEnvelope, ImportSummary } from '@/lib/gameBackup';
import styles from './ImportGameModal.module.css';

interface ImportGameModalProps {
  open: boolean;
  gameId: string;
  currentName: string;
  envelope: GameExportEnvelope;
  summary: ImportSummary;
  onClose: () => void;
  onConfirm: () => Promise<void>;
}

// The exportedAt stamp is ISO from our own writer, but a hand-edited file can carry
// anything — fall back to the raw string rather than rendering "Invalid Date".
const formatExportedAt = (iso: string): string => {
  if (!iso) return 'unknown date';
  const date = new Date(iso);
  return Number.isNaN(date.getTime()) ? iso : date.toLocaleString();
};

export const ImportGameModal = ({
  open,
  gameId,
  currentName,
  envelope,
  summary,
  onClose,
  onConfirm,
}: ImportGameModalProps) => {
  const headingId = useId();
  // The parent mounts this modal only while open, so `importing` resets naturally on
  // each open — no reset effect needed (same pattern as RemoveCharacterModal).
  const [importing, setImporting] = useState(false);

  const handleConfirm = useCallback(async () => {
    setImporting(true);
    try {
      await onConfirm();
    } catch {
      // onConfirm toasts its own failures, but the rejection still has to be caught
      // here — an async click handler that rethrows surfaces as an unhandled rejection.
    } finally {
      // Either way the button must stop saying "Replacing…" — on success the parent
      // unmounts this modal immediately after.
      setImporting(false);
    }
  }, [onConfirm]);

  const sourceName = envelope.gameName.trim() || 'Untitled game';
  const contents = [
    `${summary.characters} character${summary.characters === 1 ? '' : 's'}`,
    summary.hasSteading ? 'steading data' : null,
    summary.rolls > 0 ? `${summary.rolls} logged roll${summary.rolls === 1 ? '' : 's'}` : null,
  ].filter(Boolean).join(', ');

  // Restoring a backup taken from a different game is legitimate (a player who lost the
  // original ID rebuilding into a fresh game), but it's also exactly what an accidental
  // wrong-file pick looks like — so it gets called out rather than silently allowed.
  const idMismatch = !!envelope.gameId && envelope.gameId !== gameId;

  return (
    <Modal open={open} onClose={onClose} aria-labelledby={headingId}>
      <Heading as="h2" size="sm" id={headingId}>Replace this game's data?</Heading>

      <div className={styles.body}>
        <dl className={styles.details}>
          <dt><Text as="span" size="xs" color="muted">Backup of</Text></dt>
          <dd><Text as="span" size="xs">{sourceName}</Text></dd>
          <dt><Text as="span" size="xs" color="muted">Taken</Text></dt>
          <dd><Text as="span" size="xs">{formatExportedAt(envelope.exportedAt)}</Text></dd>
          <dt><Text as="span" size="xs" color="muted">Contains</Text></dt>
          <dd><Text as="span" size="xs">{contents}</Text></dd>
        </dl>

        {idMismatch && (
          <Text size="xs" color="muted">
            {`This backup came from a different game (**${envelope.gameId}**). Importing it here will make **${currentName}** a copy of that one.`}
          </Text>
        )}

        <div className={styles.warning}>
          <Text size="xs" color="muted">
            <strong className={styles.warningLabel}>Everything in this game will be overwritten.</strong>{' '}
            Characters, steading, and notes added since the backup was taken will be lost, and anyone
            with the game open will see it change. This cannot be undone from inside the app.
          </Text>
        </div>

        <Text size="xs" color="muted">
          A copy of the current data will download first, so you can put things back with Import if
          this turns out to be the wrong file.
        </Text>
      </div>

      <div className={styles.actions}>
        <Button variant="ghost" size="md" onClick={onClose} disabled={importing}>Cancel</Button>
        <Button variant="danger" size="md" onClick={handleConfirm} disabled={importing}>
          {importing ? 'Replacing…' : 'Replace game data'}
        </Button>
      </div>
    </Modal>
  );
};
