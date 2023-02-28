import { Fragment, useMemo } from 'react';
import { Text, useWindowDimensions, View } from 'react-native';
import { useFragment } from 'react-relay';
import { graphql } from 'relay-runtime';

import { GalleryUpdatedFeedEventFragment$key } from '~/generated/GalleryUpdatedFeedEventFragment.graphql';
import { GalleryUpdatedFeedEventTokenUrlsFragment$key } from '~/generated/GalleryUpdatedFeedEventTokenUrlsFragment.graphql';
import { removeNullValues } from '~/shared/relay/removeNullValues';

import { CollectionCreatedFeedEvent } from './CollectionCreatedFeedEvent';
import { TokensAddedToCollectionFeedEvent } from './TokensAddedToCollectionFeedEvent';

type GalleryUpdatedFeedEventProps = {
  galleryUpdatedFeedEventDataRef: GalleryUpdatedFeedEventFragment$key;
};

export function GalleryUpdatedFeedEvent({
  galleryUpdatedFeedEventDataRef,
}: GalleryUpdatedFeedEventProps) {
  const eventData = useFragment(
    graphql`
      fragment GalleryUpdatedFeedEventFragment on GalleryUpdatedFeedEventData {
        owner {
          username
        }

        subEventDatas {
          ...GalleryUpdatedFeedEventTokenUrlsFragment
        }
      }
    `,
    galleryUpdatedFeedEventDataRef
  );

  const { width } = useWindowDimensions();

  const subEvents = useFragment<GalleryUpdatedFeedEventTokenUrlsFragment$key>(
    graphql`
      fragment GalleryUpdatedFeedEventTokenUrlsFragment on FeedEventData @relay(plural: true) {
        __typename
        ... on GalleryInfoUpdatedFeedEventData {
          __typename
        }

        ... on CollectionUpdatedFeedEventData {
          __typename
        }

        ... on TokensAddedToCollectionFeedEventData {
          __typename
          ...TokensAddedToCollectionFeedEventFragment
        }

        ... on CollectionCreatedFeedEventData {
          ...CollectionCreatedFeedEventFragment
        }
      }
    `,
    eventData.subEventDatas
  );

  return (
    <View className="flex flex-col space-y-3">
      {/*<View className="flex flex-row space-x-1 px-3 py-2">*/}
      {/*  <Text style={{ fontFamily: 'ABCDiatypeBold', fontSize: 12 }}>*/}
      {/*    {eventData.owner?.username}*/}
      {/*  </Text>*/}

      {/*  <Text style={{ fontFamily: 'ABCDiatypeRegular', fontSize: 12 }}>/</Text>*/}

      {/*  <Text style={{ fontFamily: 'ABCDiatypeBold', fontSize: 12 }}>Photography</Text>*/}
      {/*</View>*/}

      {subEvents?.map((subEvent, index) => {
        switch (subEvent.__typename) {
          case 'CollectionCreatedFeedEventData':
            return (
              <CollectionCreatedFeedEvent
                key={index}
                collectionUpdatedFeedEventDataRef={subEvent}
              />
            );
          case 'TokensAddedToCollectionFeedEventData':
            return (
              <TokensAddedToCollectionFeedEvent
                key={index}
                collectionUpdatedFeedEventDataRef={subEvent}
              />
            );
          default:
            console.log(subEvent.__typename);
            return null;
        }
      })}
    </View>
  );
}
