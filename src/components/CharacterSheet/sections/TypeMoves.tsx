import { useCallback, useState } from 'react';
import { PlaybookSection } from '../PlaybookSection';
import { Move } from '../Move';
import { PLAYBOOK_MOVES } from '@/lib/playbookMoves';
import { PLAYBOOKS } from '@/lib/constants';
import type { CharacterData, PlaybookType } from '@/types';
import styles from './Moves.module.css';

interface TypeMovesProps {
  playbook: PlaybookType;
  data: CharacterData | undefined;
  onSave: (data: Partial<CharacterData>) => Promise<void>;
  choose?: number;
}

export const TypeMoves = ({ playbook, data, onSave, choose }: TypeMovesProps) => {
  const moves = PLAYBOOK_MOVES[playbook];

  const [selected, setSelected] = useState<Record<string, boolean>>(
    () => data?.typeMoves ?? {}
  );
  const [uses, setUses] = useState<Record<string, number>>(
    () => data?.typeMoveUses ?? {}
  );

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

  if (!moves?.length) return null;

  const playbookOption = PLAYBOOKS.find((p) => p.value === playbook);
  const label = playbookOption?.label ?? playbook;

  return (
    <PlaybookSection title={`${label} Moves`} choose={choose}>
      <div className={styles.moveGrid}>
        {moves.map((move) => (
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
    </PlaybookSection>
  );
};
