import { graphql, useFragment } from 'react-relay';
import { FeedEventFragment$key } from '__generated__/FeedEventFragment.graphql';
import { FeedEventQueryFragment$key } from '__generated__/FeedEventQueryFragment.graphql';
import CollectionCreatedFeedEvent from './Events/CollectionCreatedFeedEvent';
import CollectorsNoteAddedToCollectionFeedEvent from './Events/CollectorsNoteAddedToCollectionFeedEvent';
import CollectorsNoteAddedToTokenFeedEvent from './Events/CollectorsNoteAddedToTokenFeedEvent';
import TokensAddedToCollectionFeedEvent from './Events/TokensAddedToCollectionFeedEvent';
import UserFollowedUsersFeedEvent from './Events/UserFollowedUsersFeedEvent';
import { FeedMode } from './Feed';
import FeedEventErrorBoundary from './FeedEventErrorBoundary';

type Props = {
  eventRef: FeedEventFragment$key;
  queryRef: FeedEventQueryFragment$key;
  feedMode: FeedMode;
};

function FeedEvent({ eventRef, queryRef, feedMode }: Props) {
  const event = useFragment(
    graphql`
      fragment FeedEventFragment on FeedEventData {
        __typename

        action
        eventTime

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
      }
    `,
    eventRef
  );

  const query = useFragment(
    graphql`
      fragment FeedEventQueryFragment on Query {
        ...UserFollowedUsersFeedEventQueryFragment
        ...TokensAddedToCollectionFeedEventQueryFragment
        ...CollectorsNoteAddedToCollectionFeedEventQueryFragment
        ...CollectionCreatedFeedEventQueryFragment
        ...CollectorsNoteAddedToTokenFeedEventQueryFragment
      }
    `,
    queryRef
  );

  switch (event.__typename) {
    case 'CollectionCreatedFeedEventData':
      return <CollectionCreatedFeedEvent eventRef={event} queryRef={query} />;
    case 'CollectorsNoteAddedToTokenFeedEventData':
      return <CollectorsNoteAddedToTokenFeedEvent eventRef={event} queryRef={query} />;
    case 'TokensAddedToCollectionFeedEventData':
      return <TokensAddedToCollectionFeedEvent eventRef={event} queryRef={query} />;
    case 'CollectorsNoteAddedToCollectionFeedEventData':
      return <CollectorsNoteAddedToCollectionFeedEvent eventRef={event} queryRef={query} />;
    case 'UserFollowedUsersFeedEventData':
      return <UserFollowedUsersFeedEvent eventRef={event} queryRef={query} feedMode={feedMode} />;

    // These event types are returned by the backend but are not currently spec'd to be displayed
    // case 'UserCreatedFeedEventData':

    default:
      return null;
  }
}

export default function FeedEventWithBoundary(props: Props) {
  return (
    <FeedEventErrorBoundary>
      <FeedEvent {...props} />
    </FeedEventErrorBoundary>
  );
}
