import { cache } from 'swr';

function getStorage(mode: 'local' | 'session') {
  switch (mode) {
    case 'local':
      return localStorage;
    case 'session':
      return sessionStorage;
    default: {
      throw new Error(
        `Invalid mode ${mode}, it must be either local or session.`
      );
    }
  }
}

// the value of SWR could be either undefined or an object
// if you had other values you will need to check them here
// and parse it correctly (e.g. use Number for number)
function baseParser(value: string): any {
  return value === 'undefined' ? undefined : JSON.parse(value);
}

export function syncWithStorage(
  mode: 'local' | 'session',
  parser = baseParser
) {
  const storage = getStorage(mode);

  // SWR-related keys in localStorage will be prefixed with __swr__
  // example storage key: __swr__arg@"/users/get?username=bingbong"
  const keyPrefix = '__swr__';

  // Get all key from the storage
  for (let [key, data] of Object.entries(storage)) {
    if (!key.startsWith(keyPrefix)) continue;
    // update SWR cache with the value from the storage
    cache.set(key.slice(keyPrefix.length), parser(data).swrValue);
  }

  // Subscribe to SWR cache changes in the future
  return cache.subscribe(() => {
    // SWR keys can begin with `arg@`, `err@`, and `validating@`
    // The only ones worth caching is the response data in `arg@`
    const keys = cache.keys().filter((key) => key.startsWith('arg@'));

    for (let key of keys) {
      storage.setItem(
        `${keyPrefix}${key}`,
        JSON.stringify({ swrValue: cache.get(key) })
      );
    }
  });
}

export function syncWithLocalStorage(parser?: typeof baseParser) {
  return syncWithStorage('local', parser);
}

export function syncWithSessionStorage(parser?: typeof baseParser) {
  return syncWithStorage('session', parser);
}
