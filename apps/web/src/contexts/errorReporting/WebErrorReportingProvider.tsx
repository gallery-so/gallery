import { captureException, captureMessage, setUser } from '@sentry/nextjs';
import { PropsWithChildren } from 'react';
import { useLazyLoadQuery } from 'react-relay';

import ErrorReportingProvider from '~/shared/contexts/ErrorReportingContext';

export function WebErrorReportingProvider({ children }: PropsWithChildren) {
  console.log('Web', useLazyLoadQuery);

  return (
    <ErrorReportingProvider
      captureException={captureException}
      captureMessage={captureMessage}
      setUser={setUser}
    >
      {children}
    </ErrorReportingProvider>
  );
}
