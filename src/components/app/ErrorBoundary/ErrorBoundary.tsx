import { Component, type ReactNode } from 'react';
import { Button } from '@/components/ui';
import { Heading } from '@/components/ui';
import { Text } from '@/components/ui';
import styles from './ErrorBoundary.module.css';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError = (): State => ({ hasError: true });

  render = () => {
    if (this.state.hasError) {
      return (
        <main className={styles.page}>
          <div role="alert" className={styles.srOnly} aria-atomic="true">Something went wrong.</div>
          <div className={styles.content}>
            <Text className={styles.code}>!</Text>
            <Heading as="h1" size="xl">Something went wrong.</Heading>
            <Text color="muted">Refresh the page to try again.</Text>
            <Button size="lg" onClick={() => window.location.reload()}>
              Refresh
            </Button>
          </div>
        </main>
      );
    }
    return this.props.children;
  };
}
