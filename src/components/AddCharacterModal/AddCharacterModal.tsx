import { useState } from "react";
import {
  Button,
  Dropdown,
  Heading,
  Modal,
  Text,
} from "@/components/primitives";
import { PLAYBOOKS } from "@/lib/constants";
import type { Character, PlaybookType } from "@/types";
import styles from "./AddCharacterModal.module.css";

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
  const [playbook, setPlaybook] = useState<PlaybookType | "">("");

  const handleClose = () => {
    setPlaybook("");
    onClose();
  };

  const handleAdd = () => {
    if (!playbook) return;
    const character = { id: crypto.randomUUID(), name: "", playbook, level: 1 };
    handleClose();
    onAdd(character);
  };

  const availablePlaybooks = PLAYBOOKS.filter((p) => !existingPlaybooks.includes(p.value));
  const selectedPlaybook = PLAYBOOKS.find((p) => p.value === playbook);

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
        onChange={setPlaybook}
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
