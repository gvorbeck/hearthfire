import { useState, useCallback, useId, useMemo } from 'react';
import { Heading, Text, Button, Modal, Input, TagInput, Dropdown } from '@/components/primitives';
import type { DropdownGroup } from '@/components/primitives';
import { randomNpcName } from '@/lib/npcNames';
import { PLAYBOOKS } from '@/lib/constants';
import type { SteadingData, SteadingNPC, NpcRelationship, GameSession } from '@/types';
import styles from './SteadingNPCs.module.css';

const generateId = () => crypto.randomUUID();

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

type RelTarget = `${'pc' | 'resident' | 'neighbor'}::${string}`;

const encodeTarget = (rel: NpcRelationship): RelTarget | '' =>
  rel.targetId ? `${rel.targetKind}::${rel.targetId}` as RelTarget : '';

const decodeTarget = (value: RelTarget): { targetId: string; targetKind: 'pc' | 'resident' | 'neighbor' } => {
  const sep = value.indexOf('::');
  return {
    targetKind: value.slice(0, sep) as 'pc' | 'resident' | 'neighbor',
    targetId: value.slice(sep + 2),
  };
};

const excludeFromGroups = (groups: DropdownGroup<RelTarget>[], excludeId: string): DropdownGroup<RelTarget>[] =>
  groups
    .map((g) => ({ ...g, options: g.options.filter((o) => !o.value.endsWith(`::${excludeId}`) ) }))
    .filter((g) => g.options.length > 0);

interface RelationshipRowProps {
  rel: NpcRelationship;
  groups: DropdownGroup<RelTarget>[];
  position: number;
  onTypeChange: (id: string, type: string) => void;
  onTargetChange: (id: string, targetId: string, targetKind: 'pc' | 'resident' | 'neighbor') => void;
  onRemove: (id: string) => void;
}

const RelationshipRow = ({ rel, groups, position, onTypeChange, onTargetChange, onRemove }: RelationshipRowProps) => {
  const dropdownId = useId();

  const handleType = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => onTypeChange(rel.id, e.target.value),
    [rel.id, onTypeChange],
  );

  const handleTarget = useCallback(
    (value: RelTarget) => {
      const { targetId, targetKind } = decodeTarget(value);
      onTargetChange(rel.id, targetId, targetKind);
    },
    [rel.id, onTargetChange],
  );

  const handleRemove = useCallback(() => onRemove(rel.id), [rel.id, onRemove]);

  return (
    <div className={styles.relRow}>
      <input
        type="text"
        className={styles.relTypeInput}
        value={rel.type}
        placeholder='e.g. "mother", "rival"'
        aria-label={`Relationship ${position} type`}
        onChange={handleType}
      />
      <Dropdown
        id={dropdownId}
        groups={groups}
        value={encodeTarget(rel)}
        onChange={handleTarget}
        placeholder="Link to character…"
        className={styles.relDropdown}
        aria-label={`Relationship ${position} linked character`}
      />
      <Button
        type="button"
        variant="ghost"
        size="sm"
        icon="close"
        onClick={handleRemove}
        aria-label={`Remove relationship ${position}`}
        className={styles.relRemoveBtn}
      />
    </div>
  );
};

interface RelationshipRepeaterProps {
  relationships: NpcRelationship[];
  groups: DropdownGroup<RelTarget>[];
  onChange: (relationships: NpcRelationship[]) => void;
}

const RelationshipRepeater = ({ relationships, groups, onChange }: RelationshipRepeaterProps) => {
  const handleTypeChange = useCallback((id: string, type: string) => {
    onChange(relationships.map((r) => r.id === id ? { ...r, type } : r));
  }, [relationships, onChange]);

  const handleTargetChange = useCallback(
    (id: string, targetId: string, targetKind: 'pc' | 'resident' | 'neighbor') => {
      onChange(relationships.map((r) => r.id === id ? { ...r, targetId, targetKind } : r));
    },
    [relationships, onChange],
  );

  const handleRemove = useCallback((id: string) => {
    onChange(relationships.filter((r) => r.id !== id));
  }, [relationships, onChange]);

  const handleAdd = useCallback(() => {
    onChange([...relationships, { id: generateId(), type: '', targetId: '', targetKind: 'pc' }]);
  }, [relationships, onChange]);

  return (
    <div className={styles.relRepeater}>
      {relationships.map((rel, i) => (
        <RelationshipRow
          key={rel.id}
          rel={rel}
          groups={groups}
          position={i + 1}
          onTypeChange={handleTypeChange}
          onTargetChange={handleTargetChange}
          onRemove={handleRemove}
        />
      ))}
      <Button type="button" variant="ghost" size="sm" icon="plus" onClick={handleAdd} className={styles.relAddBtn}>
        Add relationship
      </Button>
    </div>
  );
};


