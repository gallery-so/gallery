import { Dispatch, SetStateAction, useEffect, useState } from 'react';

type SetValue<T> = Dispatch<SetStateAction<T>>;

// Function useLocalstorage<T>(key: string, initialValue: T): [T, SetValue<T>] {
//   const readValue = (): T => {
//     if (typeof window === 'undefined') {
//       return initialValue;
//     }

//     try {
//       const item = window.localStorage.getItem(key);
//       return item ? (JSON.parse(item) as T) : initialValue;
//     } catch (error: unknown) {
//       console.warn(`Error reading localStrage key "${key}"`, error);
//       return initialValue;
//     }
//   };

//   const [storedValue, setStoredValue] = useState<T>(readValue);

//   const setValue: SetValue<T> = value => {
//     if (typeof window === 'undefined') {
//       console.warn(`Tried setting localStorage key "${key}" even though environment is not a client`);
//     }

//     try {
//       const newValue = value instanceof Function ? value(storedValue) : value;
//       window.localStorage.setItem(key, JSON.stringify(newValue));
//       setStoredValue(newValue);
//       // Window.dispatchEvent(new Event('local-storage'));
//     } catch (error: unknown) {
//       console.warn(`Error setting localStorage key "${key}"`, error);
//     }
//   };

//   useEffect(() => {
//     setStoredValue(readValue());
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, []);

//   return [storedValue, setValue];
// }

// Syncs local stroage to react state
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
      // If (typeof persistedValue === 'string') {
      //   return persistedValue;
      // }

      // Technically shouldn't be reachable.. but for safety
      return defaultValue;
    }
  });

  // TODO: debounce
  useEffect(() => {
    // TODO handle value == undefined, null etc
    // const item = typeof value === 'object' ? JSON.stringify(value) : value;
    const item = JSON.stringify(value);
    window.localStorage.setItem(key, item);
  }, [key, value]);

  return [value, setValue];
}

export default usePersistedState;
