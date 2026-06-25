import { Link } from 'react-router-dom';
import { Heading, Text, Button } from '@/components/ui';
import type { GameSession } from '@/types';
import styles from './GameGuard.module.css';

interface Props {
  loading: boolean;
  error: string | null;
  game: GameSession | null;
  loadingText?: string;
  notFoundMessage?: string;
  errorBackTo?: string;
  errorBackLabel?: string;
  children: (game: GameSession) => React.ReactNode;
}

export const GameGuard = ({
  loading,
  error,
  game,
  loadingText = 'Loading…',
  notFoundMessage,
  errorBackTo = '/',
  errorBackLabel = 'Back to Home',
  children,
}: Props) => {
  if (loading) {
    return (
      <main className={styles.centered}>
        <Text color="muted" role="status" aria-live="polite" aria-busy={true}>{loadingText}</Text>
      </main>
    );
  }

  if (error) {
    return (
      <main className={styles.centered}>
        <Heading as="h1" size="md">Something went wrong</Heading>
        <Text color="muted">{error}</Text>
        <Button as={Link} to={errorBackTo} variant="secondary">{errorBackLabel}</Button>
      </main>
    );
  }

  if (!game) {
    return (
      <main className={styles.centered}>
        <Heading as="h1" size="md">Game not found</Heading>
        {notFoundMessage && <Text color="muted">{notFoundMessage}</Text>}
        <Button as={Link} to="/" variant="secondary">Back to Home</Button>
      </main>
    );
  }

  return <>{children(game)}</>;
};
