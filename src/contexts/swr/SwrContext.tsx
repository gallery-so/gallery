import { memo, useCallback, useMemo } from 'react';
import { SWRConfig } from 'swr';
import { SECOND } from 'utils/time';
import { vanillaFetcher } from './useFetcher';
import { useReportError } from 'contexts/errorReporting/ErrorReportingContext';

export const SwrProvider = memo(({ children }) => {
  const reportError = useReportError();

  const handleLoadingSlow = useCallback(
    (key) => {
      reportError(new Error('Slow request detected'), { tags: { endpoint: key } });
    },
    [reportError]
  );

  const value = useMemo(
    () => ({
      suspense: true,
      // custom fetcher
      fetcher: vanillaFetcher,
      // prevent auto-revalidation on window focus
      revalidateOnFocus: false,
      // automatically revalidate if browser loses network connection and recovers
      revalidateOnReconnect: true,
      // dedupe requests with the same key within 2 seconds
      dedupingInterval: 2 * SECOND,
      // detect slow requests
      onLoadingSlow: handleLoadingSlow,
    }),
    [handleLoadingSlow]
  );

  return <SWRConfig value={value}>{children}</SWRConfig>;
});
