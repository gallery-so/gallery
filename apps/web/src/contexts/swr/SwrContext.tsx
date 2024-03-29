import { memo, PropsWithChildren, useCallback, useMemo } from 'react';
import { SWRConfig, SWRConfiguration } from 'swr';

import { useReportError } from '~/shared/contexts/ErrorReportingContext';
import { SECOND } from '~/shared/utils/time';

import { vanillaFetcher } from './fetch';

export const SwrProvider = memo(({ children }: PropsWithChildren) => {
  const reportError = useReportError();

  const handleLoadingSlow = useCallback(
    (key: string) => {
      reportError(new Error('Slow request detected'), { tags: { endpoint: key } });
    },
    [reportError]
  );

  const value: SWRConfiguration = useMemo(
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

SwrProvider.displayName = 'SwrProvider';
