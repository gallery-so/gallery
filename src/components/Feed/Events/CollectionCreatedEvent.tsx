import InteractiveLink from 'components/core/InteractiveLink/InteractiveLink';
import Spacer from 'components/core/Spacer/Spacer';
import { BaseM } from 'components/core/Text/Text';
import { useMemo } from 'react';
import { graphql, useFragment } from 'react-relay';
import styled from 'styled-components';
import { pluralize } from 'utils/string';
import { getTimeSince } from 'utils/time';
import { StyledEvent, StyledEventHeader, StyledTime } from './Event';
import EventMedia from './EventMedia';

type Props = {
  eventRef: any;
};

export default function CollectionCreatedEvent({ eventRef }: Props) {
  const event = useFragment(
    graphql`
      fragment CollectionCreatedEventFragment on CollectionCreatedEvent {
        dbid
        eventTime
        owner {
          username
        }
        collection {
          dbid
          name
          tokens {
            token {
              dbid
              ...EventMediaFragment
              #     media {
              #       previewUrls {
              #         medium
              #       }
              #     }
            }
          }
        }
      }
    `,
    eventRef
  );

  const previewTokens = useMemo(() => {
    return event.collection.tokens.slice(0, 4);
  }, [event.collection.tokens]);

  return (
    <StyledEvent>
      {/* <Spacer height={16} /> */}
      <StyledEventHeader>
        <BaseM>
          <InteractiveLink to={`/${event.owner.username}`}>{event.owner.username}</InteractiveLink>{' '}
          added {event.collection.tokens.length}{' '}
          {pluralize(event.collection.tokens.length, 'piece')} to their new collection,{' '}
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
      {/* <Spacer height={16} /> */}
    </StyledEvent>
  );
}

const StyledContent = styled.div`
  display: flex;
  height: 259.33px;
  justify-content: center;
  align-items: center;
`;
