import { ScrollView, StyleProp, Text, useWindowDimensions, View, ViewStyle } from 'react-native';
import { useFragment } from 'react-relay';
import { graphql } from 'relay-runtime';

import { RecusriveFeedEventFragment$key } from '~/generated/RecusriveFeedEventFragment.graphql';
import { RecusriveFeedEventTokenUrlsFragment$key } from '~/generated/RecusriveFeedEventTokenUrlsFragment.graphql';
import { removeNullValues } from '~/shared/relay/removeNullValues';

import { EventTokenGrid } from './EventTokenGrid';

type RecusriveFeedEventProps = {
  RecusriveFeedEventDataRef: RecusriveFeedEventFragment$key;
};

export function RecursiveFeedEvent({ RecusriveFeedEventDataRef }: RecusriveFeedEventProps) {
  const eventData = useFragment(
    graphql`
      fragment RecusriveFeedEventFragment on RecusriveFeedEventData {
        owner {
          username
        }

        subEventDatas {
          ...RecusriveFeedEventTokenUrlsFragment
        }
      }
    `,
    RecusriveFeedEventDataRef
  );

  const { width } = useWindowDimensions();

  const subEventDatas = useFragment<RecusriveFeedEventTokenUrlsFragment$key>(
    graphql`
      fragment RecusriveFeedEventTokenUrlsFragment on FeedEventData @relay(plural: true) {
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
      <View className="flex flex-col">
        <View className="flex flex-row space-x-1 px-3 py-2">
          <Text style={{ fontFamily: 'ABCDiatypeBold', fontSize: 12 }}>
            {eventData.owner?.username}
          </Text>

          <Text style={{ fontFamily: 'ABCDiatypeRegular', fontSize: 12 }}>/</Text>

          <Text style={{ fontFamily: 'ABCDiatypeBold', fontSize: 12 }}>Photography</Text>
        </View>

        <ScrollView
          horizontal
          pagingEnabled
          decelerationRate={0}
          snapToInterval={width}
          snapToAlignment={'center'}
          showsHorizontalScrollIndicator={false}
        >
          <View className="flex flex-col">
            <View className="flex px-3 py-2">
              <Text style={{ fontFamily: 'ABCDiatypeBold', fontSize: 12 }}>Merik Aktar</Text>

              <Text style={{ fontFamily: 'ABCDiatypeRegular', fontSize: 12 }}>62 additions</Text>
            </View>

            <EventTokenGrid tokenRefs={tokens} />
          </View>
        </ScrollView>
      </View>

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
