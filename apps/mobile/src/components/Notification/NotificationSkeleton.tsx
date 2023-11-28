import { useNavigation } from '@react-navigation/native';
import { PropsWithChildren, useCallback, useMemo, useRef } from 'react';
import { Text, View } from 'react-native';
import { graphql, useFragment } from 'react-relay';

import { FollowButton } from '~/components/FollowButton';
import {
  GalleryBottomSheetModal,
  GalleryBottomSheetModalType,
} from '~/components/GalleryBottomSheet/GalleryBottomSheetModal';
import { ProfilePictureBubblesWithCount } from '~/components/ProfileView/ProfileViewSharedInfo/ProfileViewSharedFollowers';
import { UserFollowList } from '~/components/UserFollowList/UserFollowList';
import { NotificationSkeletonFragment$key } from '~/generated/NotificationSkeletonFragment.graphql';
import { NotificationSkeletonQueryFragment$key } from '~/generated/NotificationSkeletonQueryFragment.graphql';
import { NotificationSkeletonResponsibleUsersFragment$key } from '~/generated/NotificationSkeletonResponsibleUsersFragment.graphql';
import { MainTabStackNavigatorProp } from '~/navigation/types';
import { contexts } from '~/shared/analytics/constants';

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
        ... on SomeoneAdmiredYourTokenNotification {
          token {
            ...NotificationPostPreviewWithBoundaryFragment
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
        ... on SomeoneMentionedYouNotification {
          mentionSource {
            __typename
            ... on Post {
              tokens {
                ...NotificationPostPreviewWithBoundaryFragment
              }
            }
            ... on Comment {
              source {
                ... on Post {
                  tokens {
                    ...NotificationPostPreviewWithBoundaryFragment
                  }
                }
              }
            }
          }
        }
        ... on SomeonePostedYourWorkNotification {
          post {
            tokens {
              ...NotificationPostPreviewWithBoundaryFragment
            }
          }
        }
        ... on SomeoneRepliedToYourCommentNotification {
          comment {
            source {
              ... on Post {
                tokens {
                  ...NotificationPostPreviewWithBoundaryFragment
                }
              }
            }
          }
        }
        ... on SomeoneYouFollowPostedTheirFirstPostNotification {
          post {
            tokens {
              ...NotificationPostPreviewWithBoundaryFragment
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
      notification.__typename === 'SomeoneCommentedOnYourPostNotification' ||
      notification.__typename === 'SomeonePostedYourWorkNotification' ||
      notification.__typename === 'SomeoneYouFollowPostedTheirFirstPostNotification'
    ) {
      return notification.post?.tokens?.[0];
    }

    if (notification.__typename === 'SomeoneMentionedYouNotification') {
      if (notification.mentionSource?.__typename === 'Post') {
        return notification.mentionSource.tokens?.[0];
      }

      if (notification.mentionSource?.__typename === 'Comment') {
        return notification.mentionSource.source?.tokens?.[0];
      }
    }

    if (notification.__typename === 'SomeoneRepliedToYourCommentNotification') {
      return notification.comment?.source?.tokens?.[0];
    }

    return null;
  }, [notification]);

  const galleryToken = useMemo(() => {
    if (notification.__typename === 'SomeoneAdmiredYourTokenNotification') {
      return notification?.token;
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
      eventContext={contexts.Notifications}
      properties={{ type: notification.__typename }}
    >
      <View className="flex-1 flex-row items-center">
        {!notification.seen && (
          <View className="w-[14px] flex-row space-x-2 items-center justify-start">
            <UnseenDot />
          </View>
        )}
        <View className="mr-2">
          <ProfilePictureBubblesWithCount
            eventElementId="Notification Row PFP Bubbles"
            eventName="Notification Row PFP Bubbles Pressed"
            eventContext={contexts.Notifications}
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
        {galleryToken ? (
          <View className="w-[56px] h-[56px]">
            <NotificationPostPreviewWithBoundary tokenRef={galleryToken} />
          </View>
        ) : (
          <View />
        )}
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
