import { graphql, useFragment } from 'react-relay';
import colors from 'shared/theme/colors';
import { getTimeSince } from 'shared/utils/time';
import styled from 'styled-components';

import { HStack, VStack } from '~/components/core/Spacer/Stack';
import { BaseM, BaseS } from '~/components/core/Text/Text';
import FollowButton from '~/components/Follow/FollowButton';
import UserHoverCard from '~/components/HoverCard/UserHoverCard';
import { ProfilePicture } from '~/components/ProfilePicture/ProfilePicture';
import { SomeoneYouFollowOnFarcasterJoinedFragment$key } from '~/generated/SomeoneYouFollowOnFarcasterJoinedFragment.graphql';
import { SomeoneYouFollowOnFarcasterJoinedQueryFragment$key } from '~/generated/SomeoneYouFollowOnFarcasterJoinedQueryFragment.graphql';

type Props = {
  notificationRef: SomeoneYouFollowOnFarcasterJoinedFragment$key;
  queryRef: SomeoneYouFollowOnFarcasterJoinedQueryFragment$key;
  onClose: () => void;
};

export default function SomeoneYouFollowOnFarcasterJoined({
  notificationRef,
  queryRef,
  onClose,
}: Props) {
  const notification = useFragment(
    graphql`
      fragment SomeoneYouFollowOnFarcasterJoinedFragment on SomeoneYouFollowOnFarcasterJoinedNotification {
        __typename
        updatedTime
        user {
          username
          ...UserHoverCardFragment
          ...ProfilePictureFragment
          ...FollowButtonUserFragment
        }
      }
    `,
    notificationRef
  );

  const query = useFragment(
    graphql`
      fragment SomeoneYouFollowOnFarcasterJoinedQueryFragment on Query {
        ...FollowButtonQueryFragment
      }
    `,
    queryRef
  );

  const timeAgo = getTimeSince(notification.updatedTime);

  if (!notification.user) {
    reportError(new Error('SomeoneYouFollowOnFarcasterJoined notification is missing user'));
    return null;
  }

  return (
    <StyledNotificationContent align="center" justify="space-between">
      <HStack align="center" gap={8} inline>
        <ProfilePicture size="md" userRef={notification.user} />
        <VStack>
          <HStack align="baseline" as="span" wrap="wrap">
            <UserHoverCard userRef={notification.user} onClick={onClose} />
            &nbsp;
            <BaseM>just joined</BaseM>
            &nbsp;
            <BaseS color={colors.metal}>{timeAgo}</BaseS>
          </HStack>
          <BaseS>You know {notification.user.username} from Farcaster</BaseS>
        </VStack>
      </HStack>
      <StyledFollowButton queryRef={query} userRef={notification.user} />
    </StyledNotificationContent>
  );
}

const StyledNotificationContent = styled(HStack)`
  width: 100%;
`;

const StyledFollowButton = styled(FollowButton)`
  width: 92px;
  height: 24px;
`;
