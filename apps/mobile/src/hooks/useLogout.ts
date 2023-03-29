import { useNavigation } from '@react-navigation/native';
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

  const [mutate, isLoggingOut] = usePromisifiedMutation<useLogoutMutation>(graphql`
    mutation useLogoutMutation {
      logout {
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
      const response = await mutate({ variables: {} });

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
  }, [mutate, navigation, reportError]);

  return [logout, isLoggingOut];
}
