import { useCallback } from 'react';
import { View } from 'react-native';
import { TouchableOpacity } from 'react-native';
import { graphql, useFragment } from 'react-relay';

import { NotificationFragment$key } from '~/generated/NotificationFragment.graphql';
import { NotificationInnerFragment$key } from '~/generated/NotificationInnerFragment.graphql';
import { NotificationQueryFragment$key } from '~/generated/NotificationQueryFragment.graphql';
import { getTimeSince } from '~/shared/utils/time';

import { Typography } from '../Typography';
import { SomeoneAdmiredYourFeedEvent } from './Notifications/SomeoneAdmiredYourFeedEvent';
import { SomeoneCommentedOnYourFeedEvent } from './Notifications/SomeoneCommentedOnYourFeedEvent';
import { SomeoneFollowedYou } from './Notifications/SomeoneFollowedYou';
import { SomeoneFollowedYouBack } from './Notifications/SomeoneFollowedYouBack';
import { SomeoneViewedYourGallery } from './Notifications/SomeoneViewedYourGallery';
import { useClearNotifications } from './useClearNotification';

type Props = {
  notificationRef: NotificationFragment$key;
  queryRef: NotificationQueryFragment$key;
};

export function Notification({ notificationRef, queryRef }: Props) {
  const notification = useFragment(
    graphql`
      fragment NotificationFragment on Notification {
        __typename
        seen
        updatedTime

        ...NotificationInnerFragment
      }
    `,
    notificationRef
  );

  const query = useFragment(
    graphql`
      fragment NotificationQueryFragment on Query {
        viewer {
          ... on Viewer {
            user {
              dbid
            }
          }
        }
      }
    `,
    queryRef
  );

  const userId = query.viewer?.user?.dbid ?? '';

  const clearNotification = useClearNotifications();
  const handlePress = useCallback(() => {
    if (!notification.seen) {
      clearNotification(userId);
    }

    // TODO: Open a page based on the notification type
  }, [clearNotification, notification.seen, userId]);

  return (
    <TouchableOpacity onPress={handlePress} className="flex flex-row justify-between p-3">
      <View className="w-80">
        <NotificationInner notificationRef={notification} />
      </View>
      <View className="flex flex-row items-center justify-end space-x-2">
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

type NotificationInnerProps = {
  notificationRef: NotificationInnerFragment$key;
};

function NotificationInner({ notificationRef }: NotificationInnerProps) {
  const notification = useFragment(
    graphql`
      fragment NotificationInnerFragment on Notification {
        ... on SomeoneFollowedYouNotification {
          __typename
          ...SomeoneFollowedYouFragment
        }

        ... on SomeoneFollowedYouBackNotification {
          __typename
          ...SomeoneFollowedYouBackFragment
        }

        ... on SomeoneAdmiredYourFeedEventNotification {
          __typename
          ...SomeoneAdmiredYourFeedEventFragment
        }

        ... on SomeoneCommentedOnYourFeedEventNotification {
          __typename
          ...SomeoneCommentedOnYourFeedEventFragment
        }

        ... on SomeoneViewedYourGalleryNotification {
          __typename
          ...SomeoneViewedYourGalleryFragment
        }
      }
    `,
    notificationRef
  );

  if (notification.__typename === 'SomeoneViewedYourGalleryNotification') {
    return <SomeoneViewedYourGallery notificationRef={notification} />;
  } else if (notification.__typename === 'SomeoneAdmiredYourFeedEventNotification') {
    return <SomeoneAdmiredYourFeedEvent notificationRef={notification} />;
  } else if (notification.__typename === 'SomeoneFollowedYouBackNotification') {
    return <SomeoneFollowedYouBack notificationRef={notification} />;
  } else if (notification.__typename === 'SomeoneFollowedYouNotification') {
    return <SomeoneFollowedYou notificationRef={notification} />;
  } else if (notification.__typename === 'SomeoneCommentedOnYourFeedEventNotification') {
    return <SomeoneCommentedOnYourFeedEvent notificationRef={notification} />;
  }

  return <View />;
}

function UnseenDot({ ...props }) {
  return <View className="bg-activeBlue h-2 w-2 rounded-full" {...props}></View>;
}
