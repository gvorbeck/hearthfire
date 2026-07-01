import { useState, useCallback, useId, useMemo } from 'react';
import {
  Button,
  Dropdown,
  Heading,
  Modal,
  Text,
} from '@/components/ui';
import { useToast } from '@/components/app';
import { PLAYBOOKS, getPlaybook } from '@/lib/constants';
import { generateId } from '@/lib/id';
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
  const headingId = useId();
  const { addToast } = useToast();
  const [playbook, setPlaybook] = useState<PlaybookType | ''>('');
  // The parent mounts this modal only while open, so `adding` resets naturally on
  // each open — no reset effect needed.
  const [adding, setAdding] = useState(false);

  const handleClose = useCallback(() => {
    setPlaybook('');
    onClose();
  }, [onClose]);

  const handlePlaybookChange = useCallback((value: PlaybookType) => setPlaybook(value), []);

  const handleAdd = useCallback(async () => {
    if (!playbook) return;
    const selectedLabel = getPlaybook(playbook)?.label ?? playbook;
    const character = { id: generateId(), name: selectedLabel, playbook, level: 1, data: { statLevel: '1' } };
    setAdding(true);
    try {
      await onAdd(character);
      setAdding(false);
      handleClose();
    } catch {
      setAdding(false);
      addToast('Failed to add character. Please try again.', 'error');
    }
  }, [playbook, handleClose, onAdd, addToast]);

  const availablePlaybooks = useMemo(
    () => PLAYBOOKS.filter((p) => !existingPlaybooks.includes(p.value)),
    [existingPlaybooks]
  );
  const selectedPlaybook = useMemo(
    () => playbook ? getPlaybook(playbook) : undefined,
    [playbook]
  );

  return (
    <Modal
      open={open}
      onClose={handleClose}
      aria-labelledby={headingId}
    >
      <Heading as="h2" size="md" id={headingId}>
        Add Character
      </Heading>
      <Dropdown
        id="playbook-select"
        label="Playbook"
        options={availablePlaybooks}
        value={playbook}
        onChange={handlePlaybookChange}
        placeholder="Choose a playbook…"
        disabled={adding}
      />
      {selectedPlaybook && (
        <Text color="muted" className={styles.description}>
          {selectedPlaybook.description}
        </Text>
      )}
      <div className={styles.actions}>
        <Button type="button" variant="secondary" onClick={handleClose} size="md" disabled={adding}>
          Cancel
        </Button>
        <Button type="button" onClick={handleAdd} size="md" disabled={!playbook || adding}>
          {adding ? 'Adding…' : 'Add Character'}
        </Button>
      </div>
    </Modal>
  );
};
