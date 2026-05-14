import { useState } from 'react';
import { useParams, Link, useLocation } from 'react-router-dom';
import { useGame } from '../../hooks/useGame';
import { Button, Heading, Stack, Text } from '../../components/primitives';
import { GameIdModal } from '../../components/GameIdModal/GameIdModal';
import styles from './Game.module.css';

interface LocationState {
  isNew?: boolean;
}

export const Game = () => {
  const { id = '' } = useParams<{ id: string }>();
  const { state } = useLocation();
  const { game, loading, error } = useGame(id);
  const [showIdModal, setShowIdModal] = useState((state as LocationState | null)?.isNew === true);

  const handleCloseIdModal = () => setShowIdModal(false);

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
      <Stack gap={2} className={styles.header}>
        <Heading as="h1" size="xl">Session</Heading>
        <Text color="muted" size="sm" className={styles.gameId}>
          Game ID: <Text as="span" color="accent" size="sm">{game.id}</Text>
        </Text>
      </Stack>

      <div className={styles.sections}>
        <div className={styles.section}>
          <Heading as="h2" size="sm" className={styles.sectionTitle}>
            GM Playbook
          </Heading>
          <div className={styles.placeholder}>
            <Text color="muted" size="sm">GM tools coming soon</Text>
          </div>
        </div>

        <div className={styles.section}>
          <Heading as="h2" size="sm" className={styles.sectionTitle}>
            Stonetop
          </Heading>
          <div className={styles.placeholder}>
            <Text color="muted" size="sm">Town playbook coming soon</Text>
          </div>
        </div>

        <div className={styles.section}>
          <Heading as="h2" size="sm" className={styles.sectionTitle}>
            Characters
          </Heading>
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
