import { useState, useId, useCallback, useEffect } from 'react';
import { Button, Heading, Modal, Text } from '@/components/ui';
import { useToast } from '@/components/app';
import { getPlaybook } from '@/lib/constants';
import type { Character } from '@/types';
import styles from './RemoveCharacterModal.module.css';

interface RemoveCharacterModalProps {
  open: boolean;
  character: Character | null;
  onClose: () => void;
  onConfirm: () => Promise<void>;
}

export const RemoveCharacterModal = ({ open, character, onClose, onConfirm }: RemoveCharacterModalProps) => {
  const headingId = useId();
  const { addToast } = useToast();
  const [removing, setRemoving] = useState(false);

  useEffect(() => {
    if (!open) setRemoving(false);
  }, [open]);

  const handleConfirm = useCallback(async () => {
    setRemoving(true);
    try {
      await onConfirm();
      setRemoving(false);
      onClose();
    } catch {
      setRemoving(false);
      addToast('Failed to remove character. Please try again.', 'error');
    }
  }, [onConfirm, onClose, addToast]);

  const playbookOption = character ? getPlaybook(character.playbook) : null;
  const playbookLabel = character ? `${playbookOption?.label ?? character.playbook} Playbook` : '';
  const characterName = character?.name?.trim();
  const displayName = characterName ? `${characterName} (${playbookLabel})` : playbookLabel;

  return (
    <Modal open={open} onClose={onClose} aria-labelledby={headingId}>
      <Heading as="h2" size="sm" id={headingId}>Remove character?</Heading>
      {character && (
        <Text size="xs" color="muted">{`**${displayName}** will be permanently removed from this game. All character data will be lost and cannot be recovered.`}</Text>
      )}
      <div className={styles.actions}>
        <Button variant="ghost" size="md" onClick={onClose} disabled={removing}>Cancel</Button>
        <Button variant="primary" size="md" className={styles.removeBtn} onClick={handleConfirm} disabled={removing}>
          {removing ? 'Removing…' : 'Remove character'}
        </Button>
      </div>
    </Modal>
  );
};