interface NpcFormState {
  name: string;
  pronouns: string;
  occupation: string;
  traits: string[];
  relationships: NpcRelationship[];
  notes: string;
}

const EMPTY_FORM: NpcFormState = {
  name: '',
  pronouns: '',
  occupation: '',
  traits: [],
  relationships: [],
  notes: '',
};

interface NpcModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (form: NpcFormState) => void;
  initial?: NpcFormState;
  title: string;
  relationshipGroups: DropdownGroup<RelTarget>[];
}

const NpcModal = ({ open, onClose, onSave, initial = EMPTY_FORM, title, relationshipGroups }: NpcModalProps) => {
  const headingId = useId();
  const [form, setForm] = useState<NpcFormState>(initial);

  const makeFieldHandler = (field: keyof NpcFormState): React.ChangeEventHandler<HTMLInputElement | HTMLTextAreaElement> =>
    (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

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
        <fieldset className={styles.relFieldset}>
          <legend className={styles.relLabel}>Relationships</legend>
          <RelationshipRepeater
            relationships={form.relationships}
            groups={relationshipGroups}
            onChange={handleRelationshipsChange}
          />
        </fieldset>
        <Input
          multiline
          label="Notes"
          value={form.notes}
          onChange={makeFieldHandler('notes')}
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


interface NpcRowProps {
  npc: SteadingNPC;
  onEdit: (npc: SteadingNPC) => void;
  onRemove: (id: string) => void;
  resolveTarget: (rel: NpcRelationship) => string;
}

const NpcRow = ({ npc, onEdit, onRemove, resolveTarget }: NpcRowProps) => {
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
        {npc.relationships && npc.relationships.length > 0 && (
          <div className={styles.npcRelTraits}>
            {npc.relationships.map((rel) => {
              const label = [rel.type, rel.targetId ? resolveTarget(rel) : ''].filter(Boolean).join(': ');
              return label ? <span key={rel.id} className={styles.npcRelTrait}>{label}</span> : null;
            })}
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
  allNpcs: SteadingNPC[];
  onUpdate: (npcs: SteadingNPC[]) => void;
  relationshipGroups: DropdownGroup<RelTarget>[];
  resolveTarget: (rel: NpcRelationship) => string;
}

const npcToForm = (npc: SteadingNPC): NpcFormState => ({
  name: npc.name,
  pronouns: npc.pronouns ?? '',
  occupation: npc.occupation ?? '',
  traits: npc.traits ?? [],
  relationships: npc.relationships ?? [],
  notes: npc.notes ?? '',
});

const NpcSection = ({ title, description, npcs, allNpcs, onUpdate, relationshipGroups, resolveTarget }: NpcSectionProps) => {
  const [addOpen, setAddOpen] = useState(false);
  const [editNpc, setEditNpc] = useState<SteadingNPC | null>(null);

  const openAdd = useCallback(() => setAddOpen(true), []);
  const closeAdd = useCallback(() => setAddOpen(false), []);
  const closeEdit = useCallback(() => setEditNpc(null), []);

  const handleAdd = useCallback((form: NpcFormState) => {
    onUpdate([...allNpcs, { id: generateId(), ...form }]);
  }, [allNpcs, onUpdate]);

  const handleEdit = useCallback((npc: SteadingNPC) => {
    setEditNpc(npc);
  }, []);

  const handleSaveEdit = useCallback((form: NpcFormState) => {
    if (!editNpc) return;
    onUpdate(allNpcs.map((n) => n.id === editNpc.id ? { ...editNpc, ...form } : n));
  }, [allNpcs, onUpdate, editNpc]);

  const handleRemove = useCallback((id: string) => {
    onUpdate(allNpcs.filter((n) => n.id !== id));
  }, [allNpcs, onUpdate]);

  return (
    <div className={styles.section}>
      <div className={styles.addRow}>
        <Text size="xs" color="muted">{description}</Text>
        <Button variant="secondary" size="sm" onClick={openAdd}>Add NPC</Button>
      </div>

      {npcs.length > 0 && (
        <div className={styles.npcList} role="list" aria-label={`${title} list`}>
          {npcs.map((npc) => (
            <NpcRow key={npc.id} npc={npc} onEdit={handleEdit} onRemove={handleRemove} resolveTarget={resolveTarget} />
          ))}
        </div>
      )}

      <NpcModal
        key={addOpen ? 'add-open' : 'add-closed'}
        open={addOpen}
        onClose={closeAdd}
        onSave={handleAdd}
        title={`Add NPC — ${title}`}
        relationshipGroups={relationshipGroups}
      />
      <NpcModal
        key={editNpc?.id ?? 'edit'}
        open={editNpc !== null}
        onClose={closeEdit}
        onSave={handleSaveEdit}
        initial={editNpc ? npcToForm(editNpc) : undefined}
        title="Edit NPC"
        relationshipGroups={editNpc ? excludeFromGroups(relationshipGroups, editNpc.id) : relationshipGroups}
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
  game: GameSession;
  filterTargetId?: string;
}

const buildGroups = (game: GameSession): DropdownGroup<RelTarget>[] => {
  const pcs = game.characters.map((c) => ({
    value: `pc::${c.id}` as RelTarget,
    label: `${c.name} (${PLAYBOOKS.find((p) => p.value === c.playbook)?.label ?? c.playbook})`,
  }));
  const residents = (game.steading?.residents ?? []).map((r) => ({
    value: `resident::${r.id}` as RelTarget,
    label: r.name,
  }));
  const neighbors = (game.steading?.neighbors ?? []).map((n) => ({
    value: `neighbor::${n.id}` as RelTarget,
    label: n.name,
  }));

  const groups: DropdownGroup<RelTarget>[] = [];
  if (pcs.length > 0) groups.push({ label: 'Player Characters', options: pcs });
  if (residents.length > 0) groups.push({ label: 'Stonetop Residents', options: residents });
  if (neighbors.length > 0) groups.push({ label: 'Notable Neighbors', options: neighbors });
  return groups;
};

const buildNameMap = (game: GameSession): Map<string, string> => {
  const map = new Map<string, string>();
  for (const c of game.characters) map.set(c.id, c.name);
  for (const r of game.steading?.residents ?? []) map.set(r.id, r.name);
  for (const n of game.steading?.neighbors ?? []) map.set(n.id, n.name);
  return map;
};

export const SteadingNPCs = ({ section, npcs = [], onSave, game, filterTargetId }: SteadingNPCsProps) => {
  const { title, description } = NPC_CONFIG[section];
  const saveNpcs = useCallback((updated: SteadingNPC[]) => onSave({ [section]: updated }), [onSave, section]);
  const visibleNpcs = useMemo(
    () => filterTargetId
      ? npcs.filter((n) => (n.relationships ?? []).some((r) => r.targetId === filterTargetId))
      : npcs,
    [npcs, filterTargetId],
  );
  const groups = useMemo(
    () => buildGroups(game),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [game.characters, game.steading?.residents, game.steading?.neighbors],
  );
  const nameMap = useMemo(
    () => buildNameMap(game),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [game.characters, game.steading?.residents, game.steading?.neighbors],
  );
  const resolveTarget = useCallback(
    (rel: NpcRelationship) => nameMap.get(rel.targetId) ?? rel.targetId,
    [nameMap],
  );

  return (
    <NpcSection
      title={title}
      description={description}
      npcs={visibleNpcs}
      allNpcs={npcs}
      onUpdate={saveNpcs}
      relationshipGroups={groups}
      resolveTarget={resolveTarget}
    />
  );
};
