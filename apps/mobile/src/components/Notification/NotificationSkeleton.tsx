import { ResizeMode } from 'expo-av';
import { PropsWithChildren, useCallback, useRef } from 'react';
import { Text, View } from 'react-native';
import FastImage from 'react-native-fast-image';
import { graphql, useFragment } from 'react-relay';

import {
  GalleryBottomSheetModal,
  GalleryBottomSheetModalType,
} from '~/components/GalleryBottomSheet/GalleryBottomSheetModal';
import { ProfilePictureBubblesWithCount } from '~/components/ProfileView/ProfileViewSharedInfo/ProfileViewSharedFollowers';
import { Typography } from '~/components/Typography';
import { UserFollowList } from '~/components/UserFollowList/UserFollowList';
import { NotificationSkeletonFragment$key } from '~/generated/NotificationSkeletonFragment.graphql';
import { NotificationSkeletonQueryFragment$key } from '~/generated/NotificationSkeletonQueryFragment.graphql';
import { NotificationSkeletonResponsibleUsersFragment$key } from '~/generated/NotificationSkeletonResponsibleUsersFragment.graphql';
import { getTimeSince } from '~/shared/utils/time';

import { GalleryTouchableOpacity } from '../GalleryTouchableOpacity';

type Props = PropsWithChildren<{
  onPress: () => void;
  tokenUrl?: string;
  queryRef: NotificationSkeletonQueryFragment$key;
  notificationRef: NotificationSkeletonFragment$key;
  responsibleUserRefs: NotificationSkeletonResponsibleUsersFragment$key;
}>;

export function NotificationSkeleton({
  onPress,
  tokenUrl,
  children,
  queryRef,
  notificationRef,
  responsibleUserRefs = [],
}: Props) {
  const query = useFragment(
    graphql`
      fragment NotificationSkeletonQueryFragment on Query {
        ...UserFollowListQueryFragment
      }
    `,
    queryRef
  );

  const responsibleUsers = useFragment(
    graphql`
      fragment NotificationSkeletonResponsibleUsersFragment on GalleryUser @relay(plural: true) {
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
      }
    `,
    notificationRef
  );

  const bottomSheetRef = useRef<GalleryBottomSheetModalType | null>(null);
  const handleBubblesPress = useCallback(() => {
    bottomSheetRef.current?.present();
  }, []);

  return (
    <GalleryTouchableOpacity
      onPress={onPress}
      className="flex flex-row justify-between p-4"
      eventElementId="Notification Row"
      eventName="Notification Row Clicked"
    >
      <View className="flex-1 flex-row space-x-2 items-center">
        <ProfilePictureBubblesWithCount
          eventElementId="Notification Row PFP Bubbles"
          eventName="Notification Row PFP Bubbles Pressed"
          onPress={handleBubblesPress}
          userRefs={responsibleUsers}
          totalCount={responsibleUserRefs.length}
          size="md"
        />

        <GalleryBottomSheetModal ref={bottomSheetRef} snapPoints={[350]}>
          <UserFollowList userRefs={responsibleUsers} queryRef={query} onUserPress={() => {}} />
        </GalleryBottomSheetModal>

        <Text className="dark:text-white mt-[1] pr-1">{children}</Text>
      </View>
      <View className="flex flex-row items-center justify-between space-x-2">
        {tokenUrl ? (
          <FastImage
            style={{
              width: 56,
              height: 56,
            }}
            source={{ uri: tokenUrl }}
            resizeMode={ResizeMode.COVER}
          />
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
    </GalleryTouchableOpacity>
  );
}

export function UnseenDot({ ...props }) {
  return <View className="bg-activeBlue h-2 w-2 rounded-full" {...props}></View>;
}
