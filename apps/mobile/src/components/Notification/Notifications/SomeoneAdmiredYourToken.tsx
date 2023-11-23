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
import { useGetSinglePreviewImage } from '~/shared/relay/useGetPreviewImages';

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
        token {
          dbid
          name

          ...useGetPreviewImagesSingleFragment
        }

        admirers(last: 1) {
          edges {
            node {
              __typename
              username

              ...NotificationSkeletonResponsibleUsersFragment
            }
          }
        }
        ...NotificationSkeletonFragment
      }
    `,
    notificationRef
  );

  const admirers = useMemo(() => {
    return removeNullValues(notification.admirers?.edges?.map((edge) => edge?.node));
  }, [notification.admirers?.edges]);

  const count = notification.count ?? 1;
  const firstAdmirer = admirers[0];

  //  TODO: test navigation to token from notification is working when BE work done
  const { token } = notification;
  const navigation = useNavigation<MainTabStackNavigatorProp>();

  if (!token) {
    throw new Error('There is no token in notification');
  }

  const imageUrl = useGetSinglePreviewImage({
    tokenRef: token,
    preferStillFrameFromGif: true,
    size: 'large',
    // we're simply using the URL for warming the cache;
    // no need to throw an error if image is invalid
    shouldThrow: false,
  });

  const navigateToNftDetail = useCallback(() => {
    if (token) {
      navigation.navigate('UniversalNftDetail', {
        cachedPreviewAssetUrl: imageUrl ?? '',
        tokenId: token.dbid,
      });
    }
  }, [navigation, imageUrl, token]);

  return (
    <NotificationSkeleton
      queryRef={query}
      onPress={navigateToNftDetail}
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
          numberOfLines={2}
        >
          {token.name ?? 'item'}
        </Typography>
      </Text>
    </NotificationSkeleton>
  );
}
