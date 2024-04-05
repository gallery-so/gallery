import { useNavigation } from '@react-navigation/native';
import { useWalletConnectModal } from '@walletconnect/modal-react-native';
import Constants from 'expo-constants';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import { useCallback } from 'react';
import { graphql } from 'react-relay';

import { useLogoutMutation } from '~/generated/useLogoutMutation.graphql';
import { RootStackNavigatorProp } from '~/navigation/types';
import { useReportError } from '~/shared/contexts/ErrorReportingContext';
import { ErrorWithSentryMetadata } from '~/shared/errors/ErrorWithSentryMetadata';
import { usePromisifiedMutation } from '~/shared/relay/usePromisifiedMutation';

import { magic } from '../magic';

export function useLogout(): [() => void, boolean] {
  const navigation = useNavigation<RootStackNavigatorProp>();
  const { provider } = useWalletConnectModal();

  const [mutate, isLoggingOut] = usePromisifiedMutation<useLogoutMutation>(graphql`
    mutation useLogoutMutation($token: String!) {
      logout(pushTokenToUnregister: $token) {
        ... on LogoutPayload {
          __typename
        }
      }
    }
  `);

  const pushToLandingScreen = useCallback(() => {
    navigation.reset({
      index: 0,
      routes: [{ name: 'Login', params: { screen: 'Landing' } }],
    });
  }, [navigation]);

  const reportError = useReportError();
  const logout = useCallback(async () => {
    try {
      magic.user.logout();
      provider?.disconnect();

      if (Constants.executionEnvironment === 'bare') {
        pushToLandingScreen();
        return;
      }

      // only go through official logout flow if user is using a real device, since we
      // need to de-register their push token (which doesn't exist for simulator)
      if (Device.isDevice) {
        const expoPushToken = await Notifications.getExpoPushTokenAsync({
          projectId: Constants.expoConfig?.extra?.eas.projectId,
        });
        const response = await mutate({
          variables: {
            token: expoPushToken.data,
          },
        });
        if (response.logout?.__typename !== 'LogoutPayload') {
          reportError(
            new ErrorWithSentryMetadata('Unexpected typename received from logout mutation', {
              typename: response.logout?.__typename,
            })
          );
        }
      }
      pushToLandingScreen();
    } catch (error) {
      if (error instanceof Error) {
        reportError(error);
      } else {
        reportError('Something unexpected went wrong while logging the user out');
      }
      pushToLandingScreen();
    }
  }, [mutate, provider, pushToLandingScreen, reportError]);

  return [logout, isLoggingOut];
}
