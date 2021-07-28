import { JWT_LOCAL_STORAGE_KEY } from 'contexts/auth/constants';

const baseurl = process.env.REACT_APP_API_BASE_URL;

// TODO split into GET / POST helper funcs
export default async function fetcher<ResponseData, RequestBody = {}>(
  path: string,
  body?: RequestBody
): Promise<ResponseData> {
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
    throw new Error(responseBody ? responseBody.error : 'Error');
  }
  return responseBody;
}
