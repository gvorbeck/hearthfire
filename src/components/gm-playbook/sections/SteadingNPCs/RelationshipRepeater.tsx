import { useCallback, useId, useMemo } from 'react';
import { Button, Input, Dropdown } from '@/components/ui';
import type { DropdownGroup } from '@/components/ui';
import type { NpcRelationship } from '@/types';
import { generateId } from '@/lib/id';
import { encodeTarget, decodeTarget, filterLinkedTargets } from './npcData';
import type { RelTarget } from './npcData';
import styles from './RelationshipRepeater.module.css';

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
      <Input
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

export const RelationshipRepeater = ({ relationships, groups, onChange }: RelationshipRepeaterProps) => {
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

  // Every target already linked by some row, keyed by id so each row can hide
  // the ones taken by OTHER rows and stop a character being linked twice.
  const takenByRow = useMemo(() => {
    const map = new Map<string, string>();
    for (const r of relationships) {
      const value = encodeTarget(r);
      if (value) map.set(r.id, value);
    }
    return map;
  }, [relationships]);
  const allTaken = useMemo(() => new Set(takenByRow.values()), [takenByRow]);
  // No point offering another row once every character is already linked — the
  // new row's dropdown would show nothing but the placeholder.
  const totalTargets = useMemo(
    () => groups.reduce((sum, g) => sum + g.options.length, 0),
    [groups],
  );
  // Also block adding while a row is still blank, so unlinked placeholder rows
  // can't pile up — fill the empty one first.
  const hasBlankRow = takenByRow.size < relationships.length;
  const canAdd = allTaken.size < totalTargets && !hasBlankRow;

  return (
    <div className={styles.relRepeater}>
      {relationships.map((rel, i) => {
        // Hide targets other rows already use; keep this row's own selection.
        const taken = new Set(allTaken);
        const own = takenByRow.get(rel.id);
        if (own) taken.delete(own);
        return (
          <RelationshipRow
            key={rel.id}
            rel={rel}
            groups={filterLinkedTargets(groups, taken)}
            position={i + 1}
            onTypeChange={handleTypeChange}
            onTargetChange={handleTargetChange}
            onRemove={handleRemove}
          />
        );
      })}
      <Button type="button" variant="ghost" size="sm" icon="plus" onClick={handleAdd} disabled={!canAdd} className={styles.relAddBtn}>
        Add relationship
      </Button>
    </div>
  );
};
