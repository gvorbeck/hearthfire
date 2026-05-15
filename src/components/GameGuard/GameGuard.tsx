import { Link } from 'react-router-dom';
import { Heading, Text, Button } from '@/components/primitives';
import type { GameSession } from '@/types';
import styles from './GameGuard.module.css';

interface Props {
  loading: boolean;
  error: string | null;
  game: GameSession | null;
  loadingText?: string;
  notFoundMessage?: string;
  errorBackTo?: string;
  children: (game: GameSession) => React.ReactNode;
}

export const GameGuard = ({
  loading,
  error,
  game,
  loadingText = 'Loading…',
  notFoundMessage,
  errorBackTo = '/',
  children,
}: Props) => {
  if (loading) {
    return (
      <main className={styles.centered}>
        <Text color="muted">{loadingText}</Text>
      </main>
    );
  }

  if (error) {
    return (
      <main className={styles.centered}>
        <Heading as="h2" size="md">Something went wrong</Heading>
        <Text color="muted">{error}</Text>
        <Link to={errorBackTo}>
          <Button variant="secondary">Back to Home</Button>
        </Link>
      </main>
    );
  }

  if (!game) {
    return (
      <main className={styles.centered}>
        <Heading as="h2" size="md">Game not found</Heading>
        {notFoundMessage && <Text color="muted">{notFoundMessage}</Text>}
        <Link to="/">
          <Button variant="secondary">Back to Home</Button>
        </Link>
      </main>
    );
  }

  return <>{children(game)}</>;
};
