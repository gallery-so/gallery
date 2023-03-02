import {
  Component,
  ComponentType,
  ContextType,
  createElement,
  PropsWithChildren,
  ReactNode,
} from 'react';
import { Primitive } from 'relay-runtime/lib/store/RelayStoreTypes';

import { CouldNotRenderNftError } from '~/errors/CouldNotRenderNftError';
import { ErrorWithSentryMetadata } from '~/errors/ErrorWithSentryMetadata';
import { ErrorReportingContext } from '~/shared/contexts/ErrorReportingContext';

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
  static override contextType = ErrorReportingContext;
  declare context: ContextType<typeof ErrorReportingContext>;

  constructor(props: ReportingErrorBoundaryProps) {
    super(props);

    this.state = {
      error: null,
    };
  }

  componentDidCatch(error: Error) {
    if (error instanceof ErrorWithSentryMetadata) {
      error.addMetadata(this.props.additionalTags ?? {});
    }

    // Temporarily disable the reporting of Nft failures
    // since they're eating up our sentry credits.
    //
    // Also allow the user of this component to swallow errors
    if (!this.props.dontReport && !(error instanceof CouldNotRenderNftError)) {
      this.context?.(error);
    }

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
