import InteractiveLink from 'components/core/InteractiveLink/InteractiveLink';
import Spacer from 'components/core/Spacer/Spacer';
import { BaseM } from 'components/core/Text/Text';
import { useRouter } from 'next/router';
import { useCallback, useMemo } from 'react';
import { graphql, useFragment } from 'react-relay';
import styled from 'styled-components';
import { pluralize } from 'utils/string';
import { getTimeSince } from 'utils/time';
import FeedEventTokenPreviews from '../FeedEventTokenPreviews';
import { StyledClickHandler, StyledEvent, StyledEventHeader, StyledTime } from './Event';
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
              #     media {
              #       previewUrls {
              #         medium
              #       }
              #     }
            }
            ...EventMediaFragment
          }
        }
      }
    `,
    eventRef
  );
  const { push } = useRouter();

  const tokensToPreview = useMemo(() => {
    return event.collection.tokens.slice(0, 4);
  }, [event.collection.tokens]);

  const collectionPagePath = `/${event.owner.username}/${event.collection.dbid}`;
  const handleEventClick = useCallback(
    (event: React.MouseEvent<HTMLElement>) => {
      event.preventDefault();
      void push(collectionPagePath);
    },
    [collectionPagePath, push]
  );

  return (
    <StyledEvent>
      <StyledClickHandler href={collectionPagePath} onClick={handleEventClick}>
        <StyledEventHeader>
          <BaseM>
            <InteractiveLink to={`/${event.owner.username}`}>
              {event.owner.username}
            </InteractiveLink>{' '}
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
        <FeedEventTokenPreviews tokensToPreview={tokensToPreview} />
      </StyledClickHandler>
    </StyledEvent>
  );
}
