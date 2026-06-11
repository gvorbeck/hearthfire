import { useState, useMemo } from 'react';
import { Input, Text, PlaybookColumns } from '@/components/ui';
import { Move } from '@/components/character/Move/Move';
import { BASIC_MOVES, SPECIAL_MOVES, FOLLOWER_MOVES, HOMEFRONT_MOVES, EXPEDITION_MOVES, PLAYBOOK_MOVES } from '@/lib/moves';
import type { MoveDefinition } from '@/types';
import styles from './MoveSearch.module.css';

const ALL_MOVES = [
  ...BASIC_MOVES,
  ...SPECIAL_MOVES,
  ...FOLLOWER_MOVES,
  ...HOMEFRONT_MOVES,
  ...EXPEDITION_MOVES,
  ...Object.values(PLAYBOOK_MOVES).flat(),
].sort((a, b) => a.name.localeCompare(b.name));

const MoveList = ({ moves }: { moves: MoveDefinition[] }) => (
  <ul className={styles.list}>
    {moves.map((move) => (
      <li key={move.id} className={styles.item}>
        <Move title={move.name} move={move} />
      </li>
    ))}
  </ul>
);

export const MoveSearch = () => {
  const [query, setQuery] = useState('');

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return ALL_MOVES.filter((m) => m.name.toLowerCase().includes(q));
  }, [query]);

  const mid = Math.ceil(results.length / 2);
  const leftCol = results.slice(0, mid);
  const rightCol = results.slice(mid);

  return (
    <div className={styles.root}>
      <Input
        placeholder="Search moves by name…"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        aria-label="Search moves by name"
        className={styles.input}
      />
      {query.trim() && results.length === 0 && (
        <Text font="serif" color="muted" className={styles.empty}>No moves match "{query}".</Text>
      )}
      {results.length > 0 && (
        <section aria-label="Move search results" className={styles.results}>
          <PlaybookColumns
            left={<MoveList moves={leftCol} />}
            right={rightCol.length > 0 ? <MoveList moves={rightCol} /> : undefined}
          />
        </section>
      )}
    </div>
  );
};
