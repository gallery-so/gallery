import React from 'react';
import { SWRConfig } from 'swr';
import { MINUTE } from '../../util/time';

export const SwrProvider = React.memo(({ children }) => {
  const value = {
    fetcher: (url: string) => fetch(`api/${url}`).then((r) => r.json()),
    refreshInterval: 5 * MINUTE,
    suspense: true,
  };
  return <SWRConfig value={value}>{children}</SWRConfig>;
});
