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

import CollectionCreatedFeedEvent from './CollectionCreatedFeedEvent';
import CollectionUpdatedFeedEvent from './CollectionUpdatedFeedEvent';
import CollectorsNoteAddedToCollectionFeedEvent from './CollectorsNoteAddedToCollectionFeedEvent';
import CollectorsNoteAddedToTokenFeedEvent from './CollectorsNoteAddedToTokenFeedEvent';
import { StyledEvent, StyledEventHeader, StyledTime } from './EventStyles';
import TokensAddedToCollectionFeedEvent from './TokensAddedToCollectionFeedEvent';
import UserFollowedUsersFeedEvent from './UserFollowedUsersFeedEvent';

type Props = {
  eventRef: GalleryUpdatedFeedEventFragment$key;
  queryRef: GalleryUpdatedFeedEventQueryFragment$key;
};

export default function GalleryUpdatedFeedEvent({ eventRef, queryRef }: Props) {
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
          # eventTime

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
        <>
          {event?.subEventDatas?.map((subEvent, index) => {
            switch (subEvent.__typename) {
              case 'CollectionCreatedFeedEventData':
                return (
                  <CollectionCreatedFeedEvent
                    key={index}
                    eventDataRef={subEvent}
                    queryRef={query}
                    caption={null}
                  />
                );
              case 'CollectionUpdatedFeedEventData':
                return <CollectionUpdatedFeedEvent eventDataRef={subEvent} queryRef={query} />;
              case 'CollectorsNoteAddedToTokenFeedEventData':
                return (
                  <CollectorsNoteAddedToTokenFeedEvent eventDataRef={subEvent} queryRef={query} />
                );
              case 'TokensAddedToCollectionFeedEventData':
                return (
                  <TokensAddedToCollectionFeedEvent
                    caption={null}
                    eventDataRef={subEvent}
                    queryRef={query}
                  />
                );
              case 'CollectorsNoteAddedToCollectionFeedEventData':
                return (
                  <CollectorsNoteAddedToCollectionFeedEvent
                    eventDataRef={subEvent}
                    queryRef={query}
                  />
                );
              case 'UserFollowedUsersFeedEventData':
                return (
                  <UserFollowedUsersFeedEvent
                    eventDataRef={subEvent}
                    queryRef={query}
                    // TODO: make it dynamic
                    feedMode="USER"
                  />
                );
              default:
                throw new TriedToRenderUnsupportedFeedEvent(subEvent.__typename);
            }
          })}
        </>
      </VStack>
    </StyledEvent>
  );
}
