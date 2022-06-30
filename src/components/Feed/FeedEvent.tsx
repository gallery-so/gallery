import { graphql, useFragment } from 'react-relay';
import { FeedEventFragment$key } from '__generated__/FeedEventFragment.graphql';
import { FeedEventQueryFragment$key } from '__generated__/FeedEventQueryFragment.graphql';
import CollectionCreatedFeedEvent from './Events/CollectionCreatedFeedEvent';
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
        ... on CollectionCreatedFeedEventData {
          ...CollectionCreatedFeedEventFragment
          collection {
            dbid
          }
        }
        ... on CollectorsNoteAddedToTokenFeedEventData {
          ...CollectorsNoteAddedToTokenFeedEventFragment
          token {
            id
          }
        }
        ... on TokensAddedToCollectionFeedEventData {
          ...TokensAddedToCollectionFeedEventFragment
          collection {
            dbid
          }
        }
        ... on UserFollowedUsersFeedEventData {
          ...UserFollowedUsersFeedEventFragment
          followed {
            user {
              dbid
            }
          }
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
    case 'CollectionCreatedFeedEventData':
      if (!event.collection) {
        return null;
      }
      return <CollectionCreatedFeedEvent eventRef={event} />;
    case 'CollectorsNoteAddedToTokenFeedEventData':
      if (!event.token) {
        return null;
      }
      return <CollectorsNoteAddedToTokenFeedEvent eventRef={event} />;
    case 'TokensAddedToCollectionFeedEventData':
      if (!event.collection) {
        return null;
      }
      return <TokensAddedToCollectionFeedEvent eventRef={event} />;
    case 'UserFollowedUsersFeedEventData':
      if (!event.followed) {
        return null;
      }
      return <UserFollowedUsersFeedEvent eventRef={event} queryRef={query} feedMode={feedMode} />;
    // These event types are returned by the backend but are not currently spec'd to be displayed
    // case 'UserCreatedFeedEventData':
    // case 'CollectorsNoteAddedToCollectionFeedEventData':

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
