import { useNavigation } from '@react-navigation/native';
import { useCallback, useMemo } from 'react';
import { Text } from 'react-native';
import { graphql, useFragment } from 'react-relay';

import NotificationBottomSheetUserList from '~/components/Notification/NotificationBottomSheetUserList';
import { NotificationSkeleton } from '~/components/Notification/NotificationSkeleton';
import { Typography } from '~/components/Typography';
import { useBottomSheetModalActions } from '~/contexts/BottomSheetModalContext';
import { SomeoneViewedYourGalleryFragment$key } from '~/generated/SomeoneViewedYourGalleryFragment.graphql';
import { SomeoneViewedYourGalleryQueryFragment$key } from '~/generated/SomeoneViewedYourGalleryQueryFragment.graphql';
import { MainTabStackNavigatorProp } from '~/navigation/types';
import { removeNullValues } from '~/shared/relay/removeNullValues';

type Props = {
  queryRef: SomeoneViewedYourGalleryQueryFragment$key;
  notificationRef: SomeoneViewedYourGalleryFragment$key;
};

export function SomeoneViewedYourGallery({ notificationRef, queryRef }: Props) {
  const query = useFragment(
    graphql`
      fragment SomeoneViewedYourGalleryQueryFragment on Query {
        ...NotificationSkeletonQueryFragment
      }
    `,
    queryRef
  );

  const notification = useFragment(
    graphql`
      fragment SomeoneViewedYourGalleryFragment on SomeoneViewedYourGalleryNotification {
        __typename
        id

        nonUserViewerCount

        userViewers(last: 1) {
          pageInfo {
            total
          }

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

  const viewers = useMemo(() => {
    return removeNullValues(notification.userViewers?.edges?.map((edge) => edge?.node));
  }, [notification.userViewers?.edges]);

  const userViewerCount = notification.userViewers?.pageInfo?.total ?? 0;
  const nonUserViewerCount = notification.nonUserViewerCount ?? 0;
  const totalViewCount = userViewerCount + nonUserViewerCount;
  const lastViewer = notification.userViewers?.edges?.[0]?.node;

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
    if (userViewerCount > 1) {
      showBottomSheetModal({
        content: (
          <NotificationBottomSheetUserList
            onUserPress={handleUserPress}
            notificationId={notification.id}
          />
        ),
      });
    } else if (lastViewer?.username) {
      navigation.navigate('Profile', { username: lastViewer.username });
    }
  }, [
    handleUserPress,
    lastViewer?.username,
    navigation,
    notification.id,
    showBottomSheetModal,
    userViewerCount,
  ]);

  const inner = useMemo(() => {
    if (userViewerCount > 0) {
      if (totalViewCount === 1) {
        return (
          <Text>
            {lastViewer ? <UsernameText text={lastViewer.username ?? ''} /> : 'Someone'} {''}
            viewed your gallery
          </Text>
        );
      } else {
        const remainingViewCount = totalViewCount - 1;

        return (
          <Text>
            {lastViewer ? <UsernameText text={lastViewer.username ?? ''} /> : 'Someone'} and{' '}
            {remainingViewCount} {remainingViewCount === 1 ? 'other' : 'others'} viewed your gallery
          </Text>
        );
      }
    } else if (nonUserViewerCount > 0) {
      if (nonUserViewerCount === 1) {
        return (
          <Text>
            <UsernameText text="An anonymous user" /> viewed your gallery
          </Text>
        );
      } else {
        return (
          <Text>
            <UsernameText text={`${nonUserViewerCount} anonymous users`} />
            viewed your gallery
          </Text>
        );
      }
    }

    // If we get here, it means the backend is failing for some reason
    return (
      <Text>
        <UsernameText text="Someone" /> <Text>viewed your gallery</Text>
      </Text>
    );
  }, [lastViewer, nonUserViewerCount, totalViewCount, userViewerCount]);

  return (
    <NotificationSkeleton
      queryRef={query}
      onPress={handlePress}
      responsibleUserRefs={viewers}
      notificationRef={notification}
    >
      {inner}
    </NotificationSkeleton>
  );
}

type UsernameTextProps = {
  text: string;
};

function UsernameText({ text }: UsernameTextProps) {
  return (
    <Typography
      font={{
        family: 'ABCDiatype',
        weight: 'Bold',
      }}
      className="text-sm"
    >
      {text}
    </Typography>
  );
}
