import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { addDoc, collection } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { Button, Heading, Input, Stack, Text } from '../../components/primitives';
import styles from './Home.module.css';

export const Home = () => {
  const navigate = useNavigate();
  const [joinId, setJoinId] = useState('');
  const [joinError, setJoinError] = useState('');
  const [creating, setCreating] = useState(false);

  const handleCreate = async () => {
    setCreating(true);
    const ref = await addDoc(collection(db, 'games'), {
      createdAt: Date.now(),
      characters: [],
    });
    navigate(`/game/${ref.id}`);
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

  return (
    <main className={styles.page}>
      <div className={styles.hero}>
        <Heading as="h1" size="xl">
          Stonetop
        </Heading>
        <Text color="muted" className={styles.subtitle}>
          Party tracker for the TTRPG by Jeremy Strandberg
        </Text>
      </div>

      <div className={styles.cards}>
        <div className={styles.card}>
          <Heading as="h2" size="md" className={styles.cardTitle}>
            Create a Game
          </Heading>
          <Stack gap={4}>
            <Text color="muted" size="sm">
              Start a new session. Share the generated ID with your players.
            </Text>
            <Button onClick={handleCreate} disabled={creating} size="lg">
              {creating ? 'Creating…' : 'New Game'}
            </Button>
          </Stack>
        </div>

        <div className={styles.card}>
          <Heading as="h2" size="md" className={styles.cardTitle}>
            Join a Game
          </Heading>
          <form onSubmit={handleJoin}>
            <Stack gap={4}>
              <Input
                id="join-id"
                label="Game ID"
                placeholder="ABC123"
                value={joinId}
                onChange={(e) => {
                  setJoinId(e.target.value);
                  setJoinError('');
                }}
                error={joinError}
              />
              <Button type="submit" variant="secondary" size="lg">
                Join
              </Button>
            </Stack>
          </form>
        </div>
      </div>
    </main>
  );
};
