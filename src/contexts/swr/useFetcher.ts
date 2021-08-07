import { useAuthActions } from 'contexts/auth/AuthContext';
import { JWT_LOCAL_STORAGE_KEY } from 'contexts/auth/constants';
import { useCallback } from 'react';

const baseurl = process.env.REACT_APP_API_BASE_URL;

const ERR_UNAUTHORIZED = 401;

export type FetcherType = <ResponseData, RequestBody = {}>(
  path: string,
  body?: RequestBody
) => Promise<ResponseData>;

export default function useFetcher(): FetcherType {
  const { logOut } = useAuthActions();

  return useCallback(
    async function (path, body) {
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
      const responseBody = await res.json().catch((e) => ({}));

      if (!res.ok) {
        if (res.status === ERR_UNAUTHORIZED) {
          logOut();
        }
        throw new Error(responseBody ? responseBody.error : 'Error');
      }
      return responseBody;
    },
    [logOut]
  );
}
