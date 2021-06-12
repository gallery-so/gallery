import React from 'react';
import { SWRConfig } from 'swr';
import { MINUTE } from 'utils/time';
import fetcher from './fetcher';
import { syncWithLocalStorage } from './swr-sync-storage';

export const SwrProvider = React.memo(({ children }) => {
  const value = {
    fetcher,
    refreshInterval: 5 * MINUTE,
    suspense: true,
  };

  syncWithLocalStorage();

  return <SWRConfig value={value}>{children}</SWRConfig>;
});
