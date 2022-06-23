import colors from 'components/core/colors';
import InteractiveLink from 'components/core/InteractiveLink/InteractiveLink';
import Spacer from 'components/core/Spacer/Spacer';
import { BaseM, BaseS } from 'components/core/Text/Text';
import { graphql, useFragment } from 'react-relay';
import styled from 'styled-components';
import { getTimeSince } from 'utils/time';
import { StyledEvent, StyledEventHeader, StyledTime } from './Event';

type Props = {
  eventRef: any;
};

export default function UserFollowedUsersEvent({ eventRef }: Props) {
  const event = useFragment(
    graphql`
      fragment UserFollowedUsersEventFragment on UserFollowedUsersEvent {
        dbid
        eventTime
        owner {
          username
        }
        followed {
          user {
            username
          }
          followedBack
        }
      }
    `,

    eventRef
  );

  // question: if followed 1 collector, should we just show name
  // shoudld # collectors be clickable instead of "see all"

  console.log('followevent', event);
  return (
    <StyledEvent>
      <StyledEventHeader>
        <BaseM>
          <InteractiveLink to={`/${event.owner.username}`}>{event.owner.username}</InteractiveLink>{' '}
          followed {event.followed.length} collectors.
        </BaseM>
        <Spacer width={4} />
        <StyledTime>{getTimeSince(event.eventTime)}</StyledTime>
      </StyledEventHeader>
    </StyledEvent>
  );
}
