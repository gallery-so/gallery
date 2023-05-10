import AsyncStorage from '@react-native-async-storage/async-storage';
import { registerDevMenuItems } from 'expo-dev-menu';
import { useEffect } from 'react';

import { useLogout } from '../hooks/useLogout';

export function DevMenuItems() {
  const [logout] = useLogout();

  useEffect(() => {
    registerDevMenuItems([
      {
        name: 'Clear Async Storage',
        callback: () => {
          AsyncStorage.clear();
        },
      },
      {
        name: 'Logout',
        callback: () => {
          logout();
        },
      },
    ]);
  }, [logout]);

  return null;
}
