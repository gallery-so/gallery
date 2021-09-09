import { useEffect, useState } from 'react';

// Syncs local stroage to react state
function usePersistedState(key: string, defaultValue: any) {
  const [value, setValue] = useState(() => {
    const persistedValue = window.localStorage.getItem(key);

    // Use user provided default if not in local storage
    if (persistedValue === null) {
      return defaultValue;
    }

    // Support json string or string
    try {
      return JSON.parse(persistedValue);
    } catch {
      if (typeof persistedValue === 'string') {
        return persistedValue;
      }

      // Technically shouldn't be reachable.. but for safety
      return defaultValue;
    }
  });

  // TODO: debounce
  useEffect(() => {
    // TODO handle value == undefined, null etc
    const item = typeof value === 'object' ? JSON.stringify(value) : value;
    window.localStorage.setItem(key, item);
  }, [key, value]);

  return [value, setValue];
}

export default usePersistedState;
