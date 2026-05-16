import { useCallback, useEffect, useMemo, useState } from 'react';
import { PlaybookSection } from '../PlaybookSection';
import { Collapse } from '@/components/primitives';
import { Move } from '../Move';
import type { MoveDefinition } from '../Move';
import { BASIC_MOVES } from '@/lib/basicMoves';
import { SPECIAL_MOVES } from '@/lib/specialMoves';
import { FOLLOWER_MOVES } from '@/lib/followerMoves';
import { EXPEDITION_MOVES } from '@/lib/expeditionMoves';
import { HOMEFRONT_MOVES } from '@/lib/homefrontMoves';
import { CUSTOM_MOVES } from '@/lib/customMoves';
import { PLAYBOOK_MOVES } from '@/lib/playbookMoves';
import { PLAYBOOKS } from '@/lib/constants';
import type { CharacterData, PlaybookType } from '@/types';
import styles from './Moves.module.css';

interface MoveSectionProps {
  label: string;
  helperText: React.ReactNode;
  moves: MoveDefinition[];
  emptyText: string;
}

const MoveSection = ({ label, helperText, moves, emptyText }: MoveSectionProps) => (
  <Collapse label={label}>
    <p className={styles.helperText}>{helperText}</p>
    {moves.length > 0 ? (
      <div className={styles.moveGrid}>
        {moves.map((move) => (
          <Move key={move.id} move={move} />
        ))}
      </div>
    ) : (
      <p className={styles.empty}>{emptyText}</p>
    )}
  </Collapse>
);

interface MovesProps {
  playbook: PlaybookType;
  data: CharacterData | undefined;
  onSave: (data: Partial<CharacterData>) => Promise<void>;
  choose?: number;
}

export const Moves = ({ playbook, data, onSave, choose }: MovesProps) => {
  const typeMoves = PLAYBOOK_MOVES[playbook] ?? [];

  const [selected, setSelected] = useState<Record<string, boolean>>(
    () => data?.typeMoves ?? {}
  );
  const [uses, setUses] = useState<Record<string, number>>(
    () => data?.typeMoveUses ?? {}
  );

  useEffect(() => {
    setSelected(data?.typeMoves ?? {});
    setUses(data?.typeMoveUses ?? {});
  }, [data]);

  const handleSelect = useCallback((id: string, value: boolean) => {
    const next = { ...selected, [id]: value };
    setSelected(next);
    onSave({ typeMoves: next });
  }, [selected, onSave]);

  const handleUses = useCallback((id: string, count: number) => {
    const next = { ...uses, [id]: count };
    setUses(next);
    onSave({ typeMoveUses: next });
  }, [uses, onSave]);

  const playbookLabel = useMemo(
    () => PLAYBOOKS.find((p) => p.value === playbook)?.label ?? playbook,
    [playbook]
  );

  return (
    <PlaybookSection title="Moves">
      <div className={styles.collapseStack}>
        <MoveSection
          label="Basic Moves"
          helperText="These are the most commonly triggered moves, the ones that can come up in many different contexts."
          moves={BASIC_MOVES}
          emptyText="No basic moves yet."
        />
        <MoveSection
          label="Special Moves"
          helperText="These moves are always in play, but they either affect other moves or are triggered by very specific circumstances."
          moves={SPECIAL_MOVES}
          emptyText="No special moves yet."
        />
        <MoveSection
          label="Follower Moves"
          helperText={<>These moves apply when you interact with your <strong>followers</strong> (page 64).</>}
          moves={FOLLOWER_MOVES}
          emptyText="No follower moves yet."
        />
        <MoveSection
          label="Expedition Moves"
          helperText="These moves apply when you prepare for, undertake, or return from an expedition."
          moves={EXPEDITION_MOVES}
          emptyText="No expedition moves yet."
        />
        <MoveSection
          label="Homefront Moves"
          helperText="These moves apply during downtime, or when you're interacting with a steading's population and resources."
          moves={HOMEFRONT_MOVES}
          emptyText="No homefront moves yet."
        />
        <MoveSection
          label="Custom Moves"
          helperText="These moves apply only to specific game or setting elements, and only if you choose to use them. Consult your GM."
          moves={CUSTOM_MOVES}
          emptyText="No custom moves yet."
        />

        {typeMoves.length > 0 && (
          <Collapse
            label={choose !== undefined ? `${playbookLabel} Moves (Choose ${choose})` : `${playbookLabel} Moves`}
            defaultOpen
          >
            <div className={styles.moveGrid}>
              {typeMoves.map((move) => (
                <Move
                  key={move.id}
                  move={move}
                  selected={selected[move.id] ?? false}
                  onSelectChange={(val) => handleSelect(move.id, val)}
                  usesChecked={uses[move.id] ?? 0}
                  onUsesChange={move.uses !== undefined ? (n) => handleUses(move.id, n) : undefined}
                />
              ))}
            </div>
          </Collapse>
        )}
      </div>
    </PlaybookSection>
  );
};
