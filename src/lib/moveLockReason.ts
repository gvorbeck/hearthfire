import type { MoveDefinition } from '@/types';

// Returns the fully-formed, still-unmet lock reasons for a move (empty array = unlocked). Either a
// single "Conflicts with …" reason, or a single "Requires …" reason listing the unmet prerequisites.
export const getLockReason = (
  move: MoveDefinition,
  typeMoves: MoveDefinition[],
  level: number,
  selected: Record<string, boolean>,
): string[] => {
  if (level <= 1 && move.excludes !== undefined) {
    for (const exId of move.excludes) {
      const exMove = typeMoves.find((m) => m.id === exId);
      if (exMove && selected[exId]) {
        return [`Conflicts with ${exMove.name}`];
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
  if (parts.length === 0) return [];
  return [`Requires ${parts.join(' and ')}`];
};
