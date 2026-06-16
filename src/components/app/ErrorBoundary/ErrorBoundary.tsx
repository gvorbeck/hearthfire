import { Component, type ErrorInfo, type ReactNode } from 'react';
import { Button } from '@/components/ui';
import { Heading } from '@/components/ui';
import { Text } from '@/components/ui';
import styles from './ErrorBoundary.module.css';

interface Props {
  children: ReactNode;
  // Changing this value (e.g. the current route) clears a caught error so
  // navigating away from a broken page recovers without a hard reload.
  resetKey?: string;
}

interface State {
  hasError: boolean;
  resetKey?: string;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, resetKey: this.props.resetKey };

  static getDerivedStateFromError = (): Partial<State> => ({ hasError: true });

  // Reset on resetKey change so a render error on one route doesn't blank the
  // whole app once the user navigates elsewhere.
  static getDerivedStateFromProps = (props: Props, state: State): Partial<State> | null =>
    props.resetKey !== state.resetKey
      ? { hasError: false, resetKey: props.resetKey }
      : null;

  componentDidCatch = (error: Error, info: ErrorInfo) => {
    console.error('ErrorBoundary caught an error:', error, info.componentStack);
  };

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
