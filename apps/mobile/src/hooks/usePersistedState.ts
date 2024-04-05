import AsyncStorage from '@react-native-async-storage/async-storage';
import { useCallback, useEffect, useState } from 'react';

function usePersistedState<T>(key: string, defaultValue: T): [T, (value: T) => Promise<void>] {
  const [value, setValue] = useState<T>(defaultValue);

  // Function to load the initial value from AsyncStorage
  const loadValue = async () => {
    try {
      const item = await AsyncStorage.getItem(key);
      // Only update if the item is not null, otherwise stick to defaultValue
      if (item !== null) {
        setValue(JSON.parse(item));
      }
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Error loading value from AsyncStorage', error);
    }
  };

  // Load the initial value when the component mounts
  useEffect(() => {
    loadValue();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  // Function to update both the state and the AsyncStorage
  const setPersistedValue = useCallback(
    async (newValue: T) => {
      try {
        // Update state
        setValue(newValue);
        // Update AsyncStorage
        await AsyncStorage.setItem(key, JSON.stringify(newValue));
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error('Error saving value to AsyncStorage', error);
      }
    },
    [key]
  );

  return [value, setPersistedValue];
}

export default usePersistedState;
