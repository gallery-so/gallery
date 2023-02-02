import { useFragment } from 'react-relay';
import { graphql } from 'relay-runtime';

import CollectionCreatedFeedEvent from '~/components/Feed/Events/CollectionCreatedFeedEvent';
import CollectionUpdatedFeedEvent from '~/components/Feed/Events/CollectionUpdatedFeedEvent';
import CollectorsNoteAddedToCollectionFeedEvent from '~/components/Feed/Events/CollectorsNoteAddedToCollectionFeedEvent';
import CollectorsNoteAddedToTokenFeedEvent from '~/components/Feed/Events/CollectorsNoteAddedToTokenFeedEvent';
import GalleryUpdatedFeedEvent from '~/components/Feed/Events/GalleryUpdatedFeedEvent';
import TokensAddedToCollectionFeedEvent from '~/components/Feed/Events/TokensAddedToCollectionFeedEvent';
import UserFollowedUsersFeedEvent from '~/components/Feed/Events/UserFollowedUsersFeedEvent';
import { FeedMode } from '~/components/Feed/Feed';
import { TriedToRenderUnsupportedFeedEvent } from '~/errors/TriedToRenderUnsupportedFeedEvent';
import { FeedEventDataFragment$key } from '~/generated/FeedEventDataFragment.graphql';
import { FeedEventDataNonRecursiveFragment$key } from '~/generated/FeedEventDataNonRecursiveFragment.graphql';
import { FeedEventDataNonRecursiveQueryFragment$key } from '~/generated/FeedEventDataNonRecursiveQueryFragment.graphql';
import { FeedEventDataQueryFragment$key } from '~/generated/FeedEventDataQueryFragment.graphql';
import unescape from '~/utils/unescape';

type FeedEventDataNonRecursiveProps = {
  isSubEvent?: boolean;
  feedMode: FeedMode;
  eventDbid: string;
  caption: string | null;
  queryRef: FeedEventDataNonRecursiveQueryFragment$key;
  eventDataRef: FeedEventDataNonRecursiveFragment$key;
};

export function NonRecursiveFeedEventData({
  isSubEvent,
  eventDbid,
  eventDataRef,
  feedMode,
  queryRef,
  caption,
}: FeedEventDataNonRecursiveProps) {
  const query = useFragment(
    graphql`
      fragment FeedEventDataNonRecursiveQueryFragment on Query {
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

  const eventData = useFragment(
    graphql`
      fragment FeedEventDataNonRecursiveFragment on FeedEventData {
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
    `,
    eventDataRef
  );

  switch (eventData?.__typename) {
    case 'CollectionCreatedFeedEventData':
      return (
        <CollectionCreatedFeedEvent
          isSubEvent={isSubEvent}
          caption={unescape(caption ?? '')}
          eventDataRef={eventData}
          queryRef={query}
        />
      );
    case 'CollectionUpdatedFeedEventData':
      return (
        <CollectionUpdatedFeedEvent
          isSubEvent={isSubEvent}
          eventDataRef={eventData}
          queryRef={query}
        />
      );
    case 'CollectorsNoteAddedToTokenFeedEventData':
      return (
        <CollectorsNoteAddedToTokenFeedEvent
          isSubEvent={isSubEvent}
          eventDataRef={eventData}
          queryRef={query}
        />
      );
    case 'TokensAddedToCollectionFeedEventData':
      return (
        <TokensAddedToCollectionFeedEvent
          isSubEvent={isSubEvent}
          caption={unescape(caption ?? '')}
          eventDataRef={eventData}
          queryRef={query}
        />
      );
    case 'CollectorsNoteAddedToCollectionFeedEventData':
      return (
        <CollectorsNoteAddedToCollectionFeedEvent
          isSubEvent={isSubEvent}
          eventDataRef={eventData}
          queryRef={query}
        />
      );
    case 'UserFollowedUsersFeedEventData':
      return (
        <UserFollowedUsersFeedEvent
          isSubEvent={isSubEvent}
          eventDataRef={eventData}
          queryRef={query}
          feedMode={feedMode}
        />
      );
    case 'GalleryInfoUpdatedFeedEventData':
      return null;
    default:
      throw new TriedToRenderUnsupportedFeedEvent(eventDbid);
  }
}

type FeedEventDataProps = {
  caption: string | null;
  feedMode: FeedMode;
  eventDbid: string;

  feedEventRef: FeedEventDataFragment$key;
  queryRef: FeedEventDataQueryFragment$key;
};

export function FeedEventData({
  caption,
  feedMode,
  eventDbid,
  queryRef,
  feedEventRef,
}: FeedEventDataProps) {
  const query = useFragment(
    graphql`
      fragment FeedEventDataQueryFragment on Query {
        ...GalleryUpdatedFeedEventQueryFragment
        ...FeedEventDataNonRecursiveQueryFragment
      }
    `,
    queryRef
  );

  const feedEvent = useFragment(
    graphql`
      fragment FeedEventDataFragment on FeedEventData {
        ... on GalleryUpdatedFeedEventData {
          __typename
          ...GalleryUpdatedFeedEventFragment
        }

        ...FeedEventDataNonRecursiveFragment
      }
    `,
    feedEventRef
  );

  if (feedEvent.__typename === 'GalleryUpdatedFeedEventData') {
    return (
      <GalleryUpdatedFeedEvent
        eventDbid={eventDbid}
        feedMode={feedMode}
        caption={caption}
        eventRef={feedEvent}
        queryRef={query}
      />
    );
  } else {
    return (
      <NonRecursiveFeedEventData
        caption={caption}
        feedMode={feedMode}
        eventDbid={eventDbid}
        queryRef={query}
        eventDataRef={feedEvent}
      />
    );
  }
}
