import { ScopeContext } from '@sentry/types';
import { createContext, memo, ReactNode, useCallback, useContext, useRef } from 'react';
import { graphql, useLazyLoadQuery } from 'react-relay';

import { ErrorReportingContextQuery } from '~/generated/ErrorReportingContextQuery.graphql';

export type AdditionalContext = Partial<Pick<ScopeContext, 'tags' | 'level' | 'user'>>;

export type ReportFn = (
  errorOrMessage: Error | string,
  additionalContext?: AdditionalContext
) => void;

export const ErrorReportingContext = createContext<ReportFn | undefined>(undefined);

/**
 * USAGE GUIDELINES
 *
 * You can either send a javascript error object OR a string to sentry.
 * It is *HIGHLY ENCOURAGED* to send the error itself as opposed to a string
 * if possible, as it'll provide Sentry with a detailed stacktrace:
 *
 *    const reportError = useReportError();
 *    try {
 *      badFunction();
 *    } catch (error) {
 *      reportError(error); <-- pass along the caught error
 *    }
 *
 * However, there may be cases where you don't have access to a literal
 * error but still want to report it. In that case you can pass in a string:
 *
 *    const reportError = useReportError();
 *    if (dataIsGood) {
 *      // success case
 *    } else {
 *      reportError('data is messed up'); <-- send a string
 *    }
 *
 * You can also provide an additional object param to provide more context.
 * These options include:
 *   - level: the severity of the error. these are enums defined on the Severity type in @sentry/types
 *   - tags: optional metadata that might be useful
 *
 *      try {
 *        badFunction();
 *      } catch (error) {
 *        reportError(error, {
 *          level: 'fatal',
 *          tags: {
 *            context: 'onboarding',
 *            step: 2
 *          }
 *        })
 *      }
 */
export const useReportError = () => {
  const reportError = useContext(ErrorReportingContext);

  if (!reportError) {
    throw new Error('Attempted to use ErrorReportingContext without a provider!');
  }

  return reportError;
};

type Props = {
  setUser: (user: { id?: string }) => void;
  captureMessage: (message: string, additionalContext?: AdditionalContext) => void;
  captureException: (error: Error, additionalContext?: AdditionalContext) => void;
  children: ReactNode;
};

const ErrorReportingProvider = memo(
  ({ children, captureException, captureMessage, setUser }: Props) => {
    const query = useLazyLoadQuery<ErrorReportingContextQuery>(
      graphql`
        query ErrorReportingContextQuery {
          viewer {
            ... on Viewer {
              user {
                dbid
              }
            }
          }
        }
      `,
      {}
    );

    // Put the userId in a ref so we have something we can
    // reach into for the current user id without needing
    // to add a state dep to our useCallback.
    //
    // Without this, all of our downstream effects
    // which rely on useReportError fire twice when
    // the user logs in / logs out
    const userId = query.viewer?.user?.dbid;
    const userIdRef = useRef(userId);
    userIdRef.current = userId;

    const handleReportError: ReportFn = useCallback(
      (errorOrMessage: Error | string, additionalContext?: AdditionalContext) => {
        // always set the user ID. if it's not defined, it will be unset. this ensures
        // that users who log out will no longer be tracked by their ID.
        setUser({ id: userIdRef.current });

        if (typeof errorOrMessage === 'string') {
          captureMessage(errorOrMessage, additionalContext);
          return;
        }

        captureException(errorOrMessage, additionalContext);
      },
      [captureException, captureMessage, setUser]
    );

    return (
      <ErrorReportingContext.Provider value={handleReportError}>
        {children}
      </ErrorReportingContext.Provider>
    );
  }
);

ErrorReportingProvider.displayName = 'ErrorReportingProvider';

export default ErrorReportingProvider;
