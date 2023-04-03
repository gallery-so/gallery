import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { commitMutation, graphql } from 'relay-runtime';
import RelayModernEnvironment from 'relay-runtime/lib/store/RelayModernEnvironment';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

type Args = {
  shouldPrompt: boolean;
  relayEnvironment: RelayModernEnvironment;
};

type Result =
  | {
      kind: 'registered';
    }
  | { kind: 'did_not_register' }
  | { kind: 'failure'; reason: string };

export async function registerNotificationToken({
  shouldPrompt,
  relayEnvironment,
}: Args): Promise<Result> {
  if (!Device.isDevice) {
    // User is not on a physical device.
    return { kind: 'did_not_register' };
  }

  const existingPermissions = await Notifications.getPermissionsAsync();

  if (shouldPrompt && existingPermissions.status !== 'granted') {
    const requestedPermissions = await Notifications.requestPermissionsAsync();

    if (requestedPermissions.status !== 'granted') {
      // They still did not give us permission
      return { kind: 'did_not_register' };
    }
  }

  const expoPushToken = await Notifications.getExpoPushTokenAsync();

  // On Android, you have to setup a notification channel.
  if (Platform.OS === 'android') {
    Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],

      // https://developer.android.com/reference/android/app/NotificationChannel#setLightColor(int)
      lightColor: '#FFF',
    });
  }

  // Execute a mutation to register the token with our backend.
  // commitMutation(relayEnvironment, {
  //   mutation: graphql`
  //     mutation registerNotificationTokenMutation($input: RegisterNotificationTokenInput!) {
  //
  //     }
  //   `,
  //   variables: {},
  // });

  return { kind: 'registered' };
  // return expoPushToken.data;
}
