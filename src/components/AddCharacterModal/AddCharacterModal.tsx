import { Modal } from '@/components/primitives/Modal/Modal';
import { Button, Heading } from '@/components/primitives';

interface AddCharacterModalProps {
  open: boolean;
  onClose: () => void;
}

export const AddCharacterModal = ({ open, onClose }: AddCharacterModalProps) => (
  <Modal open={open} onClose={onClose} aria-labelledby="add-character-modal-title">
    <Heading as="h2" size="md" id="add-character-modal-title">Add Character</Heading>
    <Button type="button" variant="secondary" onClick={onClose} size="md">Cancel</Button>
  </Modal>
);
