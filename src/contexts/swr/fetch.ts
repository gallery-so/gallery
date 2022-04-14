export const baseurl = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:4000';

type RequestParameters<T> = {
  body?: T;
  headers?: Record<string, string>;
};

export type FetcherType = <ResponseData, RequestBody = Record<string, unknown>>(
  path: string,
  parameters?: RequestParameters<RequestBody>
) => Promise<ResponseData>;

export const _fetch: FetcherType = async (path, parameters = {}) => {
  const { body, headers = {} } = parameters;

  const requestOptions: RequestInit = {
    headers,
    /**
     * https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Access-Control-Allow-Credentials
     *
     * The Access-Control-Allow-Credentials response header tells browsers whether to expose the
     * response to the frontend JavaScript code when the request's credentials mode is `include`
     */
    credentials: 'include',
  };

  if (body) {
    requestOptions.method = 'POST';
    requestOptions.body = JSON.stringify(body);
  }

  let response: Response;
  if (path.includes('http')) {
    response = await fetch(path, requestOptions);
  } else {
    response = await fetch(`${baseurl}/glry/v1${path}`, requestOptions);
  }

  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const responseBody = await response.json().catch((error: unknown) => {
    // Certain successful responses won't have a JSON body (e.g. updates)
    // res.json() will throw an error in these cases, which we catch gracefully
    if (response.ok) {
      return null;
    }

    throw error;
  });

  if (!response.ok) {
    throw new Error(responseBody);
  }

  return responseBody;
};

export const vanillaFetcher = async (...args: Parameters<typeof fetch>) =>
  fetch(...args).then(async (res) => res.json());
