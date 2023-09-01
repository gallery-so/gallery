import AsyncStorage from '@react-native-async-storage/async-storage';

import { LoginStackNavigatorProp } from '~/navigation/types';

const KEY = 'notificationUpsellShown';
const SHOWN_VALUE = 'true';

export function markAsShown() {
  return AsyncStorage.setItem(KEY, SHOWN_VALUE);
}

export async function navigateToNotificationUpsellOrHomeScreen(
  navigation: LoginStackNavigatorProp
) {
  const shown = await AsyncStorage.getItem(KEY);

  if (shown === SHOWN_VALUE) {
    navigation.reset({
      index: 0,
      routes: [
        {
          name: 'MainTabs',
          params: {
            screen: 'HomeTab',
            params: {
              screen: 'Home',
              params: { screen: 'Curated', params: { isNewUser: true } },
            },
          },
        },
      ],
    });
    return;
  } else {
    navigation.reset({
      index: 0,
      routes: [{ name: 'Login', params: { screen: 'NotificationUpsell' } }],
    });
  }
}
