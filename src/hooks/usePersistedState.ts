import { useEffect, useState } from 'react';

// syncs local stroage to react state
function usePersistedState(key: string, defaultValue: any) {
  const [value, setValue] = useState(() => {
    const persistedValue = window.localStorage.getItem(key);

    // use user provided default if not in local storage
    if (persistedValue === null) {
      return defaultValue;
    }

    // support json string or string
    try {
      return JSON.parse(persistedValue);
    } catch (e) {
      if (typeof persistedValue === 'string') {
        return persistedValue;
      }
      // technically shouldn't be reachable.. but for safety
      return defaultValue;
    }
  });

  // TODO: debounce
  useEffect(() => {
    window.localStorage.setItem(key, JSON.stringify(value));
  }, [key, value]);

  return [value, setValue];
}

export default usePersistedState;
