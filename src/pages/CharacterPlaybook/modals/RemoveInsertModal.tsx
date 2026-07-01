import { useId, useState, useCallback } from 'react';
import { Button, Heading, Modal, Text } from '@/components/ui';
import { useToast } from '@/components/app';
import type { InsertOption } from '@/hooks/useInsertTabs';
import styles from './RemoveInsertModal.module.css';

const REMOVE_INSERT_WARNINGS: Partial<Record<InsertOption, string>> = {
  Followers: 'All followers and their data will be permanently lost.',
};

interface RemoveInsertModalProps {
  open: boolean;
  insert: InsertOption | null;
  onClose: () => void;
  onConfirm: () => Promise<void>;
}

export const RemoveInsertModal = ({ open, insert, onClose, onConfirm }: RemoveInsertModalProps) => {
  const headingId = useId();
  const { addToast } = useToast();
  // The parent mounts this modal only while open, so `removing` resets naturally
  // on each open — no reset effect needed.
  const [removing, setRemoving] = useState(false);
  const warning = insert ? REMOVE_INSERT_WARNINGS[insert] : undefined;

  const handleConfirm = useCallback(async () => {
    setRemoving(true);
    try {
      await onConfirm();
      setRemoving(false);
      onClose();
    } catch {
      setRemoving(false);
      addToast('Failed to remove insert. Try again.', 'error');
    }
  }, [onConfirm, onClose, addToast]);

  return (
    <Modal open={open} onClose={onClose} aria-labelledby={headingId}>
      <Heading as="h2" size="md" id={headingId}>Remove {insert ?? ''}?</Heading>
      {insert && (
        <Text font="serif" color="muted" className={styles.warning}>{`This will remove the **${insert}** tab from this character sheet.${warning ? ` ${warning}` : ''}`}</Text>
      )}
      <div className={styles.actions}>
        <Button variant="secondary" onClick={onClose} disabled={removing}>Cancel</Button>
        <Button variant="primary" onClick={handleConfirm} disabled={removing}>
          {removing ? 'Removing…' : 'Remove'}
        </Button>
      </div>
    </Modal>
  );
};
