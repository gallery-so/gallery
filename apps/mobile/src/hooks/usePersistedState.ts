import AsyncStorage from '@react-native-async-storage/async-storage';
import { Dispatch, SetStateAction, useEffect, useState } from 'react';

type SetValue<T> = Dispatch<SetStateAction<T>>;

// Syncs local stroage to react state
// IMPORTANT: all values are JSON.stringified before being stored - make sure
// you do this manually if you're testing!
function usePersistedState<T>(key: string, defaultValue: T): [T, SetValue<T>] {
  const [value, setValue] = useState<T>(defaultValue);

  useEffect(() => {
    async function getPersistedValue() {
      // Support json string or string
      try {
        const persistedValue = await AsyncStorage.getItem(key);
        if (persistedValue !== null) {
          setValue(JSON.parse(persistedValue));
        }
      } catch {
        // Technically shouldn't be reachable.. but for safety
        return defaultValue;
      }
    }
    getPersistedValue();
  }, [key, defaultValue]);

  // TODO: debounce
  useEffect(() => {
    async function persistValue() {
      try {
        if (value !== null && value !== undefined) {
          const item = JSON.stringify(value);
          console.log('value hereeee: ', value);
          console.log('item hereeee: ', item);
          await AsyncStorage.setItem(key, item);
        }
      } catch (error) {
        throw error;
      }
    }

    persistValue();
  }, [key, value, setValue]);

  return [value, setValue];
}

export default usePersistedState;
