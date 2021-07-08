import { JWT_LOCAL_STORAGE_KEY } from 'contexts/auth/constants';
import { isErrorResponse } from 'types/ApiResponse';

const baseurl = process.env.REACT_APP_API_BASE_URL;

export default async function fetcher<ResponseData, RequestBody = {}>(
  path: string,
  body?: RequestBody
): Promise<ResponseData> {
  const localJwt = window.localStorage.getItem(JWT_LOCAL_STORAGE_KEY);

  const requestOptions: RequestInit = localJwt
    ? { headers: { Authentication: `Bearer: ${localJwt}` } }
    : {};

  if (body) {
    requestOptions.method = 'POST';
    requestOptions.body = JSON.stringify(body);
  }

  const res = await fetch(`${baseurl}/glry/v1${path}`, requestOptions);
  const payload = await res.json();

  if (isErrorResponse(payload)) {
    throw new Error(payload.data.handler_error_user_msg);
  }
  return payload.data;
}
