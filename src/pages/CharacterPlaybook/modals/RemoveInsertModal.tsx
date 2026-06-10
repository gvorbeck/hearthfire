import { useId } from 'react';
import { Button, Heading, Modal, Text } from '@/components/ui';
import type { InsertOption } from '@/hooks/useInsertTabs';
import styles from './RemoveInsertModal.module.css';

const REMOVE_INSERT_WARNINGS: Partial<Record<InsertOption, string>> = {
  Followers: 'All followers and their data will be permanently lost.',
};

interface RemoveInsertModalProps {
  open: boolean;
  insert: InsertOption | null;
  onClose: () => void;
  onConfirm: () => void;
}

export const RemoveInsertModal = ({ open, insert, onClose, onConfirm: handleConfirm }: RemoveInsertModalProps) => {
  const headingId = useId();
  const warning = insert ? REMOVE_INSERT_WARNINGS[insert] : undefined;

  return (
    <Modal open={open} onClose={onClose} aria-labelledby={headingId}>
      <Heading as="h2" size="md" id={headingId}>Remove {insert ?? ''}?</Heading>
      {insert && (
        <Text font="serif" color="muted" className={styles.warning}>{`This will remove the **${insert}** tab from this character sheet.${warning ? ` ${warning}` : ''}`}</Text>
      )}
      <div className={styles.actions}>
        <Button variant="secondary" onClick={onClose}>Cancel</Button>
        <Button variant="primary" onClick={handleConfirm}>Remove</Button>
      </div>
    </Modal>
  );
};
