import clsx from 'clsx';
import { useState, useRef, useEffect, useCallback } from 'react';
import { useParams, Link, useLocation } from 'react-router-dom';
import { useGame } from '@/hooks/useGame';
import { DEFAULT_GAME_NAME, PLAYBOOKS } from '@/lib/constants';
import { Button, Heading, RuleDivider, Stack, Text, Icon } from '@/components/primitives';
import { GameIdModal } from '@/components/GameIdModal/GameIdModal';
import { AddCharacterModal } from '@/components/AddCharacterModal/AddCharacterModal';
import { Breadcrumb } from '@/components/Breadcrumb/Breadcrumb';
import { GameGuard } from '@/components/GameGuard/GameGuard';
import styles from './Game.module.css';


interface LocationState {
  isNew?: boolean;
}

export const Game = () => {
  const { id = '' } = useParams<{ id: string }>();
  const { state } = useLocation();
  const { game, loading, error, updateGameName, addCharacter } = useGame(id);
  const [showIdModal, setShowIdModal] = useState((state as LocationState | null)?.isNew === true);
  const [showAddCharacter, setShowAddCharacter] = useState(false);
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
  const handleCloseAddCharacter = () => setShowAddCharacter(false);
  const handleOpenAddCharacter = () => setShowAddCharacter(true);

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

  const charactersCx = clsx(styles.section, styles.sectionCharacters);
  const rightCx = clsx(styles.section, styles.sectionRight);

  return (
    <GameGuard
      loading={loading}
      error={error}
      game={game}
      loadingText="Loading game…"
      notFoundMessage={`No game with ID "${id}" exists.`}
    >
      {(g) => {
        const gameName = g.name || DEFAULT_GAME_NAME;

        return (
          <>
          <GameIdModal gameId={id} open={showIdModal} onClose={handleCloseIdModal} />
          <AddCharacterModal
            open={showAddCharacter}
            onClose={handleCloseAddCharacter}
            existingPlaybooks={g.characters.map((c) => c.playbook)}
            onAdd={addCharacter}
          />
          <main className={styles.page}>
            <div className={styles.header}>
              <Breadcrumb crumbs={[{ label: gameName }]} />
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
                    <Heading as="h1" size="xl">{gameName}</Heading>
                    <button className={styles.editNameBtn} onClick={startEditing} aria-label="Edit game name">
                      <Icon name="pencil" size="small" />
                    </button>
                  </>
                )}
              </div>
              <div className={styles.gameId}>
                <Text color="muted" size="sm">
                  Game ID: <Text as="span" color="accent" size="sm">{g.id}</Text>
                </Text>
                <button className={styles.copyBtn} onClick={copyGameId} aria-label="Copy game ID">
                  <Icon name={copied ? 'check' : 'copy'} size="small" />
                </button>
              </div>
              <RuleDivider className={styles.titleRule} />
            </div>

            <div className={styles.sections}>
              <div className={charactersCx}>
                <Heading as="h2" size="label">Characters</Heading>
                {g.characters.length > 0 && (
                  <Stack gap={3}>
                    {g.characters.map((character) => {
                      const playbookOption = PLAYBOOKS.find((p) => p.value === character.playbook);
                      const buttonLabel = `${playbookOption?.label ?? character.playbook} Playbook`;
                      return (
                        <Link key={character.id} to={`/game/${id}/${character.playbook}`}>
                          <Button variant="secondary" size="xl" fullWidth>{buttonLabel}</Button>
                        </Link>
                      );
                    })}
                  </Stack>
                )}
                <Button variant="secondary" size="xl" fullWidth onClick={handleOpenAddCharacter}>
                  Add Character
                </Button>
              </div>

              <div className={rightCx}>
                <Heading as="h2" size="label">Stonetop</Heading>
                <div className={styles.placeholder}>
                  <Text color="muted" size="sm">Town playbook coming soon</Text>
                </div>
              </div>

              <div className={rightCx}>
                <Heading as="h2" size="label">GM Playbook</Heading>
                <Link to={`/game/${id}/gm`}>
                  <Button variant="secondary" size="xl" fullWidth>Open Playbook</Button>
                </Link>
              </div>
            </div>
          </main>
          </>
        );
      }}
    </GameGuard>
  );
};
