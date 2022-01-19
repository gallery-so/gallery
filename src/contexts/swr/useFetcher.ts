import { useCallback } from 'react';
import { useAuthActions } from 'contexts/auth/AuthContext';
import { JWT_LOCAL_STORAGE_KEY } from 'contexts/auth/constants';
import RequestAction from 'hooks/api/_rest/RequestAction';
import { ApiError } from 'errors/types';
import isProduction from 'utils/isProduction';

const baseurl = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:4000';

const ERR_UNAUTHORIZED = 401;

type RequestParameters<T> = {
  body?: T;
  headers?: Record<string, string>;
  unauthorizedErrorHandler?: () => void;
};

type GalleryErrorResponseBody = {
  error?: string;
};

export type FetcherType = <ResponseData, RequestBody = Record<string, unknown>>(
  path: string,
  action: RequestAction,
  parameters?: RequestParameters<RequestBody>
) => Promise<ResponseData>;

// Raw fetcher. If you're in a hook/component, use `useFetcher` instead.
export const _fetch: FetcherType = async (path, action, parameters = {}) => {
  const { body, headers = {}, unauthorizedErrorHandler } = parameters;

  const requestOptions: RequestInit = {
    headers,
    /**
     * credentials are for setting cookies: https://developer.mozilla.org/en-US/docs/Web/API/fetch#parameters
     * 1) same-origin: enforces same-origin URLs
     * 2) include:     allows cross-origin URLs
     */
    // credentials: isProduction() ? 'same-origin' : 'include',
    credentials: 'include',
  };

  const localJwt = window.localStorage.getItem(JWT_LOCAL_STORAGE_KEY);

  const parsedLocalJwt = localJwt && (JSON.parse(localJwt) as string);
  if (parsedLocalJwt && requestOptions.headers) {
    // @ts-expect-error: Authorization is a legit header
    requestOptions.headers.Authorization = `Bearer ${parsedLocalJwt}`;
  }

  if (body) {
    requestOptions.method = 'POST';
    requestOptions.body = JSON.stringify(body);
  }

  const response = await fetch(`${baseurl}/glry/v1${path}`, requestOptions);

  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const responseBody = await response.json().catch((error: unknown) => {
    // Certain successful responses won't have a JSON body (e.g. updates)
    // res.json() will throw an error in these cases, which we catch gracefully
    if (response.ok) {
      return null;
    }

    // Attach custom error message if provided
    if (action && error instanceof Error) {
      throw new ApiError(error.message, action, response.status);
    }

    throw error;
  });

  if (!response.ok) {
    if (response.status === ERR_UNAUTHORIZED) {
      unauthorizedErrorHandler?.();
    }

    // All gallery-provided error responses will have an `error` field
    const errorResponseBody = responseBody as GalleryErrorResponseBody;
    const serverErrorMessage = errorResponseBody?.error ?? 'Server Error';
    if (action) {
      throw new ApiError(serverErrorMessage, action, response.status);
    }

    throw new Error(serverErrorMessage);
  }

  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
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
    async (path, action, parameters) =>
      _fetch(path, action, { ...parameters, unauthorizedErrorHandler: logOut }),
    [logOut]
  );
}
