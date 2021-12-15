import { memo, useCallback, useMemo } from 'react';
import { SWRConfig } from 'swr';
import { MINUTE, SECOND } from 'utils/time';
import useFetcher from './useFetcher';
import Mixpanel from 'utils/mixpanel';

function localStorageProvider() {
  // When initializing, we restore the data from `localStorage` into a map.
  const map = new Map(JSON.parse(localStorage.getItem('app-cache') ?? '[]'));

  // Before unloading the app, we write back all the data into `localStorage`.
  window.addEventListener('beforeunload', () => {
    const appCache = JSON.stringify(Array.from(map.entries()));
    localStorage.setItem('app-cache', appCache);
  });

  // We still use the map for write & read for performance.
  return map;
}

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
      provider: localStorageProvider,
      suspense: true,
      // revalidate data every 5 mins. only impacts hooks/data that's on screen
      refreshInterval: 5 * MINUTE,
      // prevent auto-revalidation on window focus
      revalidateOnFocus: false,
      // automatically revalidate if browser loses network connection and recovers
      revalidateOnReconnect: true,
      // dedupe requests with the same key within 2 seconds
      dedupingInterval: 2 * SECOND,
      // detect slow requests
      onLoadingSlow: handleLoadingSlow,
    }),
    [fetcher, handleLoadingSlow]
  );

  return <SWRConfig value={value}>{children}</SWRConfig>;
});
