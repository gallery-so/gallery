import React from 'react';
import { SWRConfig } from 'swr';
import { MINUTE } from 'utils/time';

const baseurl =
  process.env.ENV === 'production'
    ? 'https://api.gallery.so'
    : 'http://localhost:3000/api';

export const SwrProvider = React.memo(({ children }) => {
  const value = {
    fetcher: (path: string) =>
      fetch(`${baseurl}/glry/v1${path}`).then((r) => r.json()),
    refreshInterval: 5 * MINUTE,
    suspense: true,
  };

  return <SWRConfig value={value}>{children}</SWRConfig>;
});
