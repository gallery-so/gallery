import { ResizeMode } from 'expo-av';
import { ScrollView, StyleProp, Text, useWindowDimensions, View, ViewStyle } from 'react-native';
import FastImage from 'react-native-fast-image';
import { useFragment } from 'react-relay';
import { graphql } from 'relay-runtime';

import { GalleryUpdatedFeedEventFragment$key } from '~/generated/GalleryUpdatedFeedEventFragment.graphql';
import { GalleryUpdatedFeedEventTokenUrlsFragment$key } from '~/generated/GalleryUpdatedFeedEventTokenUrlsFragment.graphql';
import getVideoOrImageUrlForNftPreview from '~/shared/relay/getVideoOrImageUrlForNftPreview';
import { removeNullValues } from '~/shared/relay/removeNullValues';

import { SvgWebView } from '../SvgWebView';
import { EventTokenGrid } from './EventTokenGrid';

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

  const subEventDatas = useFragment<GalleryUpdatedFeedEventTokenUrlsFragment$key>(
    graphql`
      fragment GalleryUpdatedFeedEventTokenUrlsFragment on FeedEventData @relay(plural: true) {
        ... on CollectionCreatedFeedEventData {
          newTokens {
            token {
              ...EventTokenGridFragment
            }
          }
        }
        ... on TokensAddedToCollectionFeedEventData {
          newTokens {
            token {
              ...EventTokenGridFragment
            }
          }
        }
        ... on CollectionUpdatedFeedEventData {
          newTokens {
            token {
              ...EventTokenGridFragment
            }
          }
        }
      }
    `,
    eventData.subEventDatas
  );

  const tokens = removeNullValues(
    subEventDatas?.flatMap((it) => {
      return it.newTokens?.map((token) => {
        if (token?.token) {
          return token.token;
        }
      });
    })
  );

  return (
    <View className="flex flex-col space-y-3">
      <View className="flex flex-row space-x-1 px-3 py-2">
        <Text style={{ fontFamily: 'ABCDiatypeBold', fontSize: 12 }}>
          {eventData.owner?.username}
        </Text>

        <Text style={{ fontFamily: 'ABCDiatypeRegular', fontSize: 12 }}>/</Text>

        <Text style={{ fontFamily: 'ABCDiatypeBold', fontSize: 12 }}>Photography</Text>
      </View>

      <View className="flex px-3 py-[2]">
        <Text style={{ fontFamily: 'ABCDiatypeBold', fontSize: 12 }}>Merik Aktar</Text>

        <Text style={{ fontFamily: 'ABCDiatypeRegular', fontSize: 12 }}>62 additions</Text>
      </View>

      <ScrollView
        horizontal
        pagingEnabled
        decelerationRate={0}
        snapToInterval={width}
        snapToAlignment={'center'}
        showsHorizontalScrollIndicator={false}
      >
        <EventTokenGrid tokenRefs={tokens} />
      </ScrollView>

      <View className="flex w-full flex-row justify-center">
        <View className="flex flex-row space-x-1">
          <Circle />
          <Circle />
          <Circle />
          <Circle />
        </View>
      </View>
    </View>
  );
}

function Circle({ style }: { style?: StyleProp<ViewStyle> }) {
  return <View className={`bg-offBlack h-1 w-1 rounded-full`} style={style} />;
}
