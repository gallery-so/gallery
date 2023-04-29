import { useMemo } from 'react';
import { Text, View } from 'react-native';
import FastImage from 'react-native-fast-image';
import { useFragment } from 'react-relay';
import { graphql } from 'relay-runtime';

import { TokensAddedToCollectionFeedEventFragment$key } from '~/generated/TokensAddedToCollectionFeedEventFragment.graphql';
import { removeNullValues } from '~/shared/relay/removeNullValues';

import { Typography } from '../../Typography';
import { EventTokenGrid } from '../EventTokenGrid';
import { FeedEventCarouselCellHeader } from '../FeedEventCarouselCellHeader';

type TokensAddedToCollectionFeedEventProps = {
  isFirstSlide: boolean;
  allowPreserveAspectRatio: boolean;
  collectionUpdatedFeedEventDataRef: TokensAddedToCollectionFeedEventFragment$key;
};

export function TokensAddedToCollectionFeedEvent({
  isFirstSlide,
  allowPreserveAspectRatio,
  collectionUpdatedFeedEventDataRef,
}: TokensAddedToCollectionFeedEventProps) {
  const eventData = useFragment(
    graphql`
      fragment TokensAddedToCollectionFeedEventFragment on TokensAddedToCollectionFeedEventData {
        collection {
          name
        }

        newTokens {
          ...EventTokenGridFragment
        }
      }
    `,
    collectionUpdatedFeedEventDataRef
  );

  const tokens = useMemo(() => {
    return removeNullValues(eventData.newTokens);
  }, [eventData.newTokens]);

  return (
    <View className="flex flex-1 flex-col">
      <FeedEventCarouselCellHeader>
        <Text numberOfLines={1}>
          <Typography className="text-sm" font={{ family: 'ABCDiatype', weight: 'Regular' }}>
            Added new tokens to
          </Typography>{' '}
          <Typography className="text-sm" font={{ family: 'ABCDiatype', weight: 'Bold' }}>
            {eventData.collection?.name ?? 'Untitled'}
          </Typography>
        </Text>
      </FeedEventCarouselCellHeader>

      <View className="flex flex-grow">
        <EventTokenGrid
          imagePriority={isFirstSlide ? FastImage.priority.high : FastImage.priority.normal}
          allowPreserveAspectRatio={allowPreserveAspectRatio}
          collectionTokenRefs={tokens}
        />
      </View>
    </View>
  );
}
