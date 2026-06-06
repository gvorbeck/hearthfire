import { useCallback, useMemo, useState } from 'react';
import { useLatest } from '@/hooks/useLatest';
import { useCharacterField } from '@/hooks/useCharacterField';
import { PlaybookSection } from '../PlaybookSection';
import { Collapse, Text, Toggle } from '@/components/ui';
import { parseInlineMarkdown } from '@/lib/parseMarkdown';
import { Move } from '../Move';
import type { MoveDefinition } from '@/types';
import { BASIC_MOVES } from '@/lib/basicMoves';
import { SPECIAL_MOVES } from '@/lib/specialMoves';
import { FOLLOWER_MOVES } from '@/lib/followerMoves';
import { EXPEDITION_MOVES } from '@/lib/expeditionMoves';
import { HOMEFRONT_MOVES } from '@/lib/homefrontMoves';
import { CUSTOM_MOVES } from '@/lib/customMoves';
import { PLAYBOOK_MOVES, BACKGROUND_FORCED_MOVES, BACKGROUND_FORCED_CHECKLIST } from '@/lib/moves';
import { PLAYBOOKS } from '@/lib/constants';
import type { CharacterData, PlaybookType } from '@/types';
import styles from './Moves.module.css';

const getLockReason = (
  move: MoveDefinition,
  typeMoves: MoveDefinition[],
  level: number,
  selected: Record<string, boolean>,
): string | undefined => {
  if (level <= 1 && move.excludes !== undefined) {
    for (const exId of move.excludes) {
      const exMove = typeMoves.find((m) => m.id === exId);
      if (exMove && selected[exId]) {
        return `Conflicts with ${exMove.name}`;
      }
    }
  }
  const parts: string[] = [];
  if (move.requiresLevel !== undefined && level < move.requiresLevel) {
    parts.push(`Level ${move.requiresLevel}+`);
  }
  if (move.requires !== undefined) {
    for (const reqId of move.requires) {
      const reqMove = typeMoves.find((m) => m.id === reqId);
      if (reqMove && !(reqMove.startingMove || selected[reqId])) {
        parts.push(reqMove.name);
      }
    }
  }
  if (parts.length === 0) return undefined;
  return `Requires ${parts.join(' and ')}`;
};


interface MoveSectionProps {
  label: string;
  helperText: string;
  moves: MoveDefinition[];
  emptyText: string;
}

const STATIC_SECTIONS: MoveSectionProps[] = [
  { label: 'Basic Moves', helperText: 'These are the most commonly triggered moves, the ones that can come up in many different contexts.', moves: BASIC_MOVES, emptyText: 'No basic moves yet.' },
  { label: 'Special Moves', helperText: 'These moves are always in play, but they either affect other moves or are triggered by very specific circumstances.', moves: SPECIAL_MOVES, emptyText: 'No special moves yet.' },
  { label: 'Follower Moves', helperText: 'These moves apply when you interact with your **followers** (page 64).', moves: FOLLOWER_MOVES, emptyText: 'No follower moves yet.' },
  { label: 'Expedition Moves', helperText: 'These moves apply when you prepare for, undertake, or return from an expedition.', moves: EXPEDITION_MOVES, emptyText: 'No expedition moves yet.' },
  { label: 'Homefront Moves', helperText: "These moves apply during downtime, or when you're interacting with a steading's population and resources.", moves: HOMEFRONT_MOVES, emptyText: 'No homefront moves yet.' },
  { label: 'Custom Moves', helperText: 'These moves apply only to specific game or setting elements, and only if you choose to use them. Consult your GM.', moves: CUSTOM_MOVES, emptyText: 'No custom moves yet.' },
];

const MoveSection = ({ label, helperText, moves, emptyText }: MoveSectionProps) => (
  <Collapse label={label}>
    <Text color="muted" className={styles.helperText}>{parseInlineMarkdown(helperText)}</Text>
    {moves.length > 0 ? (
      <div className={styles.moveGrid}>
        {moves.map((move) => (
          <Move key={move.id} move={move} />
        ))}
      </div>
    ) : (
      <Text color="muted">{emptyText}</Text>
    )}
  </Collapse>
);

interface MovesProps {
  playbook: PlaybookType;
  data: CharacterData | undefined;
  onSave: (data: Partial<CharacterData>) => Promise<void>;
  level: number;
}

