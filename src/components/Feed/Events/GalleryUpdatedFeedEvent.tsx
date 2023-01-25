import { Route } from 'nextjs-routes';
import { graphql, useFragment } from 'react-relay';

import InteractiveLink from '~/components/core/InteractiveLink/InteractiveLink';
import { HStack, VStack } from '~/components/core/Spacer/Stack';
import { BaseM } from '~/components/core/Text/Text';
import HoverCardOnUsername from '~/components/HoverCard/HoverCardOnUsername';
import { TriedToRenderUnsupportedFeedEvent } from '~/errors/TriedToRenderUnsupportedFeedEvent';
import { GalleryUpdatedFeedEventFragment$key } from '~/generated/GalleryUpdatedFeedEventFragment.graphql';
import { GalleryUpdatedFeedEventQueryFragment$key } from '~/generated/GalleryUpdatedFeedEventQueryFragment.graphql';
import { getTimeSince } from '~/utils/time';

import { FeedMode } from '../Feed';
import CollectionCreatedFeedEvent, { StyledCaptionContainer } from './CollectionCreatedFeedEvent';
import CollectionUpdatedFeedEvent from './CollectionUpdatedFeedEvent';
import CollectorsNoteAddedToCollectionFeedEvent from './CollectorsNoteAddedToCollectionFeedEvent';
import CollectorsNoteAddedToTokenFeedEvent from './CollectorsNoteAddedToTokenFeedEvent';
import { StyledEvent, StyledEventContent, StyledEventHeader, StyledTime } from './EventStyles';
import TokensAddedToCollectionFeedEvent from './TokensAddedToCollectionFeedEvent';
import UserFollowedUsersFeedEvent from './UserFollowedUsersFeedEvent';

type Props = {
  caption: string | null;
  feedMode: FeedMode;
  eventRef: GalleryUpdatedFeedEventFragment$key;
  queryRef: GalleryUpdatedFeedEventQueryFragment$key;
};

export default function GalleryUpdatedFeedEvent({ caption, eventRef, feedMode, queryRef }: Props) {
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
          ... on UserFollowedUsersFeedEventData {
            ...UserFollowedUsersFeedEventFragment
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

        ...UserFollowedUsersFeedEventQueryFragment
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
    // @ts-expect-error wait multigallery to be merged
    pathname: '[username]/galleries/[galleryId]',
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
              <InteractiveLink to={galleryPagePath}>
                {event?.gallery?.name || 'gallery'}
              </InteractiveLink>
            </BaseM>
            <StyledTime>{getTimeSince(event.eventTime)}</StyledTime>
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
                    <CollectionCreatedFeedEvent
                      key={index}
                      eventDataRef={subEvent}
                      queryRef={query}
                      caption={null}
                      isSubEvent
                    />
                  );
                case 'CollectionUpdatedFeedEventData':
                  return (
                    <CollectionUpdatedFeedEvent
                      eventDataRef={subEvent}
                      queryRef={query}
                      isSubEvent
                    />
                  );
                case 'CollectorsNoteAddedToTokenFeedEventData':
                  return (
                    <CollectorsNoteAddedToTokenFeedEvent
                      eventDataRef={subEvent}
                      queryRef={query}
                      isSubEvent
                    />
                  );
                case 'TokensAddedToCollectionFeedEventData':
                  return (
                    <TokensAddedToCollectionFeedEvent
                      caption={null}
                      eventDataRef={subEvent}
                      queryRef={query}
                      isSubEvent
                    />
                  );
                case 'CollectorsNoteAddedToCollectionFeedEventData':
                  return (
                    <CollectorsNoteAddedToCollectionFeedEvent
                      eventDataRef={subEvent}
                      queryRef={query}
                      isSubEvent
                    />
                  );
                case 'UserFollowedUsersFeedEventData':
                  return (
                    <UserFollowedUsersFeedEvent
                      eventDataRef={subEvent}
                      queryRef={query}
                      feedMode={feedMode}
                      isSubEvent
                    />
                  );

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
