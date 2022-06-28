import colors from 'components/core/colors';
import InteractiveLink from 'components/core/InteractiveLink/InteractiveLink';
import Spacer from 'components/core/Spacer/Spacer';
import { BaseM, BaseS } from 'components/core/Text/Text';
import { useRouter } from 'next/router';
import { useCallback } from 'react';
import { graphql, useFragment } from 'react-relay';
import styled from 'styled-components';
import { getTimeSince } from 'utils/time';
import { StyledEvent, StyledEventHeader, StyledTime } from './Event';

type Props = {
  eventRef: any;
};

export default function UserFollowedUsersFeedEvent({ eventRef }: Props) {
  const event = useFragment(
    graphql`
      fragment UserFollowedUsersFeedEventFragment on UserFollowedUsersFeedEventData {
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
  const { push } = useRouter();

  const isSingleFollow = event.followed.length === 1;
  const handleClick = useCallback(() => {
    void push(`/${event.followed[0].user.username}`);
  }, [event.followed, push]);

  console.log(event);

  return (
    // todo: show href for single, no href for multipel follows
    // todo: open follower list for multiple
    <StyledEvent onClick={handleClick}>
      <StyledEventHeader>
        <BaseM>
          <InteractiveLink to={`/${event.owner.username}`}>{event.owner.username}</InteractiveLink>{' '}
          followed{' '}
          {isSingleFollow ? (
            <InteractiveLink to={`/${event.followed[0].user.username}`}>
              {event.followed[0].user.username}
            </InteractiveLink>
          ) : (
            <>{event.followed.length} collectors.</>
          )}
        </BaseM>
        <Spacer width={4} />
        <StyledTime>{getTimeSince(event.eventTime)}</StyledTime>
      </StyledEventHeader>
    </StyledEvent>
  );
}
