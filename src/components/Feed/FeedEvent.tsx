import { graphql, useFragment } from 'react-relay';
import { FeedEventFragment$key } from '__generated__/FeedEventFragment.graphql';
import { FeedEventQueryFragment$key } from '__generated__/FeedEventQueryFragment.graphql';
import CollectionCreatedFeedEvent from './Events/CollectionCreatedFeedEvent';
import CollectorsNoteAddedToTokenFeedEvent from './Events/CollectorsNoteAddedToTokenFeedEvent';
import TokensAddedToCollectionFeedEvent from './Events/TokensAddedToCollectionFeedEvent';
import UserFollowedUsersFeedEvent from './Events/UserFollowedUsersFeedEvent';
import { FeedMode } from './Feed';

type Props = {
  eventRef: FeedEventFragment$key;
  queryRef: FeedEventQueryFragment$key;
  feedMode: FeedMode;
};

export default function FeedEvent({ eventRef, queryRef, feedMode }: Props) {
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
      return <UserFollowedUsersFeedEvent eventRef={event} queryRef={query} feedMode={feedMode} />;
    // These event types are returned by the backend but are not currently spec'd to be displayed
    // case 'UserCreatedFeedEventData':
    // case 'CollectorsNoteAddedToCollectionFeedEventData':

    default:
      return null;
  }
}
