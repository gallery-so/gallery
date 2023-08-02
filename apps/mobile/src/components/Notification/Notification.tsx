import { View } from 'react-native';
import { graphql, useFragment } from 'react-relay';

import { NotificationFragment$key } from '~/generated/NotificationFragment.graphql';
import { NotificationQueryFragment$key } from '~/generated/NotificationQueryFragment.graphql';

import { SomeoneAdmiredYourFeedEvent } from './Notifications/SomeoneAdmiredYourFeedEvent';
import { SomeoneAdmiredYourPost } from './Notifications/SomeoneAdmiredYourPost';
import { SomeoneCommentedOnYourFeedEvent } from './Notifications/SomeoneCommentedOnYourFeedEvent';
import { SomeoneFollowedYou } from './Notifications/SomeoneFollowedYou';
import { SomeoneFollowedYouBack } from './Notifications/SomeoneFollowedYouBack';
import { SomeoneViewedYourGallery } from './Notifications/SomeoneViewedYourGallery';
import { SomeoneCommentedOnYourPost } from './Notifications/SomeoneCommentedOnYourPost';

type NotificationInnerProps = {
  queryRef: NotificationQueryFragment$key;
  notificationRef: NotificationFragment$key;
};

export function Notification({ notificationRef, queryRef }: NotificationInnerProps) {
  const query = useFragment(
    graphql`
      fragment NotificationQueryFragment on Query {
        ...SomeoneFollowedYouBackQueryFragment
        ...SomeoneFollowedYouQueryFragment
        ...SomeoneAdmiredYourFeedEventQueryFragment
        ...SomeoneCommentedOnYourFeedEventQueryFragment
        ...SomeoneViewedYourGalleryQueryFragment
        ...SomeoneAdmiredYourPostQueryFragment
        ...SomeoneCommentedOnYourPostQueryFragment
      }
    `,
    queryRef
  );

  const notification = useFragment(
    graphql`
      fragment NotificationFragment on Notification {
        __typename
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

        ... on SomeoneAdmiredYourPostNotification {
          __typename
          ...SomeoneAdmiredYourPostFragment
        }

        ... on SomeoneCommentedOnYourPostNotification {
          __typename
          ...SomeoneCommentedOnYourPostFragment
        }
      }
    `,
    notificationRef
  );

  if (notification.__typename === 'SomeoneViewedYourGalleryNotification') {
    return <SomeoneViewedYourGallery queryRef={query} notificationRef={notification} />;
  } else if (notification.__typename === 'SomeoneAdmiredYourFeedEventNotification') {
    return <SomeoneAdmiredYourFeedEvent queryRef={query} notificationRef={notification} />;
  } else if (notification.__typename === 'SomeoneFollowedYouBackNotification') {
    return <SomeoneFollowedYouBack queryRef={query} notificationRef={notification} />;
  } else if (notification.__typename === 'SomeoneFollowedYouNotification') {
    return <SomeoneFollowedYou queryRef={query} notificationRef={notification} />;
  } else if (notification.__typename === 'SomeoneCommentedOnYourFeedEventNotification') {
    return <SomeoneCommentedOnYourFeedEvent queryRef={query} notificationRef={notification} />;
  } else if (notification.__typename === 'SomeoneAdmiredYourPostNotification') {
    return <SomeoneAdmiredYourPost queryRef={query} notificationRef={notification} />;
  } else if (notification.__typename === 'SomeoneCommentedOnYourPostNotification') {
    return <SomeoneCommentedOnYourPost queryRef={query} notificationRef={notification} />;
  }

  return <View />;
}
