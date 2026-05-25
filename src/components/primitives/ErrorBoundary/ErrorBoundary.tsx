import { Component, type ReactNode } from 'react';
import { Stack } from '../Stack/Stack';
import { Text } from '../Text/Text';

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
        <Stack role="alert" align="center" gap={1}>
          <Text size="lg">Something went wrong.</Text>
          <Text size="sm" color="muted">Refresh the page to try again.</Text>
        </Stack>
      );
    }
    return this.props.children;
  };
}
