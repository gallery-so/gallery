import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import { registerDevMenuItems } from 'expo-dev-menu';
import { useEffect } from 'react';

import { env } from '~/env/runtime';
import { RootStackNavigatorProp } from '~/navigation/types';

import { useLogout } from '../hooks/useLogout';

export function DevMenuItems() {
  const navigation = useNavigation<RootStackNavigatorProp>();
  const [logout] = useLogout();

  useEffect(() => {
    const devMenuItems = [];
    if (env.EXPO_PUBLIC_ENV !== 'prod') {
      devMenuItems.push({
        name: 'Debugger',
        callback: () => {
          navigation.navigate('Debugger');
        },
      });
    }
    devMenuItems.push(
      {
        name: 'Design System',
        callback: () => {
          navigation.navigate('DesignSystemButtons');
        },
      },
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
      }
    );

    registerDevMenuItems(devMenuItems);
  }, [logout, navigation]);

  return null;
}
