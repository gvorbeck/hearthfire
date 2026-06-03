import { useState, useCallback, useMemo } from 'react';
import {
  Button,
  Dropdown,
  Heading,
  Modal,
  Text,
} from '@/components/ui';
import { useToast } from '@/components/app';
import { PLAYBOOKS } from '@/lib/constants';
import type { Character, PlaybookType } from '@/types';
import styles from './AddCharacterModal.module.css';

interface AddCharacterModalProps {
  open: boolean;
  onClose: () => void;
  existingPlaybooks: PlaybookType[];
  onAdd: (character: Character) => Promise<void>;
}

export const AddCharacterModal = ({
  open,
  onClose,
  existingPlaybooks,
  onAdd,
}: AddCharacterModalProps) => {
  const { addToast } = useToast();
  const [playbook, setPlaybook] = useState<PlaybookType | ''>('');

  const handleClose = useCallback(() => {
    setPlaybook('');
    onClose();
  }, [onClose]);

  const handlePlaybookChange = useCallback((value: PlaybookType) => setPlaybook(value), []);

  const handleAdd = useCallback(() => {
    if (!playbook) return;
    const selectedLabel = PLAYBOOKS.find((p) => p.value === playbook)?.label ?? playbook;
    const character = { id: crypto.randomUUID(), name: selectedLabel, playbook, level: 1, data: { statLevel: '1' } };
    handleClose();
    onAdd(character).catch(() => addToast('Failed to add character. Please try again.', 'error'));
  }, [playbook, handleClose, onAdd, addToast]);

  const availablePlaybooks = useMemo(
    () => PLAYBOOKS.filter((p) => !existingPlaybooks.includes(p.value)),
    [existingPlaybooks]
  );
  const selectedPlaybook = useMemo(
    () => PLAYBOOKS.find((p) => p.value === playbook),
    [playbook]
  );

  return (
    <Modal
      open={open}
      onClose={handleClose}
      aria-labelledby="add-character-modal-title"
    >
      <Heading as="h2" size="md" id="add-character-modal-title">
        Add Character
      </Heading>
      <Dropdown
        id="playbook-select"
        label="Playbook"
        options={availablePlaybooks}
        value={playbook}
        onChange={handlePlaybookChange}
        placeholder="Choose a playbook…"
      />
      {selectedPlaybook && (
        <Text size="sm" color="muted" className={styles.description}>
          {selectedPlaybook.description}
        </Text>
      )}
      <div className={styles.actions}>
        <Button type="button" variant="secondary" onClick={handleClose} size="md">
          Cancel
        </Button>
        {playbook && (
          <Button type="button" onClick={handleAdd} size="md">
            Add Character
          </Button>
        )}
      </div>
    </Modal>
  );
};
