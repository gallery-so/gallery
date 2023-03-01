import { useMemo } from 'react';
import { View } from 'react-native';
import { useFragment } from 'react-relay';
import { graphql } from 'relay-runtime';

import { CollectionCreatedFeedEventFragment$key } from '~/generated/CollectionCreatedFeedEventFragment.graphql';
import { removeNullValues } from '~/shared/relay/removeNullValues';

import { CollectionAndAdditionCount } from './CollectionAndAdditionCount';
import { TokenCarousel } from './TokenCarousel';

type CollectionCreatedFeedEventProps = {
  collectionUpdatedFeedEventDataRef: CollectionCreatedFeedEventFragment$key;
};

export function CollectionCreatedFeedEvent({
  collectionUpdatedFeedEventDataRef,
}: CollectionCreatedFeedEventProps) {
  const eventData = useFragment(
    graphql`
      fragment CollectionCreatedFeedEventFragment on CollectionCreatedFeedEventData {
        collection {
          name
        }

        newTokens {
          token {
            ...TokenCarouselFragment
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

      <TokenCarousel tokenRefs={tokens} />
    </View>
  );
}
