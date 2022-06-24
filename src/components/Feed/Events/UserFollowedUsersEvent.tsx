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
  const { push } = useRouter();

  // question: if followed 1 collector, should we just show name
  // shoudld # collectors be clickable instead of "see all"
  // const copy = event.followed.length > 1 ?

  // console.log('followevent', event);`followed ${event.followed.length} collectors.` : `followed `

  const isSingleFollow = event.followed.length === 1;
  const handleClick = useCallback(() => {
    console.log('eeee');
    void push(`/${event.followed[0].user.username}`);
  }, [event.followed, push]);

  return (
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
