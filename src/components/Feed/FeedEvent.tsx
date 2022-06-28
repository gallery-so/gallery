import { graphql, useFragment } from 'react-relay';
import CollectionCreatedFeedEvent from './Events/CollectionCreatedFeedEvent';
import CollectorsNoteAddedToTokenFeedEvent from './Events/CollectorsNoteAddedToTokenFeedEvent';
import TokensAddedToCollectionFeedEvent from './Events/TokensAddedToCollectionFeedEvent';
import UserFollowedUsersFeedEvent from './Events/UserFollowedUsersFeedEvent';

type Props = {
  queryRef: any;
};

export default function FeedEvent({ queryRef }: Props) {
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
      return <UserFollowedUsersFeedEvent eventRef={event} />;

    default:
      //     return <NftDetailAnimation mediaRef={token.token} />;
      // }
      return null;
      return <div>Event {event.__typename}</div>;
  }
}
