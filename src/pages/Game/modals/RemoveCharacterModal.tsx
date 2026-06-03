import { useState, useId, useCallback } from 'react';
import { Button, Heading, Modal, Text } from '@/components/ui';
import { PLAYBOOKS } from '@/lib/constants';
import type { Character } from '@/types';
import styles from './RemoveCharacterModal.module.css';

interface RemoveCharacterModalProps {
  character: Character | null;
  onClose: () => void;
  onConfirm: () => Promise<void>;
}

export const RemoveCharacterModal = ({ character, onClose, onConfirm }: RemoveCharacterModalProps) => {
  const headingId = useId();
  const [removing, setRemoving] = useState(false);

  const handleConfirm = useCallback(async () => {
    setRemoving(true);
    try {
      await onConfirm();
      onClose();
    } catch {
      setRemoving(false);
    }
  }, [onConfirm, onClose]);

  if (!character) return null;

  const playbookOption = PLAYBOOKS.find((p) => p.value === character.playbook);
  const playbookLabel = `${playbookOption?.label ?? character.playbook} Playbook`;
  const characterName = character.name?.trim();
  const displayName = characterName ? `${characterName} (${playbookLabel})` : playbookLabel;

  return (
    <Modal open onClose={onClose} aria-labelledby={headingId}>
      <Heading as="h2" size="sm" id={headingId}>Remove character?</Heading>
      <Text size="xs" color="muted">
        <strong>{displayName}</strong> will be permanently removed from this game. All character data will be lost and cannot be recovered.
      </Text>
      <div className={styles.modalActions}>
        <Button variant="ghost" size="md" onClick={onClose} disabled={removing}>Cancel</Button>
        <Button variant="primary" size="md" className={styles.removeBtn} onClick={handleConfirm} disabled={removing}>
          {removing ? 'Removing…' : 'Remove character'}
        </Button>
      </div>
    </Modal>
  );
};
