import { useNavigate } from 'react-router-dom';
import { PageMeta } from '@/components/PageMeta/PageMeta';
import { Button, Heading, Text } from '@/components/primitives';
import styles from './NotFound.module.css';

export const NotFound = () => {
  const navigate = useNavigate();
  const handleReturnHome = () => navigate('/');

  return (
    <main className={styles.page}>
      <PageMeta
        title="404 — Lost | Hearthfire"
        description="You've wandered off the path."
      />
      <div className={styles.content}>
        <Text aria-label="404 error" className={styles.code}>404</Text>
        <Heading as="h1" size="xl" className={styles.heading}>
          You've wandered off the path.
        </Heading>
        <Text color="muted">
          Nothing here but cold ash.
        </Text>
        <Button onClick={handleReturnHome} size="lg">
          Return Home
        </Button>
      </div>
    </main>
  );
};
