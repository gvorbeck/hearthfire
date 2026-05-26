import { useState, useCallback, useId, useRef } from 'react';
import { Heading, Text, Button, Modal, Input } from '@/components/primitives';
import type { SteadingData, SteadingNPC } from '@/types';
import styles from './SteadingNPCs.module.css';

const generateId = () => `npc-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

interface NpcFormState {
  name: string;
  pronouns: string;
  occupation: string;
  notes: string;
}

const EMPTY_FORM: NpcFormState = { name: '', pronouns: '', occupation: '', notes: '' };

interface NpcModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (form: NpcFormState) => void;
  initial?: NpcFormState;
  title: string;
}

const NpcModal = ({ open, onClose, onSave, initial = EMPTY_FORM, title }: NpcModalProps) => {
  const headingId = useId();
  const [form, setForm] = useState<NpcFormState>(initial);

  const makeFieldHandler = useCallback(
    (field: keyof NpcFormState): React.ChangeEventHandler<HTMLInputElement | HTMLTextAreaElement> =>
      (e) => setForm((f) => ({ ...f, [field]: e.target.value })),
    [],
  );

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
        <Input label="Name *" value={form.name} onChange={makeFieldHandler('name')} autoFocus required />
        <Input label="Pronouns" value={form.pronouns} onChange={makeFieldHandler('pronouns')} placeholder="e.g. she/her" />
        <Input label="Occupation" value={form.occupation} onChange={makeFieldHandler('occupation')} placeholder="e.g. farmer, smith, midwife" />
        <Input
          multiline
          label="Traits, relations, notes"
          value={form.notes}
          onChange={makeFieldHandler('notes')}
          rows={3}
          placeholder="Traits and relationships (e.g. cautious, Nolwen's sister)"
        />
        <div className={styles.formActions}>
          <Button variant="ghost" size="md" type="button" onClick={onClose}>Cancel</Button>
          <Button variant="primary" size="md" type="submit" disabled={!form.name.trim()}>Save NPC</Button>
        </div>
      </form>
    </Modal>
  );
};

interface NpcRowProps {
  npc: SteadingNPC;
  onEdit: (npc: SteadingNPC) => void;
  onRemove: (id: string) => void;
}

const NpcRow = ({ npc, onEdit, onRemove }: NpcRowProps) => {
  const handleEdit = useCallback(() => onEdit(npc), [onEdit, npc]);
  const handleRemove = useCallback(() => onRemove(npc.id), [onRemove, npc.id]);
  const label = [npc.name, npc.pronouns].filter(Boolean).join(' ');

  return (
    <div className={styles.npcRow} role="listitem">
      <div className={styles.npcInfo}>
        <span className={styles.npcName}>{label}</span>
        {npc.occupation && <span className={styles.npcOccupation}>{npc.occupation}</span>}
        {npc.notes && <span className={styles.npcNotes}>{npc.notes}</span>}
      </div>
      <div className={styles.npcActions}>
        <Button variant="ghost" size="sm" onClick={handleEdit} aria-label={`Edit ${npc.name}`}>Edit</Button>
        <Button variant="ghost" size="sm" icon="trash" onClick={handleRemove} aria-label={`Remove ${npc.name}`} />
      </div>
    </div>
  );
};

interface NpcSectionProps {
  title: string;
  description: string;
  npcs: SteadingNPC[];
  onUpdate: (npcs: SteadingNPC[]) => void;
}

const NpcSection = ({ title, description, npcs, onUpdate }: NpcSectionProps) => {
  const [addOpen, setAddOpen] = useState(false);
  const [editNpc, setEditNpc] = useState<SteadingNPC | null>(null);
  const editFormRef = useRef<NpcFormState>(EMPTY_FORM);

  const openAdd = useCallback(() => setAddOpen(true), []);
  const closeAdd = useCallback(() => setAddOpen(false), []);
  const closeEdit = useCallback(() => setEditNpc(null), []);

  const handleAdd = useCallback((form: NpcFormState) => {
    onUpdate([...npcs, { id: generateId(), ...form }]);
  }, [npcs, onUpdate]);

  const handleEdit = useCallback((npc: SteadingNPC) => {
    editFormRef.current = { name: npc.name, pronouns: npc.pronouns ?? '', occupation: npc.occupation ?? '', notes: npc.notes ?? '' };
    setEditNpc(npc);
  }, []);

  const handleSaveEdit = useCallback((form: NpcFormState) => {
    if (!editNpc) return;
    onUpdate(npcs.map((n) => n.id === editNpc.id ? { ...editNpc, ...form } : n));
  }, [npcs, onUpdate, editNpc]);

  const handleRemove = useCallback((id: string) => {
    onUpdate(npcs.filter((n) => n.id !== id));
  }, [npcs, onUpdate]);

  return (
    <div className={styles.section}>
      <div className={styles.addRow}>
        <Text size="sm" color="muted">{description}</Text>
        <Button variant="secondary" size="sm" onClick={openAdd}>Add NPC</Button>
      </div>

      {npcs.length > 0 && (
        <div className={styles.npcList} role="list" aria-label={`${title} list`}>
          {npcs.map((npc) => (
            <NpcRow key={npc.id} npc={npc} onEdit={handleEdit} onRemove={handleRemove} />
          ))}
        </div>
      )}

      <NpcModal key={addOpen ? 'add-open' : 'add-closed'} open={addOpen} onClose={closeAdd} onSave={handleAdd} title={`Add NPC — ${title}`} />
      <NpcModal
        key={editNpc?.id ?? 'edit'}
        open={editNpc !== null}
        onClose={closeEdit}
        onSave={handleSaveEdit}
        initial={editFormRef.current}
        title="Edit NPC"
      />
    </div>
  );
};

const NPC_CONFIG = {
  residents: {
    title: 'Residents of Stonetop',
    description: 'Add each NPC that is named during introductions or play. Give each an occupation (even if just farmer or homemaker) and at least 1 trait.',
  },
  neighbors: {
    title: 'Notable Neighbors',
    description: "Add NPCs from neighboring areas (Marshedge, Gordin's Delve, the Steplands, Lygos, etc.) when instructed by a playbook or as needed.",
  },
} as const;

interface SteadingNPCsProps {
  section: keyof typeof NPC_CONFIG;
  npcs: SteadingNPC[] | undefined;
  onSave: (patch: Partial<SteadingData>) => Promise<void>;
}

export const SteadingNPCs = ({ section, npcs = [], onSave }: SteadingNPCsProps) => {
  const { title, description } = NPC_CONFIG[section];
  const saveNpcs = useCallback((updated: SteadingNPC[]) => onSave({ [section]: updated }), [onSave, section]);

  return (
    <NpcSection
      title={title}
      description={description}
      npcs={npcs}
      onUpdate={saveNpcs}
    />
  );
};
