import { useState, useCallback, useId } from 'react';
import { Heading, Button, Modal, Input, Fieldset } from '@/components/ui';
import { TagInput } from '@/components/fields';
import type { DropdownGroup } from '@/components/ui';
import { randomNpcName } from '@/lib/npcNames';
import type { NpcRelationship } from '@/types';
import { NPC_TRAITS, EMPTY_FORM } from './npcData';
import type { NpcFormState, RelTarget } from './npcData';
import { RelationshipRepeater } from './RelationshipRepeater';
import styles from './NpcModal.module.css';

interface NpcModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (form: NpcFormState) => void;
  initial?: NpcFormState;
  title: string;
  relationshipGroups: DropdownGroup<RelTarget>[];
}

export const NpcModal = ({ open, onClose, onSave, initial = EMPTY_FORM, title, relationshipGroups }: NpcModalProps) => {
  const headingId = useId();
  const [form, setForm] = useState<NpcFormState>(initial);

  const handleNameChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((f) => ({ ...f, name: e.target.value }));
  }, []);

  const handlePronounsChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((f) => ({ ...f, pronouns: e.target.value }));
  }, []);

  const handleOccupationChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((f) => ({ ...f, occupation: e.target.value }));
  }, []);

  const handleNotesChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm((f) => ({ ...f, notes: e.target.value }));
  }, []);

  const handleTraitsChange = useCallback((traits: string[]) => {
    setForm((f) => ({ ...f, traits }));
  }, []);

  const handleRelationshipsChange = useCallback((relationships: NpcRelationship[]) => {
    setForm((f) => ({ ...f, relationships }));
  }, []);

  const handleRandomName = useCallback(() => {
    setForm((f) => ({ ...f, name: randomNpcName() }));
  }, []);

  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) return;
    onSave(form);
    onClose();
  }, [form, onSave, onClose]);

  if (!open) return null;

  return (
    <Modal open={open} onClose={onClose} aria-labelledby={headingId}>
      <Heading as="h2" size="sm" id={headingId}>{title}</Heading>
      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.nameRow}>
          <Input label="Name *" value={form.name} onChange={handleNameChange} autoFocus required />
          <Button variant="ghost" size="sm" type="button" icon="dice" onClick={handleRandomName} aria-label="Random name" className={styles.diceBtn} />
        </div>
        <Input label="Pronouns" value={form.pronouns} onChange={handlePronounsChange} placeholder="e.g. she/her" />
        <Input label="Occupation" value={form.occupation} onChange={handleOccupationChange} placeholder="e.g. farmer, smith, midwife" />
        <TagInput
          label="Traits"
          value={form.traits}
          onChange={handleTraitsChange}
          suggestions={NPC_TRAITS}
          placeholder="Type or pick a trait…"
        />
        <Fieldset legend="Relationships" className={styles.relFieldset}>
          <RelationshipRepeater
            relationships={form.relationships}
            groups={relationshipGroups}
            onChange={handleRelationshipsChange}
          />
        </Fieldset>
        <Input
          multiline
          label="Notes"
          value={form.notes}
          onChange={handleNotesChange}
          rows={3}
          placeholder="Other notes about this NPC"
        />
        <div className={styles.formActions}>
          <Button variant="ghost" size="md" type="button" onClick={onClose}>Cancel</Button>
          <Button variant="primary" size="md" type="submit" disabled={!form.name.trim()}>Save NPC</Button>
        </div>
      </form>
    </Modal>
  );
};
