import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageMeta } from '@/components/PageMeta/PageMeta';
import { createGame } from '@/lib/game';
import { Button, Heading, Input, RuleDivider, Stack, Text } from '@/components/primitives';
import styles from './Home.module.css';

export const Home = () => {
  const navigate = useNavigate();
  const [joinId, setJoinId] = useState('');
  const [joinError, setJoinError] = useState('');
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState('');

  const handleCreate = async () => {
    setCreating(true);
    setCreateError('');
    try {
      const id = await createGame();
      navigate(`/game/${id}`, { state: { isNew: true } });
    } catch {
      setCreateError('Failed to create game. Please try again.');
      setCreating(false);
    }
  };

  const handleJoin = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = joinId.trim();
    if (!trimmed) {
      setJoinError('Please enter a game ID.');
      return;
    }
    navigate(`/game/${trimmed}`);
  };

  const handleJoinIdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setJoinId(e.target.value);
    setJoinError('');
  };

  return (
    <main className={styles.page}>
      <PageMeta
        title="Hearthfire — Stonetop Party Tracker"
        description="Track your Stonetop TTRPG campaign — manage characters, GM playbook, and game sessions."
      />
      <div className={styles.hero}>
        <Text className={styles.eyebrow}>Party Tracker</Text>
        <Heading as="h1" size="xl" className={styles.wordmark}>Hearthfire</Heading>
        <RuleDivider className={styles.rule} />
        <Text className={styles.subtitle}>For the Stonetop TTRPG by Jeremy Strandberg</Text>
      </div>

      <div className={styles.cards}>
        <div className={styles.card}>
          <Heading as="h2" size="label">New Game</Heading>
          <div className={styles.cardBody}>
            <Text color="muted" size="sm">
              Start a new session. Share the generated ID with your players.
            </Text>
            <Button onClick={handleCreate} disabled={creating} size="lg" fullWidth>
              {creating ? 'Creating…' : 'Create Game'}
            </Button>
            {createError && <Text color="muted" size="sm">{createError}</Text>}
          </div>
        </div>

        <div className={styles.card}>
          <Heading as="h2" size="label">Join Game</Heading>
          <form onSubmit={handleJoin} className={styles.cardBody}>
            <Stack gap={4}>
              <Input
                id="join-id"
                label="Game ID"
                placeholder="Paste your ID"
                value={joinId}
                onChange={handleJoinIdChange}
                error={joinError}
              />
              <Button type="submit" variant="secondary" size="lg" fullWidth>
                Join
              </Button>
            </Stack>
          </form>
        </div>
      </div>
    </main>
  );
};
