import { useState, useRef, useEffect, useCallback } from 'react';
import { useParams, Link, useLocation } from 'react-router-dom';
import { useGame } from '@/hooks/useGame';
import { DEFAULT_GAME_NAME } from '@/lib/constants';
import { Button, Heading, RuleDivider, Stack, Text, Icon } from '@/components/primitives';
import { GameIdModal } from '@/components/GameIdModal/GameIdModal';
import { Breadcrumb } from '@/components/Breadcrumb/Breadcrumb';
import styles from './Game.module.css';


interface LocationState {
  isNew?: boolean;
}

export const Game = () => {
  const { id = '' } = useParams<{ id: string }>();
  const { state } = useLocation();
  const { game, loading, error, updateGameName } = useGame(id);
  const [showIdModal, setShowIdModal] = useState((state as LocationState | null)?.isNew === true);
  const [editingName, setEditingName] = useState(false);
  const [nameValue, setNameValue] = useState('');
  const [copied, setCopied] = useState(false);
  const nameInputRef = useRef<HTMLInputElement>(null);
  const copiedTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (editingName) nameInputRef.current?.select();
  }, [editingName]);

  useEffect(() => {
    return () => {
      if (copiedTimerRef.current) clearTimeout(copiedTimerRef.current);
    };
  }, []);

  const handleCloseIdModal = () => setShowIdModal(false);

  const startEditing = () => {
    setNameValue(game?.name ?? DEFAULT_GAME_NAME);
    setEditingName(true);
  };

  const commitName = useCallback(async () => {
    const trimmed = nameValue.trim();
    try {
      if (trimmed && trimmed !== game?.name) {
        await updateGameName(trimmed);
      }
    } finally {
      setEditingName(false);
    }
  }, [nameValue, game?.name, updateGameName]);

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => setNameValue(e.target.value);

  const handleNameKeyDown = async (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') await commitName();
    if (e.key === 'Escape') setEditingName(false);
  };

  const copyGameId = () => {
    navigator.clipboard.writeText(id);
    setCopied(true);
    if (copiedTimerRef.current) clearTimeout(copiedTimerRef.current);
    copiedTimerRef.current = setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <main className={styles.centered}>
        <Text color="muted">Loading game…</Text>
      </main>
    );
  }

  if (error) {
    return (
      <main className={styles.centered}>
        <Heading as="h2" size="md">Something went wrong</Heading>
        <Text color="muted">{error}</Text>
        <Link to="/">
          <Button variant="secondary">Back to Home</Button>
        </Link>
      </main>
    );
  }

  if (!game) {
    return (
      <main className={styles.centered}>
        <Heading as="h2" size="md">Game not found</Heading>
        <Text color="muted">No game with ID &ldquo;{id}&rdquo; exists.</Text>
        <Link to="/">
          <Button variant="secondary">Back to Home</Button>
        </Link>
      </main>
    );
  }

  return (
    <>
    <GameIdModal gameId={id} open={showIdModal} onClose={handleCloseIdModal} />
    <main className={styles.page}>
      <div className={styles.header}>
        <Breadcrumb crumbs={[{ label: game.name || DEFAULT_GAME_NAME }]} />
        <div className={styles.nameRow}>
          {editingName ? (
            <input
              ref={nameInputRef}
              className={styles.nameInput}
              value={nameValue}
              onChange={handleNameChange}
              onBlur={commitName}
              onKeyDown={handleNameKeyDown}
              aria-label="Game name"
            />
          ) : (
            <>
              <Heading as="h1" size="xl">{game.name || DEFAULT_GAME_NAME}</Heading>
              <button className={styles.editNameBtn} onClick={startEditing} aria-label="Edit game name">
                <Icon name="pencil" size="small" />
              </button>
            </>
          )}
        </div>
        <div className={styles.gameId}>
          <Text color="muted" size="sm">
            Game ID: <Text as="span" color="accent" size="sm">{game.id}</Text>
          </Text>
          <button className={styles.copyBtn} onClick={copyGameId} aria-label="Copy game ID">
            <Icon name={copied ? 'check' : 'copy'} size="small" />
          </button>
        </div>
        <RuleDivider className={styles.titleRule} />
      </div>

      <div className={styles.sections}>
        <div className={styles.section}>
          <Heading as="h2" size="label">GM Playbook</Heading>
          <Link to={`/game/${id}/gm`}>
            <Button variant="secondary" size="xl" fullWidth>Open Playbook</Button>
          </Link>
        </div>

        <div className={styles.section}>
          <Heading as="h2" size="label">Stonetop</Heading>
          <div className={styles.placeholder}>
            <Text color="muted" size="sm">Town playbook coming soon</Text>
          </div>
        </div>

        <div className={styles.section}>
          <Heading as="h2" size="label">Characters</Heading>
          {game.characters.length === 0 ? (
            <div className={styles.placeholder}>
              <Text color="muted" size="sm">No characters yet</Text>
            </div>
          ) : (
            <Stack gap={3}>
              {game.characters.map((character) => (
                <Text key={character.id} size="sm">
                  {character.name} — {character.playbook}
                </Text>
              ))}
            </Stack>
          )}
        </div>
      </div>
    </main>
    </>
  );
};
