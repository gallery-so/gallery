import Link from 'next/link';
import { Route } from 'nextjs-routes';
import { graphql, useFragment } from 'react-relay';

import { HStack, VStack } from '~/components/core/Spacer/Stack';
import { BaseM } from '~/components/core/Text/Text';
import HoverCardOnUsername from '~/components/HoverCard/HoverCardOnUsername';
import { ReportingErrorBoundary } from '~/contexts/boundary/ReportingErrorBoundary';
import { GalleryUpdatedFeedEventFragment$key } from '~/generated/GalleryUpdatedFeedEventFragment.graphql';
import { GalleryUpdatedFeedEventQueryFragment$key } from '~/generated/GalleryUpdatedFeedEventQueryFragment.graphql';
import { getTimeSince } from '~/utils/time';

import CollectionCreatedFeedEvent, { StyledCaptionContainer } from './CollectionCreatedFeedEvent';
import CollectionUpdatedFeedEvent from './CollectionUpdatedFeedEvent';
import CollectorsNoteAddedToCollectionFeedEvent from './CollectorsNoteAddedToCollectionFeedEvent';
import CollectorsNoteAddedToTokenFeedEvent from './CollectorsNoteAddedToTokenFeedEvent';
import {
  StyledEvent,
  StyledEventContent,
  StyledEventHeader,
  StyledEventLabel,
  StyledTime,
} from './EventStyles';
import TokensAddedToCollectionFeedEvent from './TokensAddedToCollectionFeedEvent';

type Props = {
  caption: string | null;
  eventRef: GalleryUpdatedFeedEventFragment$key;
  queryRef: GalleryUpdatedFeedEventQueryFragment$key;
};

export default function GalleryUpdatedFeedEvent({ caption, eventRef, queryRef }: Props) {
  const event = useFragment(
    graphql`
      fragment GalleryUpdatedFeedEventFragment on GalleryUpdatedFeedEventData {
        __typename
        eventTime
        gallery @required(action: THROW) {
          dbid
          name
        }
        owner @required(action: THROW) {
          username @required(action: THROW)
          ...HoverCardOnUsernameFragment
        }
        subEventDatas {
          __typename

          ... on CollectionCreatedFeedEventData {
            ...CollectionCreatedFeedEventFragment
          }
          ... on CollectorsNoteAddedToTokenFeedEventData {
            ...CollectorsNoteAddedToTokenFeedEventFragment
          }
          ... on TokensAddedToCollectionFeedEventData {
            ...TokensAddedToCollectionFeedEventFragment
          }

          ... on CollectorsNoteAddedToCollectionFeedEventData {
            ...CollectorsNoteAddedToCollectionFeedEventFragment
          }
          ... on CollectorsNoteAddedToCollectionFeedEventData {
            ...CollectorsNoteAddedToCollectionFeedEventFragment
          }
          ... on CollectionUpdatedFeedEventData {
            ...CollectionUpdatedFeedEventFragment
          }

          ... on GalleryInfoUpdatedFeedEventData {
            __typename
          }
        }
      }
    `,
    eventRef
  );

  const query = useFragment(
    graphql`
      fragment GalleryUpdatedFeedEventQueryFragment on Query {
        ...HoverCardOnUsernameFollowFragment

        ...TokensAddedToCollectionFeedEventQueryFragment
        ...CollectorsNoteAddedToCollectionFeedEventQueryFragment
        ...CollectionCreatedFeedEventQueryFragment
        ...CollectorsNoteAddedToTokenFeedEventQueryFragment
        ...CollectionUpdatedFeedEventQueryFragment
      }
    `,
    queryRef
  );

  const galleryPagePath: Route = {
    pathname: '/[username]/galleries/[galleryId]',
    query: {
      username: event.owner.username,
      galleryId: event.gallery.dbid,
    },
  };

  return (
    <StyledEvent>
      <VStack gap={16}>
        <StyledEventHeader>
          <HStack gap={4} inline>
            <BaseM>
              <HoverCardOnUsername userRef={event.owner} queryRef={query} /> updated{' '}
              <Link href={galleryPagePath} passHref>
                <StyledEventLabel>{event?.gallery?.name || 'gallery'}</StyledEventLabel>
              </Link>
              <StyledTime>{getTimeSince(event.eventTime)}</StyledTime>
            </BaseM>
          </HStack>
        </StyledEventHeader>
        <StyledEventContent>
          <VStack gap={16}>
            {caption && (
              <StyledCaptionContainer gap={8} align="center">
                <BaseM>{caption}</BaseM>
              </StyledCaptionContainer>
            )}
            {event?.subEventDatas?.map((subEvent, index) => {
              switch (subEvent.__typename) {
                case 'CollectionCreatedFeedEventData':
                  return (
                    <ReportingErrorBoundary fallback={<></>} dontReport>
                      <CollectionCreatedFeedEvent
                        key={index}
                        eventDataRef={subEvent}
                        queryRef={query}
                        caption={null}
                        isSubEvent
                      />
                    </ReportingErrorBoundary>
                  );
                case 'CollectionUpdatedFeedEventData':
                  return (
                    <ReportingErrorBoundary fallback={<></>} dontReport>
                      <CollectionUpdatedFeedEvent
                        eventDataRef={subEvent}
                        queryRef={query}
                        isSubEvent
                      />
                    </ReportingErrorBoundary>
                  );
                case 'CollectorsNoteAddedToTokenFeedEventData':
                  return (
                    <ReportingErrorBoundary fallback={<></>} dontReport>
                      <CollectorsNoteAddedToTokenFeedEvent
                        eventDataRef={subEvent}
                        queryRef={query}
                        isSubEvent
                      />
                    </ReportingErrorBoundary>
                  );
                case 'TokensAddedToCollectionFeedEventData':
                  return (
                    <ReportingErrorBoundary fallback={<></>} dontReport>
                      <TokensAddedToCollectionFeedEvent
                        caption={null}
                        eventDataRef={subEvent}
                        queryRef={query}
                        isSubEvent
                      />
                    </ReportingErrorBoundary>
                  );
                case 'CollectorsNoteAddedToCollectionFeedEventData':
                  return (
                    <ReportingErrorBoundary fallback={<></>} dontReport>
                      <CollectorsNoteAddedToCollectionFeedEvent
                        eventDataRef={subEvent}
                        queryRef={query}
                        isSubEvent
                      />
                    </ReportingErrorBoundary>
                  );

                // These event types are returned by the backend but are not currently spec'd to be displayed
                case 'GalleryInfoUpdatedFeedEventData':
                  return null;

                default: {
                  return null;
                }
              }
            })}
          </VStack>
        </StyledEventContent>
      </VStack>
    </StyledEvent>
  );
}
