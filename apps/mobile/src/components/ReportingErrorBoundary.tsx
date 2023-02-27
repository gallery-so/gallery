import { Component, ComponentType, createElement, PropsWithChildren, ReactNode } from 'react';
import { Primitive } from 'relay-runtime/lib/store/RelayStoreTypes';

export type ReportingErrorBoundaryFallbackProps = { error: Error };

export type ReportingErrorBoundaryProps = PropsWithChildren<{
  dontReport?: boolean;
  fallback: ReactNode | ComponentType<ReportingErrorBoundaryFallbackProps>;
  additionalTags?: Record<string, Primitive>;
  onError?: (error: Error) => void;
}>;

type State = {
  error: Error | null;
};

export class ReportingErrorBoundary extends Component<ReportingErrorBoundaryProps, State> {
  constructor(props: ReportingErrorBoundaryProps) {
    super(props);

    this.state = {
      error: null,
    };
  }

  componentDidCatch(error: Error) {
    this.props.onError?.(error);
    this.setState({ error });
  }

  render() {
    if (this.state.error) {
      const fallback = this.props.fallback;

      if (typeof fallback === 'function') {
        return createElement(fallback, { error: this.state.error });
      } else {
        return fallback;
      }
    }

    return this.props.children;
  }
}
