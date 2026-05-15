import { useState } from "react";
import {
  Button,
  Dropdown,
  Heading,
  Modal,
  Text,
} from "@/components/primitives";
import { PLAYBOOKS } from "@/lib/constants";
import type { PlaybookType } from "@/types";
import styles from "./AddCharacterModal.module.css";

interface AddCharacterModalProps {
  open: boolean;
  onClose: () => void;
}

export const AddCharacterModal = ({
  open,
  onClose,
}: AddCharacterModalProps) => {
  const [playbook, setPlaybook] = useState<PlaybookType | "">("");

  const handleClose = () => {
    setPlaybook("");
    onClose();
  };

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
        options={PLAYBOOKS}
        value={playbook}
        onChange={setPlaybook}
        placeholder="Choose a playbook…"
      />
      {selectedPlaybook && (
        <Text size="sm" color="muted" className={styles.description}>
          {selectedPlaybook.description}
        </Text>
      )}
      <Button type="button" variant="secondary" onClick={handleClose} size="md">
        Cancel
      </Button>
    </Modal>
  );
};
