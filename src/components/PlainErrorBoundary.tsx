import React, { ErrorInfo } from 'react';

type Props = {
  fallback: React.ReactNode;
};

type State = {
  hasError: boolean;
};

export class PlainErrorBoundary extends React.Component<Props, State> {
  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  state = {
    hasError: false,
  };

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('PlainErrorBoundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback;
    }

    return this.props.children;
  }
}
