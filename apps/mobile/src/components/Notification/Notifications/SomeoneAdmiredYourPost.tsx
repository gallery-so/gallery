import { useNavigation } from '@react-navigation/native';
import { useCallback, useMemo } from 'react';
import { Text } from 'react-native';
import { useFragment } from 'react-relay';
import { graphql } from 'relay-runtime';

import { NotificationSkeleton } from '~/components/Notification/NotificationSkeleton';
import { Typography } from '~/components/Typography';
import { SomeoneAdmiredYourPostFragment$key } from '~/generated/SomeoneAdmiredYourPostFragment.graphql';
import { SomeoneAdmiredYourPostQueryFragment$key } from '~/generated/SomeoneAdmiredYourPostQueryFragment.graphql';
import { MainTabStackNavigatorProp } from '~/navigation/types';
import { removeNullValues } from '~/shared/relay/removeNullValues';

type SomeoneAdmiredYourFeedEventProps = {
  queryRef: SomeoneAdmiredYourPostQueryFragment$key;
  notificationRef: SomeoneAdmiredYourPostFragment$key;
};

export function SomeoneAdmiredYourPost({
  notificationRef,
  queryRef,
}: SomeoneAdmiredYourFeedEventProps) {
  const query = useFragment(
    graphql`
      fragment SomeoneAdmiredYourPostQueryFragment on Query {
        ...NotificationSkeletonQueryFragment
      }
    `,
    queryRef
  );

  const notification = useFragment(
    graphql`
      fragment SomeoneAdmiredYourPostFragment on SomeoneAdmiredYourPostNotification {
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
        post {
          dbid
        }

        ...NotificationSkeletonFragment
      }
    `,
    notificationRef
  );

  const { post } = notification;

  const admirers = useMemo(() => {
    return removeNullValues(notification.admirers?.edges?.map((edge) => edge?.node));
  }, [notification.admirers?.edges]);

  const count = notification.count ?? 1;
  const firstAdmirer = admirers[0];

  const navigation = useNavigation<MainTabStackNavigatorProp>();
  const handlePress = useCallback(() => {
    if (post?.dbid) {
      navigation.navigate('Post', { postId: post.dbid });
    }
  }, [navigation, post?.dbid]);

  return (
    <NotificationSkeleton
      queryRef={query}
      onPress={handlePress}
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
          post
        </Typography>
      </Text>
    </NotificationSkeleton>
  );
}
