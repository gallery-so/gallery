import { useAuthActions } from 'contexts/auth/AuthContext';
import { JWT_LOCAL_STORAGE_KEY } from 'contexts/auth/constants';
import { useCallback } from 'react';
import { ApiError } from 'src/errors/types';

const baseurl = process.env.REACT_APP_API_BASE_URL;

const ERR_UNAUTHORIZED = 401;

export type FetcherType = <ResponseData, RequestBody = {}>(
  path: string,
  body?: RequestBody,
  // a custom string that describes the request, e.g. "fetch user"
  action?: string,
  unauthorizedErrorHandler?: () => void
) => Promise<ResponseData>;

// Raw fetcher. If you're in a hook/component, use `useFetcher` instead.
export const _fetch: FetcherType = async (
  path,
  body,
  action,
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

  const responseBody = await res.json().catch((e) => {
    // certain successful responses won't have a JSON body (e.g. updates)
    // res.json() will throw an error in these cases, which we catch gracefully
    if (res.ok) {
      return {};
    }

    // attach custom error message if provided
    if (action) {
      const apiError = new ApiError(e.message, action);
      throw apiError;
    }
    throw e;
  });

  if (!res.ok) {
    if (res.status === ERR_UNAUTHORIZED) {
      unauthorizedErrorHandler?.();
    }

    // All gallery-provided error responses will have an `error` field
    const serverErrorMessage = responseBody?.error ?? 'Server Error';
    if (action) {
      const apiError = new ApiError(serverErrorMessage, action);
      throw apiError;
    }
    throw new Error(serverErrorMessage);
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

  return useCallback(
    (path, body, action) => _fetch(path, body, action, logOut),
    [logOut]
  );
}
