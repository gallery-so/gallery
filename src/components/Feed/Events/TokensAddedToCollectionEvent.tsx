import InteractiveLink from 'components/core/InteractiveLink/InteractiveLink';
import Spacer from 'components/core/Spacer/Spacer';
import { BaseM } from 'components/core/Text/Text';
import { useMemo } from 'react';
import { useFragment } from 'react-relay';
import { graphql } from 'relay-runtime';
import styled from 'styled-components';
import { pluralize } from 'utils/string';
import { getTimeSince } from 'utils/time';
import { StyledEvent, StyledEventHeader, StyledTime } from './Event';
import EventMedia from './EventMedia';

type Props = {
  eventRef: any;
};

export default function TokensAddedToCollectionEvent({ eventRef }: Props) {
  const event = useFragment(
    graphql`
      fragment TokensAddedToCollectionEventFragment on TokensAddedToCollectionEvent {
        eventTime
        owner {
          username
        }
        collection {
          dbid
          name
        }
        newTokens {
          token {
            dbid
            ...EventMediaFragment
          }
        }
      }
    `,
    eventRef
  );

  const previewTokens = useMemo(() => {
    return event.newTokens.slice(0, 4);
  }, [event.newTokens]);

  return (
    <StyledEvent>
      <StyledEventHeader>
        <BaseM>
          <InteractiveLink to={`/${event.owner.username}`}>{event.owner.username}</InteractiveLink>{' '}
          added {event.newTokens.length} {pluralize(event.newTokens.length, 'piece')} to{' '}
          <InteractiveLink to={`/${event.owner.username}/${event.collection.dbid}`}>
            {event.collection.name}
          </InteractiveLink>
        </BaseM>
        <Spacer width={4} />
        <StyledTime>{getTimeSince(event.eventTime)}</StyledTime>
      </StyledEventHeader>
      <Spacer height={16} />
      <StyledContent>
        {previewTokens.map((collectionToken) => (
          <EventMedia tokenRef={collectionToken.token} key={collectionToken.token.dbid} />
        ))}
      </StyledContent>
    </StyledEvent>
  );
}

const StyledContent = styled.div`
  display: flex;
  height: 259.33px;
  justify-content: center;
  align-items: center;
`;
