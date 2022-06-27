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
      fragment FeedEventFragment on FeedEvent {
        ... on CollectionCreatedFeedEvent {
          ...CollectionCreatedFeedEventFragment
        }
        ... on CollectorsNoteAddedToTokenFeedEvent {
          ...CollectorsNoteAddedToTokenFeedEventFragment
        }
        ... on UserFollowedUsersFeedEvent {
          ...UserFollowedUsersFeedEventFragment
        }
        ... on TokensAddedToCollectionFeedEvent {
          ...TokensAddedToCollectionFeedEventFragment
        }
        # UserCreatedEvent
        # CollectorsNoteAddedToCollectionEvent
        __typename
        dbid
        eventTime

        action
      }
    `,
    queryRef
  );
  console.log('event', event);

  switch (event.__typename) {
    case 'TokensAddedToCollectionFeedEvent':
      return <TokensAddedToCollectionFeedEvent eventRef={event} />;
    case 'CollectionCreatedFeedEvent':
      return <CollectionCreatedFeedEvent eventRef={event} />;
    case 'CollectorsNoteAddedToTokenFeedEvent':
      return <CollectorsNoteAddedToTokenFeedEvent eventRef={event} />;
    case 'UserFollowedUsersFeedEvent':
      return <UserFollowedUsersFeedEvent eventRef={event} />;
    //   case 'VideoMedia':
    //     return <NftDetailVideo mediaRef={token.token.media} maxHeight={maxHeight} />;
    //   case 'AudioMedia':
    //     return <NftDetailAudio tokenRef={token.token} />;
    //   case 'ImageMedia':
    //     return <NftDetailImage tokenRef={token.token} maxHeight={maxHeight} />;
    //   case 'GltfMedia':
    //     return <NftDetailModel mediaRef={token.token.media} />;
    default:
      //     return <NftDetailAnimation mediaRef={token.token} />;
      // }
      return null;
      return <div>Event {event.__typename}</div>;
  }
}
