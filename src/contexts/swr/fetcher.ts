import { JWT_LOCAL_STORAGE_KEY } from 'contexts/auth/constants';

const baseurl =
  process.env.ENV === 'production'
    ? 'https://api.gallery.so'
    : 'http://localhost:3000/api';

export default async function fetcher(path: string) {
  const localJwt = window.localStorage.getItem(JWT_LOCAL_STORAGE_KEY);

  const requestOptions: RequestInit = localJwt
    ? { headers: { Authentication: `Bearer: ${localJwt}` } }
    : {};

  const res = await fetch(`${baseurl}/glry/v1${path}`, requestOptions);
  return await res.json();
}
