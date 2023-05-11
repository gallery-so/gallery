import { PropsWithChildren } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { graphql, useFragment } from 'react-relay';

import { Typography } from '~/components/Typography';
import { NotificationSkeletonFragment$key } from '~/generated/NotificationSkeletonFragment.graphql';
import { getTimeSince } from '~/shared/utils/time';

type Props = PropsWithChildren<{
  onPress: () => void;
  notificationRef: NotificationSkeletonFragment$key;
}>;

export function NotificationSkeleton({ children, notificationRef, onPress }: Props) {
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

  return (
    <TouchableOpacity onPress={onPress} className="flex flex-row justify-between p-3">
      <View className="flex-1 ">
        <Text className="dark:text-white">{children}</Text>
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
    </TouchableOpacity>
  );
}

function UnseenDot({ ...props }) {
  return <View className="bg-activeBlue h-2 w-2 rounded-full" {...props}></View>;
}
