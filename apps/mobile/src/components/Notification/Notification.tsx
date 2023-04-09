import { View } from 'react-native';
import { graphql, useFragment } from 'react-relay';

import { NotificationFragment$key } from '~/generated/NotificationFragment.graphql';
import { NotificationInnerFragment$key } from '~/generated/NotificationInnerFragment.graphql';
import { getTimeSince } from '~/shared/utils/time';

import { Typography } from '../Typography';
import { SomeoneAdmiredYourFeedEvent } from './Notifications/SomeoneAdmiredYourFeedEvent';
import { SomeoneCommentedOnYourFeedEvent } from './Notifications/SomeoneCommentedOnYourFeedEvent';
import { SomeoneFollowedYou } from './Notifications/SomeoneFollowedYou';
import { SomeoneFollowedYouBack } from './Notifications/SomeoneFollowedYouBack';
import { SomeoneViewedYourGallery } from './Notifications/SomeoneViewedYourGallery';

type Props = {
  notificationRef: NotificationFragment$key;
};

export function Notification({ notificationRef }: Props) {
  const notification = useFragment(
    graphql`
      fragment NotificationFragment on Notification {
        id
        seen
        updatedTime

        __typename

        ... on SomeoneCommentedOnYourFeedEventNotification {
          feedEvent {
            dbid
          }
        }

        ... on SomeoneAdmiredYourFeedEventNotification {
          feedEvent {
            dbid
          }
        }

        ... on SomeoneViewedYourGalleryNotification {
          userViewers(last: 1) {
            pageInfo {
              total
            }
          }
        }

        ... on GroupedNotification {
          count
        }

        ...NotificationInnerFragment
      }
    `,
    notificationRef
  );

  return (
    <View className="flex flex-row justify-between p-3">
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
    </View>
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
