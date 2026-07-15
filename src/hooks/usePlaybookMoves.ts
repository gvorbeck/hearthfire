import { useEffect, useState } from 'react';
import { PLAYBOOK_MOVE_LOADERS } from '@/lib/moves';
import type { MoveDefinition, PlaybookType } from '@/types';

const EMPTY_MOVES: MoveDefinition[] = [];

// Dynamically imports the active playbook's move file, so a character sheet's bundle only ever
// carries the one playbook's moves instead of all nine (see @/lib/moves/index.ts). Returns an
// empty array while the chunk is loading or if the playbook changes before it resolves.
export const usePlaybookMoves = (playbook: PlaybookType): MoveDefinition[] => {
  const [loaded, setLoaded] = useState<{ playbook: PlaybookType; moves: MoveDefinition[] } | null>(null);

  useEffect(() => {
    let cancelled = false;
    PLAYBOOK_MOVE_LOADERS[playbook]()
      .then((moves) => {
        if (!cancelled) setLoaded({ playbook, moves });
      })
      // A failed chunk load (offline, stale cache) leaves the empty-array fallback in place rather
      // than surfacing an unhandled rejection.
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [playbook]);

  return loaded?.playbook === playbook ? loaded.moves : EMPTY_MOVES;
};
