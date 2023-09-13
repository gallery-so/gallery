import {
  Component,
  ComponentType,
  ContextType,
  createElement,
  PropsWithChildren,
  ReactNode,
} from 'react';
import { Primitive } from 'relay-runtime/lib/store/RelayStoreTypes';

import { ErrorReportingContext } from '../contexts/ErrorReportingContext';
import { CouldNotRenderNftError } from './CouldNotRenderNftError';
import { ErrorWithSentryMetadata } from './ErrorWithSentryMetadata';
import { StillLoadingNftError } from './StillLoadingNftError';

export type ReportingErrorBoundaryFallbackProps = { error: Error };

export type ReportingErrorBoundaryProps = PropsWithChildren<{
  dontReport?: boolean;
  fallback: ReactNode | ComponentType<ReportingErrorBoundaryFallbackProps>;
  additionalTags?: Record<string, Primitive>;
  onError?: (error: Error) => void;
}>;

type State = {
  error: Error | null;
  fallbackError: Error | null;
};

export class ReportingErrorBoundary extends Component<ReportingErrorBoundaryProps, State> {
  static override contextType = ErrorReportingContext;

  // @ts-expect-error Problem w/ `declare` and the Expo babel preset
  context: ContextType<typeof ErrorReportingContext>;

  constructor(props: ReportingErrorBoundaryProps) {
    super(props);

    this.state = {
      error: null,
      fallbackError: null,
    };
  }

  componentDidCatch(error: Error) {
    if (this.state.error) {
      // If there's already an error, that means the fallback is throwing an error
      // We'll rely on the parent to catch this error
      this.setState({ fallbackError: error });
    }

    if (error instanceof ErrorWithSentryMetadata) {
      error.addMetadata(this.props.additionalTags ?? {});
    }

    // Temporarily disable the reporting of Nft failures
    // since they're eating up our sentry credits.
    //
    // Also allow the user of this component to swallow errors
    if (
      !this.props.dontReport &&
      !(error instanceof CouldNotRenderNftError) &&
      !(error instanceof StillLoadingNftError)
    ) {
      this.context?.(error);
    }

    this.props.onError?.(error);
    this.setState({ error });
  }

  render() {
    if (this.state.fallbackError) {
      throw this.state.fallbackError;
    }

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
