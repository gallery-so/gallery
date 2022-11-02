import styled from 'styled-components';
import { HStack } from 'components/core/Spacer/Stack';
import colors from 'components/core/colors';
import { BaseS } from 'components/core/Text/Text';
import { useFragment } from 'react-relay';
import { graphql } from 'relay-runtime';
import { NotificationFragment$key } from '../../../__generated__/NotificationFragment.graphql';
import { getTimeSince } from 'utils/time';
import { NotificationInnerFragment$key } from '../../../__generated__/NotificationInnerFragment.graphql';
import { SomeoneAdmiredYourFeedEvent } from 'components/NotificationsModal/notifications/SomeoneAdmiredYourFeedEvent';
import { SomeoneCommentedOnYourFeedEvent } from 'components/NotificationsModal/notifications/SomeoneCommentedOnYourFeedEvent';
import { SomeoneViewedYourGallery } from 'components/NotificationsModal/notifications/SomeoneViewedYourGallery';
import { SomeoneFollowedYou } from 'components/NotificationsModal/notifications/SomeoneFollowedYou';
import { SomeoneFollowedYouBack } from 'components/NotificationsModal/notifications/SomeoneFollowedYouBack';

type NotificationProps = {
  notificationRef: NotificationFragment$key;
};

export function Notification({ notificationRef }: NotificationProps) {
  const notification = useFragment(
    graphql`
      fragment NotificationFragment on Notification {
        seen
        updatedTime

        ...NotificationInnerFragment
      }
    `,
    notificationRef
  );

  const timeAgo = getTimeSince(notification.updatedTime);

  return (
    <Container>
      <HStack gap={8} align="center">
        {!notification.seen && (
          <UnseenDotContainer>
            <UnseenDot />
          </UnseenDotContainer>
        )}
        <NotificationInner notificationRef={notification} />
        <HStack grow justify="flex-end">
          <BaseS color={colors.metal}>{timeAgo}</BaseS>
        </HStack>
      </HStack>
    </Container>
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

  if (notification.__typename === 'SomeoneAdmiredYourFeedEventNotification') {
    return <SomeoneAdmiredYourFeedEvent notificationRef={notification} />;
  } else if (notification.__typename === 'SomeoneCommentedOnYourFeedEventNotification') {
    return <SomeoneCommentedOnYourFeedEvent notificationRef={notification} />;
  } else if (notification.__typename === 'SomeoneViewedYourGalleryNotification') {
    return <SomeoneViewedYourGallery notificationRef={notification} />;
  } else if (notification.__typename === 'SomeoneFollowedYouNotification') {
    return <SomeoneFollowedYou notificationRef={notification} />;
  } else if (notification.__typename === 'SomeoneFollowedYouBackNotification') {
    return <SomeoneFollowedYouBack notificationRef={notification} />;
  }

  return null;
}

const UnseenDotContainer = styled.div`
  align-self: stretch;
`;

const UnseenDot = styled.div`
  width: 8px;
  height: 8px;

  background-color: ${colors.hyperBlue};
  border-radius: 9999px;
`;

const Container = styled.div`
  padding: 16px 12px;
`;
