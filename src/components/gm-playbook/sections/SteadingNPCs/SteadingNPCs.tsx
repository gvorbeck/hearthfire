import { useState, useCallback, useMemo } from 'react';
import { Text, Button } from '@/components/ui';
import type { DropdownGroup } from '@/components/ui';
import { useOptimisticSteadingField } from '@/hooks/useOptimisticSteadingField';
import type { SteadingData, SteadingNPC, NpcRelationship, GameSession } from '@/types';
import { generateId, NPC_CONFIG, buildGroups, buildNameMap } from './npcData';
import type { NpcFormState, RelTarget } from './npcData';
import { NpcModal } from './NpcModal';
import { NpcRow } from './NpcRow';
import styles from './SteadingNPCs.module.css';

const excludeFromGroups = (groups: DropdownGroup<RelTarget>[], excludeId: string): DropdownGroup<RelTarget>[] =>
  groups
    .map((g) => ({ ...g, options: g.options.filter((o) => !o.value.endsWith(`::${excludeId}`) ) }))
    .filter((g) => g.options.length > 0);

interface NpcSectionProps {
  title: string;
  description: string;
  npcs: SteadingNPC[];
  onUpdate: (transform: (current: SteadingNPC[]) => SteadingNPC[]) => void;
  onToggleDead: (id: string) => void;
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

const NpcSection = ({ title, description, npcs, onUpdate, onToggleDead, relationshipGroups, resolveTarget }: NpcSectionProps) => {
  const [addOpen, setAddOpen] = useState(false);
  const [editNpc, setEditNpc] = useState<SteadingNPC | null>(null);

  const openAdd = useCallback(() => setAddOpen(true), []);
  const closeAdd = useCallback(() => setAddOpen(false), []);
  const closeEdit = useCallback(() => setEditNpc(null), []);

  const handleAdd = useCallback((form: NpcFormState) => {
    const npc = { id: generateId(), ...form };
    onUpdate((current) => [...current, npc]);
  }, [onUpdate]);

  const handleEdit = useCallback((npc: SteadingNPC) => {
    setEditNpc(npc);
  }, []);

  const handleSaveEdit = useCallback((form: NpcFormState) => {
    if (!editNpc) return;
    onUpdate((current) => current.map((n) => n.id === editNpc.id ? { ...editNpc, ...form } : n));
  }, [onUpdate, editNpc]);

  const handleRemove = useCallback((id: string) => {
    onUpdate((current) => current.filter((n) => n.id !== id));
  }, [onUpdate]);

  return (
    <div className={styles.section}>
      <div className={styles.addRow}>
        <Text size="xs" color="muted">{description}</Text>
        <Button variant="secondary" size="sm" onClick={openAdd}>Add NPC</Button>
      </div>

      {npcs.length > 0 && (
        <div className={styles.npcList} role="list" aria-label={`${title} list`}>
          {npcs.map((npc) => (
            <NpcRow key={npc.id} npc={npc} onEdit={handleEdit} onRemove={handleRemove} onToggleDead={onToggleDead} resolveTarget={resolveTarget} />
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

interface SteadingNPCsProps {
  section: keyof typeof NPC_CONFIG;
  npcs: SteadingNPC[] | undefined;
  onSave: (patch: Partial<SteadingData>) => Promise<void>;
  game: GameSession;
  filterTargetId?: string;
}

export const SteadingNPCs = ({ section, npcs = [], onSave, game, filterTargetId }: SteadingNPCsProps) => {
  const { title, description } = NPC_CONFIG[section];
  const { value: localNpcs, save: saveNpcs } = useOptimisticSteadingField(
    npcs,
    (next: SteadingNPC[]) => onSave({ [section]: next }),
  );

  const handleToggleDead = useCallback((id: string) => {
    saveNpcs((current) => current.map((n) => n.id === id ? { ...n, dead: !n.dead } : n));
  }, [saveNpcs]);
  const visibleNpcs = useMemo(() => {
    const list = filterTargetId
      ? localNpcs.filter((n) => (n.relationships ?? []).some((r) => r.targetId === filterTargetId))
      : localNpcs;
    return [...list].sort((a, b) => a.name.localeCompare(b.name));
  }, [localNpcs, filterTargetId]);
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
      onUpdate={saveNpcs}
      onToggleDead={handleToggleDead}
      relationshipGroups={groups}
      resolveTarget={resolveTarget}
    />
  );
};
