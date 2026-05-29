import { useState, useCallback, useId } from 'react';
import { Heading, Text, Button, Modal, Input, TagInput } from '@/components/primitives';
import { randomNpcName } from '@/lib/npcNames';
import type { SteadingData, SteadingNPC } from '@/types';
import styles from './SteadingNPCs.module.css';

const generateId = () => `npc-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

const NPC_TRAITS = [
  'all thumbs', 'ambitious', 'beloved by everyone', 'beautiful singing voice', 'best cook',
  'best weaver', 'blind', 'braved the Ruined Tower', 'cautious', 'cheery', 'chronic cough',
  'complains too much', 'cowardly', 'craves recognition', 'curious',
  'dallied with the Fae years ago', 'deaf', 'desperately wants a child', 'distills the best whisky',
  "doesn't pull their weight", 'drunkard', 'eagle-eye', 'fearless', 'foundling',
  'gathers herbs from the Wood', 'gets the best deals', 'gifted storyteller', 'gods-fearing',
  'good with children', 'happy-go-lucky',
  'has a beef with Marshedge', 'has a good heart', 'has a lot of backbone', 'has a wandering eye',
  'has a way with animals', 'has Fae blood in their veins', 'has just terrible luck',
  'has lost their nerve', 'has no respect for their elders', 'has terrible nightmares',
  'has the most children', 'has their head in the clouds', 'hates the Hillfolk', 'hears voices',
  'humorless',
  'immaculate appearance', 'jealous', 'just got married', 'keeps to themselves',
  'knows all the gossip', 'lame', 'likes to hurt things', 'lived among the Forest Folk',
  'lost all their children', 'lovesick', 'loves their dogs', 'loyal friend',
  'most handsome', 'moved here recently', 'must approve any marriages',
  'mute', 'not afraid of deep water', 'not too bright', 'oldest', 'orphan',
  'overprotective', 'prettiest', 'prideful', 'reckless', 'refuses to marry',
  'resents their lot in life', 'runs everywhere', 'sensitive', 'simpleton',
  'slew many crinwin', 'stoic', 'stubborn', 'suffers from fits',
  'swears they met the Pale Hunter', 'tells the best jokes', 'tender-hearted',
  "tends the Gods' Pavilion", 'tends to the sick & injured', 'touched', 'very strong',
  'wants to have kids', 'well-read', 'well-traveled', 'widowed', 'will eat anything',
];

interface NpcFormState {
  name: string;
  pronouns: string;
  occupation: string;
  traits: string[];
  notes: string;
}

const EMPTY_FORM: NpcFormState = { name: '', pronouns: '', occupation: '', traits: [], notes: '' };

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

  const makeFieldHandler = (field: keyof NpcFormState): React.ChangeEventHandler<HTMLInputElement | HTMLTextAreaElement> =>
    (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  const handleTraitsChange = useCallback((traits: string[]) => {
    setForm((f) => ({ ...f, traits }));
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
          <Input label="Name *" value={form.name} onChange={makeFieldHandler('name')} autoFocus required />
          <Button variant="ghost" size="sm" type="button" icon="dice" onClick={handleRandomName} aria-label="Random name" className={styles.diceBtn} />
        </div>
        <Input label="Pronouns" value={form.pronouns} onChange={makeFieldHandler('pronouns')} placeholder="e.g. she/her" />
        <Input label="Occupation" value={form.occupation} onChange={makeFieldHandler('occupation')} placeholder="e.g. farmer, smith, midwife" />
        <TagInput
          label="Traits"
          value={form.traits}
          onChange={handleTraitsChange}
          suggestions={NPC_TRAITS}
          placeholder="Type or pick a trait…"
        />
        <Input
          multiline
          label="Relations & notes"
          value={form.notes}
          onChange={makeFieldHandler('notes')}
          rows={3}
          placeholder="Relationships and other notes (e.g. Nolwen's sister)"
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
  return (
    <div className={styles.npcRow} role="listitem">
      <div className={styles.npcInfo}>
        <span className={styles.npcName}>
          {npc.name}
          {npc.pronouns && <span className={styles.npcPronouns}>{npc.pronouns}</span>}
        </span>
        {npc.occupation && <span className={styles.npcOccupation}>{npc.occupation}</span>}
        {npc.traits && npc.traits.length > 0 && (
          <div className={styles.npcTraits}>
            {npc.traits.map((t) => (
              <span key={t} className={styles.npcTrait}>{t}</span>
            ))}
          </div>
        )}
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

  const openAdd = useCallback(() => setAddOpen(true), []);
  const closeAdd = useCallback(() => setAddOpen(false), []);
  const closeEdit = useCallback(() => setEditNpc(null), []);

  const handleAdd = useCallback((form: NpcFormState) => {
    onUpdate([...npcs, { id: generateId(), ...form }]);
  }, [npcs, onUpdate]);

  const handleEdit = useCallback((npc: SteadingNPC) => {
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
        <Text size="xs" color="muted">{description}</Text>
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
        initial={editNpc ? { name: editNpc.name, pronouns: editNpc.pronouns ?? '', occupation: editNpc.occupation ?? '', traits: editNpc.traits ?? [], notes: editNpc.notes ?? '' } : undefined}
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
