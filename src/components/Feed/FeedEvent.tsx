import { graphql, useFragment } from 'react-relay';
import CollectionCreatedEvent from './Events/CollectionCreatedEvent';
import CollectorsNoteAddedToTokenEvent from './Events/CollectorsNoteAddedToTokenEvent';
import TokensAddedToCollectionEvent from './Events/TokensAddedToCollectionEvent';
import UserFollowedUsersEvent from './Events/UserFollowedUsersEvent';

type Props = {
  queryRef: any;
};

export default function FeedEvent({ queryRef }: Props) {
  const event = useFragment(
    graphql`
      fragment FeedEventFragment on Event {
        ... on CollectionCreatedEvent {
          ...CollectionCreatedEventFragment
        }
        ... on CollectorsNoteAddedToTokenEvent {
          ...CollectorsNoteAddedToTokenEventFragment
        }
        ... on UserFollowedUsersEvent {
          ...UserFollowedUsersEventFragment
        }
        ... on TokensAddedToCollectionEvent {
          ...TokensAddedToCollectionEventFragment
        }
        # UserCreatedEvent
        # CollectorsNoteAddedToCollectionEvent
        __typename
        dbid
        eventTime
        owner {
          dbid
        }
        action
      }
    `,
    queryRef
  );
  console.log('event', event);

  switch (event.__typename) {
    case 'TokensAddedToCollectionEvent':
      return <TokensAddedToCollectionEvent eventRef={event} />;
    case 'CollectionCreatedEvent':
      return <CollectionCreatedEvent eventRef={event} />;
    case 'CollectorsNoteAddedToTokenEvent':
      return <CollectorsNoteAddedToTokenEvent eventRef={event} />;
    case 'UserFollowedUsersEvent':
      return <UserFollowedUsersEvent eventRef={event} />;
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
