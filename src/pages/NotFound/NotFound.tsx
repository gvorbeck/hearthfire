import { useNavigate } from 'react-router-dom';
import { PageMeta } from '@/components/app/PageMeta/PageMeta';
import { PageLayout } from '@/components/app/PageLayout/PageLayout';
import { Button, Heading, Text } from '@/components/ui';
import styles from './NotFound.module.css';

export const NotFound = () => {
  const navigate = useNavigate();
  const handleReturnHome = () => navigate('/');

  return (
    <PageLayout simple>
      <PageMeta
        title="404 — Lost | Hearthfire"
        description="You've wandered off the path."
      />
      <div className={styles.page}>
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
      </div>
    </PageLayout>
  );
};
