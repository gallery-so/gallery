import { useMemo } from 'react';
import { View } from 'react-native';
import { graphql, useFragment } from 'react-relay';

import { NotificationFragment$key } from '~/generated/NotificationFragment.graphql';
import { NotificationQueryFragment$key } from '~/generated/NotificationQueryFragment.graphql';
import { ReportingErrorBoundary } from '~/shared/errors/ReportingErrorBoundary';

import { NewTokens } from './Notifications/NewTokens';
import { SomeoneAdmiredYourFeedEvent } from './Notifications/SomeoneAdmiredYourFeedEvent';
import { SomeoneAdmiredYourPost } from './Notifications/SomeoneAdmiredYourPost';
import { SomeoneAdmiredYourToken } from './Notifications/SomeoneAdmiredYourToken';
import { SomeoneCommentedOnYourFeedEvent } from './Notifications/SomeoneCommentedOnYourFeedEvent';
import { SomeoneCommentedOnYourPost } from './Notifications/SomeoneCommentedOnYourPost';
import { SomeoneFollowedYou } from './Notifications/SomeoneFollowedYou';
import { SomeoneFollowedYouBack } from './Notifications/SomeoneFollowedYouBack';
import { SomeoneMentionedYou } from './Notifications/SomeoneMentionedYou';
import { SomeoneViewedYourGallery } from './Notifications/SomeoneViewedYourGallery';

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
        ...SomeoneAdmiredYourTokenQueryFragment
        ...SomeoneCommentedOnYourPostQueryFragment
        ...SomeoneMentionedYouQueryFragment
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
          post {
            __typename
          }
          ...SomeoneAdmiredYourPostFragment
        }

        ... on SomeoneAdmiredYourTokenNotification {
          __typename
          token {
            __typename
          }
          ...SomeoneAdmiredYourTokenFragment
        }

        ... on SomeoneCommentedOnYourPostNotification {
          __typename
          post {
            __typename
          }
          ...SomeoneCommentedOnYourPostFragment
        }

        ... on NewTokensNotification {
          __typename
          ...NewTokensFragment
        }

        ... on SomeoneMentionedYouNotification {
          __typename
          ...SomeoneMentionedYouFragment
        }
      }
    `,
    notificationRef
  );

  const NotificationComponent = useMemo(() => {
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
      return notification.post ? (
        <SomeoneAdmiredYourPost queryRef={query} notificationRef={notification} />
      ) : null;
    } else if (notification.__typename === 'SomeoneAdmiredYourTokenNotification') {
      return notification.token ? (
        <SomeoneAdmiredYourToken queryRef={query} notificationRef={notification} />
      ) : null;
    } else if (notification.__typename === 'SomeoneCommentedOnYourPostNotification') {
      return notification.post ? (
        <SomeoneCommentedOnYourPost queryRef={query} notificationRef={notification} />
      ) : null;
    } else if (notification.__typename === 'NewTokensNotification') {
      return <NewTokens notificationRef={notification} />;
    } else if (notification.__typename === 'SomeoneMentionedYouNotification') {
      return <SomeoneMentionedYou queryRef={query} notificationRef={notification} />;
    }
    return <View />;
  }, [notification, query]);

  return (
    <ReportingErrorBoundary fallback={<View />}>{NotificationComponent}</ReportingErrorBoundary>
  );
}
