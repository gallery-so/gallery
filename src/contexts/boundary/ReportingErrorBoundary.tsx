import {
  Component,
  ComponentType,
  ContextType,
  createElement,
  PropsWithChildren,
  ReactNode,
} from 'react';

import { ErrorReportingContext } from '~/contexts/errorReporting/ErrorReportingContext';

export type ReportingErrorBoundaryFallbackProps = { error: Error };

type Props = PropsWithChildren<{
  fallback: ReactNode | ComponentType<ReportingErrorBoundaryFallbackProps>;
  onError?: (error: Error) => void;
}>;

type State = {
  error: Error | null;
};

export class ReportingErrorBoundary extends Component<Props, State> {
  static contextType = ErrorReportingContext;
  context!: ContextType<typeof ErrorReportingContext>;

  constructor(props: Props) {
    super(props);

    this.state = {
      error: null,
    };
  }

  componentDidCatch(error: Error) {
    this.context?.(error);

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
