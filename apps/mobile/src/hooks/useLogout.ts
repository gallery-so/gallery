import { useNavigation } from '@react-navigation/native';
import { useWalletConnectModal } from '@walletconnect/modal-react-native';
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

  const reportError = useReportError();
  const logout = useCallback(async () => {
    try {
      magic.user.logout();
      provider?.disconnect();
      const expoPushToken = await Notifications.getExpoPushTokenAsync();
      const response = await mutate({
        variables: {
          token: expoPushToken.data,
        },
      });

      if (response.logout?.__typename === 'LogoutPayload') {
        navigation.reset({ index: 0, routes: [{ name: 'Login', params: { screen: 'Landing' } }] });
      } else {
        reportError(
          new ErrorWithSentryMetadata('Unexpected typename received from logout mutation', {
            typename: response.logout?.__typename,
          })
        );
      }
    } catch (error) {
      if (error instanceof Error) {
        reportError(error);
      } else {
        reportError('Something unexpected went wrong while logging the user out');
      }
    }
  }, [mutate, navigation, provider, reportError]);

  return [logout, isLoggingOut];
}
