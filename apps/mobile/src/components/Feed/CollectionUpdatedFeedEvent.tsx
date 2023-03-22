import { useMemo } from 'react';
import { View } from 'react-native';
import { useFragment } from 'react-relay';
import { graphql } from 'relay-runtime';

import { CollectionUpdatedFeedEventFragment$key } from '~/generated/CollectionUpdatedFeedEventFragment.graphql';
import { removeNullValues } from '~/shared/relay/removeNullValues';

import { CollectionAndAdditionCount } from './CollectionAndAdditionCount';
import { EventTokenGrid } from './EventTokenGrid';
import { FeedListCollectorsNote } from './FeedListCollectorsNote';

type CollectionUpdatedFeedEventProps = {
  collectionUpdatedFeedEventDataRef: CollectionUpdatedFeedEventFragment$key;
};

export function CollectionUpdatedFeedEvent({
  collectionUpdatedFeedEventDataRef,
}: CollectionUpdatedFeedEventProps) {
  const eventData = useFragment(
    graphql`
      fragment CollectionUpdatedFeedEventFragment on CollectionUpdatedFeedEventData {
        newCollectorsNote

        collection {
          name
        }

        newTokens {
          token {
            ...EventTokenGridFragment
          }
        }
      }
    `,
    collectionUpdatedFeedEventDataRef
  );

  const tokens = useMemo(() => {
    return removeNullValues(eventData.newTokens?.map((collectionToken) => collectionToken?.token));
  }, [eventData.newTokens]);

  return (
    <View className="flex flex-col">
      <CollectionAndAdditionCount
        collectionName={eventData.collection?.name}
        additionCount={eventData.newTokens?.length}
      />

      {eventData.newCollectorsNote && (
        <FeedListCollectorsNote collectorsNote={eventData.newCollectorsNote} />
      )}

      <EventTokenGrid tokenRefs={tokens} />
    </View>
  );
}
