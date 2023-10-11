import { useNavigation } from '@react-navigation/native';
import { useCallback, useMemo } from 'react';
import { Text } from 'react-native';
import { useFragment } from 'react-relay';
import { graphql } from 'relay-runtime';

import { NotificationSkeleton } from '~/components/Notification/NotificationSkeleton';
import { Typography } from '~/components/Typography';
import { SomeoneAdmiredYourTokenFragment$key } from '~/generated/SomeoneAdmiredYourTokenFragment.graphql';
import { SomeoneAdmiredYourTokenQueryFragment$key } from '~/generated/SomeoneAdmiredYourTokenQueryFragment.graphql';
import { MainTabStackNavigatorProp } from '~/navigation/types';
import { removeNullValues } from '~/shared/relay/removeNullValues';

type SomeoneAdmiredYourTokenProps = {
  queryRef: SomeoneAdmiredYourTokenQueryFragment$key;
  notificationRef: SomeoneAdmiredYourTokenFragment$key;
};

export function SomeoneAdmiredYourToken({
  notificationRef,
  queryRef,
}: SomeoneAdmiredYourTokenProps) {
  const query = useFragment(
    graphql`
      fragment SomeoneAdmiredYourTokenQueryFragment on Query {
        ...NotificationSkeletonQueryFragment
      }
    `,
    queryRef
  );

  const notification = useFragment(
    graphql`
      fragment SomeoneAdmiredYourTokenFragment on SomeoneAdmiredYourTokenNotification {
        count

        admirers(last: 1) {
          edges {
            node {
              __typename
              username

              ...NotificationSkeletonResponsibleUsersFragment
            }
          }
        }
        token {
          dbid
        }

        ...NotificationSkeletonFragment
      }
    `,
    notificationRef
  );

  const { token } = notification;

  const admirers = useMemo(() => {
    return removeNullValues(notification.admirers?.edges?.map((edge) => edge?.node));
  }, [notification.admirers?.edges]);

  const count = notification.count ?? 1;
  const firstAdmirer = admirers[0];

/*
  const navigation = useNavigation<MainTabStackNavigatorProp>();
  const handlePress = useCallback(() => {
    if (token?.dbid) {
      navigation.navigate('Token', {
          cachedPreviewAssetUrl: fallbackTokenUrl,
          tokenId: token.dbid,
          collectionId: collectionToken?.collection?.dbid ?? null,
        });
    }
  }, [navigation, token?.dbid]);

*/
  return (
    <NotificationSkeleton
      queryRef={query}
      onPress={() => {}}
      responsibleUserRefs={admirers}
      notificationRef={notification}
    >
      <Text>
        <Typography
          font={{
            family: 'ABCDiatype',
            weight: 'Bold',
          }}
          className="text-sm"
        >
          {count > 1
            ? `${notification.count} collectors`
            : firstAdmirer
            ? firstAdmirer?.username
            : 'Someone'}
        </Typography>{' '}
        <Typography
          font={{
            family: 'ABCDiatype',
            weight: 'Regular',
          }}
          className="text-sm"
        >
          admired your
        </Typography>{' '}
        <Typography
          font={{
            family: 'ABCDiatype',
            weight: 'Bold',
          }}
          className="text-sm"
        >
          token
        </Typography>
      </Text>
    </NotificationSkeleton>
  );
}
