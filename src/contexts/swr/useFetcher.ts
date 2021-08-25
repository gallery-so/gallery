import { useCallback } from 'react';
import { useAuthActions } from 'contexts/auth/AuthContext';
import { JWT_LOCAL_STORAGE_KEY } from 'contexts/auth/constants';
import RequestAction from 'hooks/api/_rest/RequestAction';
import { ApiError } from 'src/errors/types';

const baseurl = process.env.REACT_APP_API_BASE_URL;

const ERR_UNAUTHORIZED = 401;

type RequestParams<T> = {
  body?: T;
  headers?: Record<string, string>;
  unauthorizedErrorHandler?: () => void;
};

export type FetcherType = <ResponseData, RequestBody = {}>(
  path: string,
  action: RequestAction,
  params?: RequestParams<RequestBody>
) => Promise<ResponseData>;

// Raw fetcher. If you're in a hook/component, use `useFetcher` instead.
export const _fetch: FetcherType = async (path, action, params = {}) => {
  const { body, headers = {}, unauthorizedErrorHandler } = params;

  const requestOptions: RequestInit = { headers };

  const localJwt = window.localStorage.getItem(JWT_LOCAL_STORAGE_KEY);
  if (localJwt && requestOptions.headers) {
    // @ts-expect-error: Authorization is a legit header
    requestOptions.headers.Authorization = `Bearer ${localJwt}`;
  }

  if (body) {
    requestOptions.method = 'POST';
    requestOptions.body = JSON.stringify(body);
  }
  console.log(baseurl, process.env);
  const res = await fetch(`${baseurl}/glry/v1${path}`, requestOptions);

  const responseBody = await res.json().catch((e) => {
    // certain successful responses won't have a JSON body (e.g. updates)
    // res.json() will throw an error in these cases, which we catch gracefully
    if (res.ok) {
      return null;
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
 * You should rarely use this hook directly! Instead:
 * - useGet for fetching
 * - usePost for mutations
 */
export default function useFetcher(): FetcherType {
  const { logOut } = useAuthActions();

  return useCallback(
    (path, action, params) =>
      _fetch(path, action, { ...params, unauthorizedErrorHandler: logOut }),
    [logOut]
  );
}
