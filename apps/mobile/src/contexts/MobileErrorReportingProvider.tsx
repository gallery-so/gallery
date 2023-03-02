import { captureException, captureMessage, setUser } from '@sentry/react-native';
import { PropsWithChildren } from 'react';

import ErrorReportingProvider from '~/shared/contexts/ErrorReportingContext';

export function MobileErrorReportingProvider({ children }: PropsWithChildren) {
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
