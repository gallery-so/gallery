import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import { registerDevMenuItems } from 'expo-dev-menu';
import { useEffect } from 'react';

import { RootStackNavigatorProp } from '~/navigation/types';

import { useLogout } from '../hooks/useLogout';

export function DevMenuItems() {
  const navigation = useNavigation<RootStackNavigatorProp>();
  const [logout] = useLogout();

  useEffect(() => {
    registerDevMenuItems([
      {
        name: 'Design System',
        callback: () => {
          navigation.navigate('DesignSystemButtons');
        },
      },
      {
        name: 'Debugger',
        callback: () => {
          navigation.navigate('Dev');
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
      },
    ]);
  }, [logout, navigation]);

  return null;
}
