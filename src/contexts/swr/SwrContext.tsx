import React from 'react';
import { SWRConfig } from 'swr';
import { MINUTE } from 'utils/time';
import { syncWithLocalStorage } from './swr-sync-storage';

const baseurl =
  process.env.ENV === 'production'
    ? 'https://api.gallery.so'
    : 'http://localhost:3000/api';

export const SwrProvider = React.memo(({ children }) => {
  const localJwt = window.localStorage.getItem('jwt');

  const requestOptions: RequestInit = localJwt
    ? { headers: { authentication: `Bearer: ${localJwt}` } }
    : {};
  const value = {
    fetcher: (path: string) =>
      fetch(`${baseurl}/glry/v1${path}`, requestOptions).then((r) => r.json()),
    refreshInterval: 5 * MINUTE,
    suspense: true,
  };

  syncWithLocalStorage();

  return <SWRConfig value={value}>{children}</SWRConfig>;
});
