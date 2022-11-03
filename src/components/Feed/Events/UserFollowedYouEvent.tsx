import { graphql, useFragment } from 'react-relay';
import styled from 'styled-components';

import { HStack } from '~/components/core/Spacer/Stack';
import { BaseM } from '~/components/core/Text/Text';
import FollowButton from '~/components/Follow/FollowButton';
import HoverCardOnUsername from '~/components/HoverCard/HoverCardOnUsername';
import { UserFollowedYouEventEventFragment$key } from '~/generated/UserFollowedYouEventEventFragment.graphql';
import { UserFollowedYouEventEventQueryFragment$key } from '~/generated/UserFollowedYouEventEventQueryFragment.graphql';
import { UserFollowedYouEventFragment$key } from '~/generated/UserFollowedYouEventFragment.graphql';
import { getTimeSince } from '~/utils/time';

import { StyledEvent, StyledEventHeader, StyledTime } from './EventStyles';

type Props = {
  queryRef: UserFollowedYouEventEventQueryFragment$key;
  eventRef: UserFollowedYouEventEventFragment$key;
  followInfoRef: UserFollowedYouEventFragment$key;
};

export default function UserFollowedYouEvent({ followInfoRef, eventRef, queryRef }: Props) {
  const event = useFragment(
    graphql`
      fragment UserFollowedYouEventEventFragment on UserFollowedUsersFeedEventData {
        eventTime
        owner @required(action: THROW) {
          username @required(action: THROW)
          ...FollowButtonUserFragment
          ...HoverCardOnUsernameFragment
        }
      }
    `,
    eventRef
  );

  const followInfo = useFragment(
    graphql`
      fragment UserFollowedYouEventFragment on FollowInfo {
        followedBack
      }
    `,
    followInfoRef
  );

  const query = useFragment(
    graphql`
      fragment UserFollowedYouEventEventQueryFragment on Query {
        ...HoverCardOnUsernameFollowFragment
        ...FollowButtonQueryFragment
      }
    `,
    queryRef
  );

  return (
    <StyledEvent>
      <StyledEventContent>
        <StyledEventHeader>
          <HStack gap={4} inline>
            <BaseM>
              <HoverCardOnUsername userRef={event.owner} queryRef={query} /> followed you{' '}
              {followInfo.followedBack && 'back'}
            </BaseM>
            <StyledTime>{getTimeSince(event.eventTime)}</StyledTime>
          </HStack>
        </StyledEventHeader>
        {!followInfo.followedBack && <FollowButton userRef={event.owner} queryRef={query} />}
      </StyledEventContent>
    </StyledEvent>
  );
}

const StyledEventContent = styled.div`
  display: flex;
  align-items: center;
`;
