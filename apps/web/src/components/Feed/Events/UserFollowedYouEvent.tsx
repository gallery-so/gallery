import { graphql, useFragment } from 'react-relay';
import styled from 'styled-components';

import { HStack } from '~/components/core/Spacer/Stack';
import { BaseM } from '~/components/core/Text/Text';
import HoverCardOnUsername from '~/components/HoverCard/HoverCardOnUsername';
import { UserFollowedYouEventEventFragment$key } from '~/generated/UserFollowedYouEventEventFragment.graphql';
import { UserFollowedYouEventFragment$key } from '~/generated/UserFollowedYouEventFragment.graphql';
import colors from '~/shared/theme/colors';
import { getTimeSince } from '~/shared/utils/time';

import { StyledEvent, StyledEventHeader, StyledTime } from './EventStyles';

type Props = {
  eventRef: UserFollowedYouEventEventFragment$key;
  followInfoRef: UserFollowedYouEventFragment$key;
};

export default function UserFollowedYouEvent({ followInfoRef, eventRef }: Props) {
  const event = useFragment(
    graphql`
      fragment UserFollowedYouEventEventFragment on UserFollowedUsersFeedEventData {
        eventTime
        owner @required(action: THROW) {
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

  return (
    <>
      <StyledEvent>
        <StyledEventContent>
          <StyledEventHeader>
            <HStack gap={4} inline>
              <BaseM>
                <HoverCardOnUsername userRef={event.owner} /> followed you{' '}
                {followInfo.followedBack && 'back'}
              </BaseM>
              <StyledTime>{getTimeSince(event.eventTime)}</StyledTime>
            </HStack>
          </StyledEventHeader>
        </StyledEventContent>
      </StyledEvent>
      <StyledHr />
    </>
  );
}

const StyledEventContent = styled.div`
  display: flex;
  align-items: center;
`;

const StyledHr = styled.hr`
  border: none;
  border-top: 1px solid ${colors.faint};

  /* Hack to force full width: full width + FeedEventContainer right padding  */
  width: calc(100% + 16px);

  margin: 8px 0px;
`;
