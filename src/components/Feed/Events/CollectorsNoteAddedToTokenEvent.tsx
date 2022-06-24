import InteractiveLink from 'components/core/InteractiveLink/InteractiveLink';
import Spacer from 'components/core/Spacer/Spacer';
import { BaseM, TitleM } from 'components/core/Text/Text';
import { graphql, useFragment } from 'react-relay';
import styled from 'styled-components';
import { getTimeSince } from 'utils/time';
import { StyledEvent, StyledEventHeader, StyledTime } from './Event';
import EventMedia from './EventMedia';

type Props = {
  eventRef: any;
};

export default function CollectorsNoteAddedToTokenEvent({ eventRef }: Props) {
  const event = useFragment(
    graphql`
      fragment CollectorsNoteAddedToTokenEventFragment on CollectorsNoteAddedToTokenEvent {
        dbid
        eventTime
        owner {
          username
        }
        newCollectorsNote
        token {
          token {
            name
          }
          ...EventMediaFragment
        }
      }
    `,
    eventRef
  );

  return (
    <StyledEvent>
      <StyledEventHeader>
        <BaseM>
          <InteractiveLink to={`/${event.owner.username}`}>{event.owner.username}</InteractiveLink>{' '}
          added a collector's note to{' '}
          <InteractiveLink to={`/${event.owner.username}/${event.token.dbid}`}>
            {/* TODO FIX URL */}
            {event.token.token.name}
          </InteractiveLink>
        </BaseM>
        <Spacer width={4} />
        <StyledTime>{getTimeSince(event.eventTime)}</StyledTime>
      </StyledEventHeader>
      <Spacer height={16} />
      <StyledContent>
        <EventMedia tokenRef={event.token} />
        <StyledNoteWrapper>
          <TitleM>{event.newCollectorsNote}</TitleM>
        </StyledNoteWrapper>
      </StyledContent>
    </StyledEvent>
  );
}

const StyledContent = styled.div`
  display: flex;
  height: 269px;
  justify-content: center;
  align-items: center;
`;

const StyledNoteWrapper = styled.div`
  width: 50%;
`;
