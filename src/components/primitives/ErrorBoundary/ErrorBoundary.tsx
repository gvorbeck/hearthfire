import { Component, type ReactNode } from 'react';
import { Button } from '../Button/Button';
import { Heading } from '../Heading/Heading';
import { Text } from '../Text/Text';
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
        <main role="alert" className={styles.page}>
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
