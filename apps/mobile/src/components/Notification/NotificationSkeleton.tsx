import { useNavigation } from '@react-navigation/native';
import { PropsWithChildren, useCallback, useMemo, useRef } from 'react';
import { Text, View } from 'react-native';
import { graphql, useFragment } from 'react-relay';

import {
  GalleryBottomSheetModal,
  GalleryBottomSheetModalType,
} from '~/components/GalleryBottomSheet/GalleryBottomSheetModal';
import { FollowButton } from '~/components/FollowButton';
import { ProfilePictureBubblesWithCount } from '~/components/ProfileView/ProfileViewSharedInfo/ProfileViewSharedFollowers';
import { Typography } from '~/components/Typography';
import { UserFollowList } from '~/components/UserFollowList/UserFollowList';
import { NotificationSkeletonFragment$key } from '~/generated/NotificationSkeletonFragment.graphql';
import { NotificationSkeletonQueryFragment$key } from '~/generated/NotificationSkeletonQueryFragment.graphql';
import { NotificationSkeletonResponsibleUsersFragment$key } from '~/generated/NotificationSkeletonResponsibleUsersFragment.graphql';
import { MainTabStackNavigatorProp } from '~/navigation/types';
import { getTimeSince } from '~/shared/utils/time';

import { GalleryTouchableOpacity } from '../GalleryTouchableOpacity';
import { NotificationPostPreviewWithBoundary } from './NotificationPostPreview';

type Props = PropsWithChildren<{
  onPress: () => void;
  queryRef: NotificationSkeletonQueryFragment$key;
  notificationRef: NotificationSkeletonFragment$key;
  responsibleUserRefs: NotificationSkeletonResponsibleUsersFragment$key;
  shouldShowFollowBackButton?: boolean;
}>;

export function NotificationSkeleton({
  onPress,
  children,
  queryRef,
  notificationRef,
  shouldShowFollowBackButton = false,
  responsibleUserRefs = [],
}: Props) {
  const query = useFragment(
    graphql`
      fragment NotificationSkeletonQueryFragment on Query {
        ...UserFollowListQueryFragment
        ...FollowButtonQueryFragment
      }
    `,
    queryRef
  );

  const responsibleUsers = useFragment(
    graphql`
      fragment NotificationSkeletonResponsibleUsersFragment on GalleryUser @relay(plural: true) {
        username @required(action: THROW)
        ...UserFollowListFragment
        ...ProfileViewSharedFollowersBubblesFragment
      }
    `,
    responsibleUserRefs
  );

  const notification = useFragment(
    graphql`
      fragment NotificationSkeletonFragment on Notification {
        __typename
        seen
        updatedTime
        ... on SomeoneAdmiredYourPostNotification {
          post {
            tokens {
              ...NotificationPostPreviewWithBoundaryFragment
            }
          }
        }
        ... on SomeoneCommentedOnYourPostNotification {
          post {
            tokens {
              ...NotificationPostPreviewWithBoundaryFragment
            }
          }
        }
        ... on SomeoneFollowedYouNotification {
          followers(last: 1) {
            edges {
              node {
                ...FollowButtonUserFragment
              }
            }
          }
        }
      }
    `,
    notificationRef
  );
  const navigation = useNavigation<MainTabStackNavigatorProp>();

  const bottomSheetRef = useRef<GalleryBottomSheetModalType | null>(null);

  const handleNavigateToProfile = useCallback(
    (username: string) => {
      navigation.navigate('Profile', { username });
    },
    [navigation]
  );

  const handleBubblesPress = useCallback(() => {
    if (responsibleUsers.length === 0) {
      return;
    }

    if (responsibleUsers.length > 1) {
      bottomSheetRef.current?.present();
      return;
    }

    const firstUser = responsibleUsers[0];

    if (firstUser) {
      handleNavigateToProfile(firstUser.username);
    }
  }, [handleNavigateToProfile, responsibleUsers]);

  const postToken = useMemo(() => {
    if (
      notification.__typename === 'SomeoneAdmiredYourPostNotification' ||
      notification.__typename === 'SomeoneCommentedOnYourPostNotification'
    ) {
      return notification.post?.tokens?.[0];
    }
    return null;
  }, [notification]);

  const lastFollower = useMemo(() => notification.followers?.edges?.[0]?.node, [notification]);

  return (
    <GalleryTouchableOpacity
      onPress={onPress}
      className="flex flex-row justify-between p-4"
      eventElementId="Notification Row"
      eventName="Notification Row Clicked"
    >
      <View className="flex-1 flex-row space-x-1 items-center">
        <View className="mr-1">
          <ProfilePictureBubblesWithCount
            eventElementId="Notification Row PFP Bubbles"
            eventName="Notification Row PFP Bubbles Pressed"
            onPress={handleBubblesPress}
            userRefs={responsibleUsers}
            totalCount={responsibleUserRefs.length}
            size="md"
          />
        </View>
        <Text className="dark:text-white mt-[1] pr-1 flex-1">{children}</Text>
      </View>
      {shouldShowFollowBackButton && lastFollower && (
        <View className="flex justify-center">
          <FollowButton queryRef={query} userRef={lastFollower} />
        </View>
      )}
      <View className="flex flex-row items-center justify-between ${postToken ? 'space-x-2' : ''}">
        {postToken ? (
          <View className="w-[56px] h-[56px]">
            <NotificationPostPreviewWithBoundary tokenRef={postToken} />
          </View>
        ) : (
          <View />
        )}
        <View
          className={`w-[35px] flex-row space-x-2 items-center ${
            !notification.seen ? 'justify-between' : 'justify-end'
          }`}
        >
          <Typography
            className="text-metal text-xs"
            font={{ family: 'ABCDiatype', weight: 'Regular' }}
          >
            {getTimeSince(notification.updatedTime)}
          </Typography>
          {!notification.seen && <UnseenDot />}
        </View>
      </View>
      <GalleryBottomSheetModal ref={bottomSheetRef} snapPoints={[350]}>
        <UserFollowList
          userRefs={responsibleUsers}
          queryRef={query}
          onUserPress={handleNavigateToProfile}
        />
      </GalleryBottomSheetModal>
    </GalleryTouchableOpacity>
  );
}

export function UnseenDot({ ...props }) {
  return <View className="bg-activeBlue h-2 w-2 rounded-full" {...props}></View>;
}
