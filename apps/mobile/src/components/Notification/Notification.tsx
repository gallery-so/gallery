import { useMemo } from 'react';
import { View } from 'react-native';
import { graphql, useFragment } from 'react-relay';

import { NotificationFragment$key } from '~/generated/NotificationFragment.graphql';
import { NotificationQueryFragment$key } from '~/generated/NotificationQueryFragment.graphql';
import { ReportingErrorBoundary } from '~/shared/errors/ReportingErrorBoundary';

import { GalleryAnnouncement } from './Notifications/GalleryAnnouncement';
import { NewTokens } from './Notifications/NewTokens';
import { SomeoneAdmiredYourFeedEvent } from './Notifications/SomeoneAdmiredYourFeedEvent';
import { SomeoneAdmiredYourPost } from './Notifications/SomeoneAdmiredYourPost';
import { SomeoneAdmiredYourToken } from './Notifications/SomeoneAdmiredYourToken';
import { SomeoneCommentedOnYourFeedEvent } from './Notifications/SomeoneCommentedOnYourFeedEvent';
import { SomeoneCommentedOnYourPost } from './Notifications/SomeoneCommentedOnYourPost';
import { SomeoneFollowedYou } from './Notifications/SomeoneFollowedYou';
import { SomeoneFollowedYouBack } from './Notifications/SomeoneFollowedYouBack';
import { SomeoneMentionedYou } from './Notifications/SomeoneMentionedYou';
import { SomeonePostedYourWork } from './Notifications/SomeonePostedYourWork';
import { SomeoneRepliedToYourComment } from './Notifications/SomeoneRepliedToYourComment';
import { SomeoneViewedYourGallery } from './Notifications/SomeoneViewedYourGallery';
import { SomeoneYouFollowPostedTheirFirstPost } from './Notifications/SomeoneYouFollowPostedTheirFirstPost';
import { YouReceivedTopActivityBadge } from './Notifications/YouReceivedTopActivityBadge';

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
        ...SomeonePostedYourWorkQueryFragment
        ...SomeoneRepliedToYourCommentQueryFragment
        ...SomeoneYouFollowPostedTheirFirstPostQueryFragment
        ...YouReceivedTopActivityBadgeQueryFragment
        ...GalleryAnnouncementQueryFragment
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

        ... on SomeonePostedYourWorkNotification {
          __typename
          ...SomeonePostedYourWorkFragment
        }

        ... on SomeoneRepliedToYourCommentNotification {
          __typename
          ...SomeoneRepliedToYourCommentFragment
        }
        ... on SomeoneYouFollowPostedTheirFirstPostNotification {
          __typename
          ...SomeoneYouFollowPostedTheirFirstPostFragment
        }
        ... on YouReceivedTopActivityBadgeNotification {
          __typename
          ...YouReceivedTopActivityBadgeFragment
        }
        ... on GalleryAnnouncementNotification {
          __typename
          platform
          ...GalleryAnnouncementFragment
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
    } else if (notification.__typename === 'SomeonePostedYourWorkNotification') {
      return <SomeonePostedYourWork queryRef={query} notificationRef={notification} />;
    } else if (notification.__typename === 'SomeoneRepliedToYourCommentNotification') {
      return <SomeoneRepliedToYourComment queryRef={query} notificationRef={notification} />;
    } else if (notification.__typename === 'SomeoneYouFollowPostedTheirFirstPostNotification') {
      return (
        <SomeoneYouFollowPostedTheirFirstPost queryRef={query} notificationRef={notification} />
      );
    } else if (notification.__typename === 'YouReceivedTopActivityBadgeNotification') {
      return <YouReceivedTopActivityBadge queryRef={query} notificationRef={notification} />;
    } else if (notification.__typename === 'GalleryAnnouncementNotification') {
      return notification.platform === 'Web' ? null : (
        <GalleryAnnouncement notificationRef={notification} queryRef={query} />
      );
    }
    return <View />;
  }, [notification, query]);

  return (
    <ReportingErrorBoundary fallback={<View />}>{NotificationComponent}</ReportingErrorBoundary>
  );
}
