import AsyncStorage from '@react-native-async-storage/async-storage';
import { Dispatch, SetStateAction, useEffect, useState } from 'react';

type SetValue<T> = Dispatch<SetStateAction<T>>;

async function getItem<T>(key: string, defaultValue: T): Promise<T> {
  try {
    const persistedValue = await AsyncStorage.getItem(key);
    if (persistedValue !== null) {
      return JSON.parse(persistedValue) as T;
    }
  } catch (e) {
    throw e;
  }
  return defaultValue;
}

async function setItem<T>(key: string, value: T): Promise<void> {
  try {
    const item = JSON.stringify(value);
    await AsyncStorage.setItem(key, item);
  } catch (e) {
    throw e;
  }
}

function usePersistedState<T>(key: string, defaultValue: T): [T, SetValue<T>] {
  const [value, setValue] = useState<T>(defaultValue);

  useEffect(() => {
    getItem<T>(key, defaultValue).then((persistedValue) => {
      setValue(persistedValue);
    });
  }, [key, defaultValue]);

  useEffect(() => {
    setItem<T>(key, value);
  }, [key, value]);

  return [value, setValue];
}

export default usePersistedState;
