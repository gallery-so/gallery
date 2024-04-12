import { useNavigation } from '@react-navigation/native';
import { useCallback, useMemo } from 'react';
import { Text } from 'react-native';
import { useFragment } from 'react-relay';
import { graphql } from 'relay-runtime';

import NotificationBottomSheetUserList from '~/components/Notification/NotificationBottomSheetUserList';
import { NotificationSkeleton } from '~/components/Notification/NotificationSkeleton';
import { Typography } from '~/components/Typography';
import { useBottomSheetModalActions } from '~/contexts/BottomSheetModalContext';
import { SomeoneFollowedYouBackFragment$key } from '~/generated/SomeoneFollowedYouBackFragment.graphql';
import { SomeoneFollowedYouBackQueryFragment$key } from '~/generated/SomeoneFollowedYouBackQueryFragment.graphql';
import { MainTabStackNavigatorProp } from '~/navigation/types';
import { removeNullValues } from '~/shared/relay/removeNullValues';

type SomeoneFollowedYouBackProps = {
  queryRef: SomeoneFollowedYouBackQueryFragment$key;
  notificationRef: SomeoneFollowedYouBackFragment$key;
};

export function SomeoneFollowedYouBack({ notificationRef, queryRef }: SomeoneFollowedYouBackProps) {
  const query = useFragment(
    graphql`
      fragment SomeoneFollowedYouBackQueryFragment on Query {
        ...NotificationSkeletonQueryFragment
      }
    `,
    queryRef
  );

  const notification = useFragment(
    graphql`
      fragment SomeoneFollowedYouBackFragment on SomeoneFollowedYouBackNotification {
        id
        count

        followers(last: 1) {
          edges {
            node {
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

  const followers = useMemo(() => {
    return removeNullValues(notification.followers?.edges?.map((edge) => edge?.node));
  }, [notification.followers?.edges]);

  const count = notification.count ?? 1;
  const lastFollower = notification.followers?.edges?.[0]?.node;

  const navigation = useNavigation<MainTabStackNavigatorProp>();

  const { showBottomSheetModal, hideBottomSheetModal } = useBottomSheetModalActions();

  const handleUserPress = useCallback(
    (username: string) => {
      hideBottomSheetModal();
      navigation.navigate('Profile', { username });
    },
    [hideBottomSheetModal, navigation]
  );

  const handlePress = useCallback(() => {
    if (count > 1) {
      showBottomSheetModal({
        content: (
          <NotificationBottomSheetUserList
            onUserPress={handleUserPress}
            notificationId={notification.id}
          />
        ),
      });
    } else if (lastFollower?.username) {
      navigation.navigate('Profile', { username: lastFollower.username });
    }
  }, [
    count,
    handleUserPress,
    lastFollower?.username,
    navigation,
    notification.id,
    showBottomSheetModal,
  ]);

  return (
    <NotificationSkeleton
      queryRef={query}
      onPress={handlePress}
      notificationRef={notification}
      responsibleUserRefs={followers}
    >
      <Text className="text-sm">
        <Typography
          font={{
            family: 'ABCDiatype',
            weight: 'Bold',
          }}
          className="text-sm"
        >
          {count > 1 ? `${count} collectors` : `${lastFollower?.username ?? 'Someone'}`}
        </Typography>{' '}
        followed you back
      </Text>
    </NotificationSkeleton>
  );
}
