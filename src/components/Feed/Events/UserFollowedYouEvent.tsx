import InteractiveLink from 'components/core/InteractiveLink/InteractiveLink';
import { BaseM } from 'components/core/Text/Text';
import FollowButton from 'components/Follow/FollowButton';
import styled from 'styled-components';
import { getTimeSince } from 'utils/time';
import { FollowButtonQueryFragment$key } from '__generated__/FollowButtonQueryFragment.graphql';
import { StyledEvent, StyledEventHeader, StyledTime } from './EventStyles';
import { graphql, useFragment } from 'react-relay';
import { UserFollowedYouEventFragment$key } from '../../../../__generated__/UserFollowedYouEventFragment.graphql';
import { UserFollowedYouEventEventFragment$key } from '../../../../__generated__/UserFollowedYouEventEventFragment.graphql';
import { HStack } from 'components/core/Spacer/Stack';

type Props = {
  queryRef: FollowButtonQueryFragment$key;
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

  return (
    <StyledEvent>
      <StyledEventContent>
        <StyledEventHeader>
          <HStack gap={4} inline>
            <BaseM>
              <InteractiveLink to={`/${event.owner.username}`}>
                {event.owner.username}
              </InteractiveLink>{' '}
              followed you {followInfo.followedBack && 'back'}
            </BaseM>
            <StyledTime>{getTimeSince(event.eventTime)}</StyledTime>
          </HStack>
        </StyledEventHeader>
        {!followInfo.followedBack && <FollowButton userRef={event.owner} queryRef={queryRef} />}
      </StyledEventContent>
    </StyledEvent>
  );
}

const StyledEventContent = styled.div`
  display: flex;
  align-items: center;
`;
