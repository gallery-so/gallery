import { captureException } from '@sentry/react-native';
import Constants from 'expo-constants';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { commitMutation, graphql } from 'relay-runtime';
import RelayModernEnvironment from 'relay-runtime/lib/store/RelayModernEnvironment';

import { registerNotificationTokenMutation } from '~/generated/registerNotificationTokenMutation.graphql';

const fallbackErrorMessage =
  'Something unexpected went wrong while trying to register you for push notifications.';

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
    return { kind: 'failure', reason: "You're not on a real device silly!" };
  }

  const existingPermissions = await Notifications.getPermissionsAsync();

  if (shouldPrompt && existingPermissions.status !== 'granted') {
    const requestedPermissions = await Notifications.requestPermissionsAsync();

    if (requestedPermissions.status !== 'granted') {
      // They still did not give us permission
      return { kind: 'did_not_register' };
    }
  }

  const expoPushToken = await Notifications.getExpoPushTokenAsync({
    projectId: Constants.expoConfig?.extra?.eas.projectId,
  });

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
  return new Promise<Result>((resolve) => {
    commitMutation<registerNotificationTokenMutation>(relayEnvironment, {
      mutation: graphql`
        mutation registerNotificationTokenMutation($token: String!) {
          registerUserPushToken(pushToken: $token) {
            ... on RegisterUserPushTokenPayload {
              __typename
            }

            ... on Error {
              __typename
              message
            }
          }
        }
      `,
      variables: {
        token: expoPushToken.data,
      },
      onCompleted: (response) => {
        const { registerUserPushToken } = response;

        if (registerUserPushToken?.__typename === 'RegisterUserPushTokenPayload') {
          resolve({ kind: 'registered' });
        } else if (registerUserPushToken) {
          resolve({
            kind: 'failure',
            reason: registerUserPushToken.message ?? fallbackErrorMessage,
          });
        }
      },
      onError: (error) => {
        captureException(error);

        resolve({
          kind: 'failure',
          reason: fallbackErrorMessage,
        });
      },
    });
  });
}
