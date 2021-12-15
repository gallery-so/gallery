import { memo, useCallback, useMemo } from 'react';
import { SWRConfig } from 'swr';
import { MINUTE, SECOND } from 'utils/time';
import useFetcher from './useFetcher';
import { syncWithLocalStorage } from './swr-sync-storage';
import Mixpanel from 'utils/mixpanel';

export const SwrProvider = memo(({ children }) => {
  const fetcher = useFetcher();

  const handleLoadingSlow = useCallback((key) => {
    Mixpanel.track('Slow request', {
      endpoint: key,
    });
  }, []);

  const value = useMemo(
    () => ({
      fetcher,
      suspense: true,
      // revalidate data every 5 mins. only impacts hooks/data that's on screen
      refreshInterval: 5 * MINUTE,
      // prevent auto-revalidation on window focus
      refreshOnFocus: false,
      // automatically revalidate if browser loses network connection and recovers
      revalidateOnReconnect: true,
      // dedupe requests with the same key within 2 seconds
      dedupingInterval: 2 * SECOND,
      // detect slow requests
      onLoadingSlow: handleLoadingSlow,
    }),
    [fetcher, handleLoadingSlow]
  );

  syncWithLocalStorage();

  return <SWRConfig value={value}>{children}</SWRConfig>;
});
