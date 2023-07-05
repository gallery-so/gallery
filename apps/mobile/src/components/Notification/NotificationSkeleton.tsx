import { PropsWithChildren, useCallback, useRef } from 'react';
import { Text, View } from 'react-native';
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
  queryRef: NotificationSkeletonQueryFragment$key;
  notificationRef: NotificationSkeletonFragment$key;
  responsibleUserRefs: NotificationSkeletonResponsibleUsersFragment$key;
}>;

export function NotificationSkeleton({
  onPress,
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
      className="flex flex-row justify-between p-3"
      eventElementId="Notification Row"
      eventName="Notification Row Clicked"
    >
      <View className="flex-1 flex-row space-x-1 items-start">
        <ProfilePictureBubblesWithCount
          eventElementId={null}
          eventName={null}
          onPress={handleBubblesPress}
          userRefs={responsibleUsers}
          totalCount={responsibleUserRefs.length}
        />

        <GalleryBottomSheetModal ref={bottomSheetRef} snapPoints={[350]}>
          <UserFollowList userRefs={responsibleUsers} queryRef={query} onUserPress={() => {}} />
        </GalleryBottomSheetModal>

        <Text className="dark:text-white mt-[1]">{children}</Text>
      </View>
      <View className="flex w-20 flex-row items-center justify-end space-x-2">
        <Typography
          className="text-metal text-xs"
          font={{ family: 'ABCDiatype', weight: 'Regular' }}
        >
          {getTimeSince(notification.updatedTime)}
        </Typography>
        {!notification.seen && <UnseenDot />}
      </View>
    </GalleryTouchableOpacity>
  );
}

function UnseenDot({ ...props }) {
  return <View className="bg-activeBlue h-2 w-2 rounded-full" {...props}></View>;
}
