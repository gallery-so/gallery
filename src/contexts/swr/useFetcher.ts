import { useAuthActions } from 'contexts/auth/AuthContext';
import { JWT_LOCAL_STORAGE_KEY } from 'contexts/auth/constants';
import { useCallback } from 'react';

const baseurl = process.env.REACT_APP_API_BASE_URL;

const ERR_UNAUTHORIZED = 401;

export type FetcherType = <ResponseData, RequestBody = {}>(
  path: string,
  body?: RequestBody,
  unauthorizedErrorHandler?: () => void
) => Promise<ResponseData>;

// Raw fetcher. If you're in a hook/component, use `useFetcher` instead.
export const _fetch: FetcherType = async (
  path,
  body,
  unauthorizedErrorHandler
) => {
  const localJwt = window.localStorage.getItem(JWT_LOCAL_STORAGE_KEY);
  const requestOptions: RequestInit = !!localJwt
    ? {
        headers: {
          Authorization: `Bearer ${localJwt}`,
        },
      }
    : {};

  if (body) {
    requestOptions.method = 'POST';
    requestOptions.body = JSON.stringify(body);
  }
  const res = await fetch(`${baseurl}/glry/v1${path}`, requestOptions);

  // If the response doesnt have a Response stream, such as with a
  // succesful Update request, res.json() will throw an error
  const responseBody = await res.json().catch((e) => {
    // TODO: use app-wide error pill
    console.error('Error parsing response json', e);
  });

  if (!res.ok) {
    if (res.status === ERR_UNAUTHORIZED) {
      unauthorizedErrorHandler?.();
    }
    throw new Error(responseBody ? responseBody.error : 'Error');
  }
  return responseBody;
};

/**
 * Use this hook when making a mutation / POST request
 * For GETs, useSwr (example in useUser.ts)
 *
 * const fetcher = useFetcher()
 * await fetcher('/path/to/endpoint', { body: payload })
 */
export default function useFetcher(): FetcherType {
  const { logOut } = useAuthActions();

  return useCallback((path, body) => _fetch(path, body, logOut), [logOut]);
}