export const Moves = ({ playbook, data, onSave, level }: MovesProps) => {
  const typeMoves = useMemo(() => PLAYBOOK_MOVES[playbook] ?? [], [playbook]);
  const forcedMoveIds = useMemo(
    () => new Set(data?.background ? (BACKGROUND_FORCED_MOVES[playbook]?.[data.background] ?? []) : []),
    [playbook, data?.background]
  );
  const forcedCheckList = useMemo(
    () => data?.background ? (BACKGROUND_FORCED_CHECKLIST[playbook]?.[data.background] ?? {}) : {},
    [playbook, data?.background]
  );

  const { value: selected, ref: selectedRef, save: saveSelected } = useCharacterField('typeMoves', data?.typeMoves ?? {}, onSave, 'Failed to save move selection.');
  const { value: uses, ref: usesRef, save: saveUses } = useCharacterField('typeMoveUses', data?.typeMoveUses ?? {}, onSave, 'Failed to save move uses.');
  // uses2 matches the Firestore field name (typeMoveUses2); the Move prop is usesAlt.
  const { value: uses2, ref: uses2Ref, save: saveUses2 } = useCharacterField('typeMoveUses2', data?.typeMoveUses2 ?? {}, onSave, 'Failed to save move uses.');
  const { value: takes, ref: takesRef, save: saveTakes } = useCharacterField('typeMoveTakes', data?.typeMoveTakes ?? {}, onSave, 'Failed to save move takes.');
  // Only used for non-leveled checklists; leveled moves use checkListLevels as their sole store.
  const { value: checkLists, ref: checkListsRef, save: saveCheckLists } = useCharacterField('typeMoveCheckList', data?.typeMoveCheckList ?? {}, onSave, 'Failed to save checklist.');
  const { value: checkListLevels, ref: checkListLevelsRef, save: saveCheckListLevels } = useCharacterField('typeMoveCheckListLevels', data?.typeMoveCheckListLevels ?? {}, onSave, 'Failed to save checklist.');

  const [isHideUnselected, setIsHideUnselected] = useState(false);
  const handleHideUnselected = useCallback((e: React.ChangeEvent<HTMLInputElement>) => setIsHideUnselected(e.target.checked), []);

  const forcedMoveIdsRef = useLatest(forcedMoveIds);
  const typeMovesRef = useLatest(typeMoves);
  const levelRef = useLatest(level);

  const handleSelect = useCallback((id: string, value: boolean) => {
    if (forcedMoveIdsRef.current.has(id)) return;
    const move = typeMovesRef.current.find((m) => m.id === id);
    if (!move) return;
    const lockReason = getLockReason(move, typeMovesRef.current, levelRef.current, selectedRef.current);
    if (lockReason) return;
    saveSelected({ ...selectedRef.current, [id]: value });
  }, [saveSelected]);

  const handleUses = useCallback((id: string, count: number) => {
    saveUses({ ...usesRef.current, [id]: count });
  }, [saveUses]);

  const handleUses2 = useCallback((id: string, count: number) => {
    saveUses2({ ...uses2Ref.current, [id]: count });
  }, [saveUses2]);

  const handleTakes = useCallback((id: string, count: number) => {
    saveTakes({ ...takesRef.current, [id]: count });
  }, [saveTakes]);

  const handleCheckList = useCallback((id: string, itemId: string, checked: boolean) => {
    const prev = checkListsRef.current;
    saveCheckLists({ ...prev, [id]: { ...prev[id], [itemId]: checked } });
  }, [saveCheckLists]);

  const handleCheckListLevel = useCallback((id: string, itemId: string, lvl: number | null) => {
    const prev = checkListLevelsRef.current;
    const prevItem = prev[id] ?? {};
    const { [itemId]: _removed, ...rest } = prevItem;
    const nextItem = lvl !== null ? { ...prevItem, [itemId]: lvl } : rest;
    saveCheckListLevels({ ...prev, [id]: nextItem });
  }, [saveCheckListLevels]);

  const playbookEntry = PLAYBOOKS.find((p) => p.value === playbook);
  const playbookLabel = playbookEntry?.label ?? playbook;
  const playbookHelperText = playbookEntry?.helperText;

  // Stable per-move bound functions — only rebuilt when the move list changes (i.e. playbook switch).
  // Handlers have [] deps via refs, so this memo never invalidates due to state changes.
  const boundHandlers = useMemo(() => {
    const select: Record<string, (val: boolean) => void> = {};
    const usesMap: Record<string, (n: number) => void> = {};
    const uses2Map: Record<string, (n: number) => void> = {};
    const takesMap: Record<string, (n: number) => void> = {};
    const checkListMap: Record<string, (itemId: string, checked: boolean) => void> = {};
    const checkListLevelMap: Record<string, (itemId: string, lvl: number | null) => void> = {};
    for (const m of typeMoves) {
      select[m.id] = (val) => handleSelect(m.id, val);
      usesMap[m.id] = (n) => handleUses(m.id, n);
      uses2Map[m.id] = (n) => handleUses2(m.id, n);
      takesMap[m.id] = (n) => handleTakes(m.id, n);
      checkListMap[m.id] = (itemId, checked) => handleCheckList(m.id, itemId, checked);
      checkListLevelMap[m.id] = (itemId, lvl) => handleCheckListLevel(m.id, itemId, lvl);
    }
    return { select, usesMap, uses2Map, takesMap, checkListMap, checkListLevelMap };
  }, [typeMoves, handleSelect, handleUses, handleUses2, handleTakes, handleCheckList, handleCheckListLevel]);

  const sortedTypeMoves = useMemo(() => {
    const withMeta = typeMoves.map((move) => {
      const isStarting = move.startingMove === true;
      const isForced = forcedMoveIds.has(move.id);
      const isDisabled = isStarting || isForced;
      const isSelected = isDisabled || (selected[move.id] ?? false);
      return { move, isDisabled, isSelected, isForced };
    });
    return [
      ...withMeta.filter((m) => m.isSelected).sort((a, b) => a.move.name.localeCompare(b.move.name)),
      ...withMeta.filter((m) => !m.isSelected).sort((a, b) => a.move.name.localeCompare(b.move.name)),
    ];
  }, [typeMoves, forcedMoveIds, selected]);

  const visibleTypeMoves = useMemo(
    () => isHideUnselected ? sortedTypeMoves.filter((m) => m.isSelected) : sortedTypeMoves,
    [sortedTypeMoves, isHideUnselected]
  );

  const moveNodes = useMemo(() => visibleTypeMoves.map(({ move, isDisabled, isForced }) => {
    const lockReason = isForced
      ? 'Required by your background'
      : (!isDisabled ? getLockReason(move, typeMoves, level, selected) : undefined);
    return (
      <Move
        key={move.id}
        move={move}
        selection={{
          selected: isDisabled ? true : (selected[move.id] ?? false),
          onChange: boundHandlers.select[move.id],
          readOnly: isDisabled,
          lockReason,
          takes: move.takes !== undefined ? { checked: takes[move.id] ?? 0, onChange: boundHandlers.takesMap[move.id] } : undefined,
        }}
        uses={move.uses !== undefined ? { checked: uses[move.id] ?? 0, onChange: boundHandlers.usesMap[move.id] } : undefined}
        usesAlt={move.usesAlt !== undefined ? { checked: uses2[move.id] ?? 0, onChange: boundHandlers.uses2Map[move.id] } : undefined}
        checkList={
          move.checkList !== undefined
            ? move.checkListLeveled
              ? { mode: 'leveled', levels: checkListLevels[move.id] ?? {}, forcedIds: forcedCheckList[move.id], onChange: boundHandlers.checkListLevelMap[move.id], currentLevel: level }
              : { mode: 'boolean', checked: checkLists[move.id] ?? {}, forcedIds: forcedCheckList[move.id], onChange: boundHandlers.checkListMap[move.id] }
            : undefined
        }
      />
    );
  }), [visibleTypeMoves, typeMoves, level, selected, takes, uses, uses2, checkListLevels, checkLists, forcedCheckList, boundHandlers]);

  return (
    <PlaybookSection title="Moves">
      <div className={styles.collapseStack}>
        {STATIC_SECTIONS.map((s) => (
          <MoveSection key={s.label} {...s} />
        ))}

        <Collapse
          label={`${playbookLabel} Moves`}
          defaultOpen
          action={
            <Toggle
              label="Selected only"
              checked={isHideUnselected}
              onChange={handleHideUnselected}
            />
          }
        >
          {playbookHelperText && (
            <Text color="muted" className={styles.helperText}>{parseInlineMarkdown(playbookHelperText)}</Text>
          )}
          {visibleTypeMoves.length > 0 ? (
            <div className={styles.moveGrid}>{moveNodes}</div>
          ) : (
            <Text color="muted">
              {sortedTypeMoves.length === 0
                ? `No moves for ${playbookLabel} have been defined yet.`
                : 'No moves selected.'}
            </Text>
          )}
        </Collapse>
      </div>
    </PlaybookSection>
  );
};
