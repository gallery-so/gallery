import { Dispatch, SetStateAction, useEffect, useState } from 'react';

type SetValue<T> = Dispatch<SetStateAction<T>>;

// Syncs local stroage to react state
// IMPORTANT: all values are JSON.stringified before being stored - make sure
// you do this manually if you're testing!
function usePersistedState<T>(key: string, defaultValue: T): [T, SetValue<T>] {
  const [value, setValue] = useState(() => {
    const persistedValue = window.localStorage.getItem(key);

    // Use user provided default if not in local storage
    if (persistedValue === null) {
      return defaultValue;
    }

    // Support json string or string
    try {
      return JSON.parse(persistedValue) as T;
    } catch {
      // Technically shouldn't be reachable.. but for safety
      return defaultValue;
    }
  });

  // TODO: debounce
  useEffect(() => {
    // TODO handle value == undefined, null etc
    if (!key) return;
    const item = JSON.stringify(value);
    window.localStorage.setItem(key, item);
  }, [key, value]);

  return [value, setValue];
}

export default usePersistedState;
