import { useMemo } from 'react';
import { View } from 'react-native';
import { useFragment } from 'react-relay';
import { graphql } from 'relay-runtime';

import { TokensAddedToCollectionFeedEventFragment$key } from '~/generated/TokensAddedToCollectionFeedEventFragment.graphql';
import { removeNullValues } from '~/shared/relay/removeNullValues';

import { CollectionAndAdditionCount } from './CollectionAndAdditionCount';
import { EventTokenGrid } from './EventTokenGrid';

type TokensAddedToCollectionFeedEventProps = {
  collectionUpdatedFeedEventDataRef: TokensAddedToCollectionFeedEventFragment$key;
};

export function TokensAddedToCollectionFeedEvent({
  collectionUpdatedFeedEventDataRef,
}: TokensAddedToCollectionFeedEventProps) {
  const eventData = useFragment(
    graphql`
      fragment TokensAddedToCollectionFeedEventFragment on TokensAddedToCollectionFeedEventData {
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

      <EventTokenGrid tokenRefs={tokens} />
    </View>
  );
}
