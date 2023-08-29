import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import { registerDevMenuItems } from 'expo-dev-menu';
import { useEffect } from 'react';

import { RootStackNavigatorProp } from '~/navigation/types';
import { getServerEnvironment } from '~/shared/utils/getServerEnvironment';

import { useLogout } from '../hooks/useLogout';

const isLocalServer = getServerEnvironment() === 'local';

export function DevMenuItems() {
  const navigation = useNavigation<RootStackNavigatorProp>();
  const [logout] = useLogout();

  useEffect(() => {
    const devMenuItems = [
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
      },
    ];
    if (isLocalServer) {
      devMenuItems.push({
        name: 'Debugger',
        callback: () => {
          navigation.navigate('Debugger');
        },
      });
    }
    registerDevMenuItems(devMenuItems);
  }, [logout, navigation]);

  return null;
}
