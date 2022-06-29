import { graphql, useFragment } from 'react-relay';
import CollectionCreatedFeedEvent from './Events/CollectionCreatedFeedEvent';
import CollectorsNoteAddedToTokenFeedEvent from './Events/CollectorsNoteAddedToTokenFeedEvent';
import TokensAddedToCollectionFeedEvent from './Events/TokensAddedToCollectionFeedEvent';
import UserFollowedUsersFeedEvent from './Events/UserFollowedUsersFeedEvent';

type Props = {
  eventRef: any;
  queryRef: any;
};

export default function FeedEvent({ eventRef, queryRef }: Props) {
  const event = useFragment(
    graphql`
      fragment FeedEventFragment on FeedEventData {
        ... on CollectionCreatedFeedEventData {
          ...CollectionCreatedFeedEventFragment
        }
        ... on CollectorsNoteAddedToTokenFeedEventData {
          ...CollectorsNoteAddedToTokenFeedEventFragment
        }
        ... on UserFollowedUsersFeedEventData {
          ...UserFollowedUsersFeedEventFragment
        }
        ... on TokensAddedToCollectionFeedEventData {
          ...TokensAddedToCollectionFeedEventFragment
        }
        # UserCreatedEvent
        # CollectorsNoteAddedToCollectionEvent
        __typename
        eventTime

        action
      }
    `,
    eventRef
  );

  const query = useFragment(
    graphql`
      fragment FeedEventQueryFragment on Query {
        ...UserFollowedUsersFeedEventQueryFragment
      }
    `,
    queryRef
  );

  switch (event.__typename) {
    case 'TokensAddedToCollectionFeedEventData':
      return <TokensAddedToCollectionFeedEvent eventRef={event} />;
    case 'CollectionCreatedFeedEventData':
      return <CollectionCreatedFeedEvent eventRef={event} />;
    case 'CollectorsNoteAddedToTokenFeedEventData':
      return <CollectorsNoteAddedToTokenFeedEvent eventRef={event} />;
    case 'UserFollowedUsersFeedEventData':
      return <UserFollowedUsersFeedEvent eventRef={event} queryRef={query} />;

    default:
      //     return <NftDetailAnimation mediaRef={token.token} />;
      // }
      return null;
      return <div>Event {event.__typename}</div>;
  }
}
