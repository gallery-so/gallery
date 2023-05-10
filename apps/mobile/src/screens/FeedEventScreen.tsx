import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { View } from 'react-native';
import { graphql, useLazyLoadQuery } from 'react-relay';

import { createVirtualizedFeedEventItems } from '~/components/Feed/createVirtualizedFeedEventItems';
import { FeedList } from '~/components/Feed/FeedList';
import { useFailedEventTracker } from '~/components/Feed/useFailedEventTracker';
import { IconContainer } from '~/components/IconContainer';
import { SafeAreaViewWithPadding } from '~/components/SafeAreaViewWithPadding';
import { FeedEventScreenQuery } from '~/generated/FeedEventScreenQuery.graphql';
import { MainTabStackNavigatorParamList } from '~/navigation/types';

import { BackIcon } from '../icons/BackIcon';

export function FeedEventScreen() {
  const route = useRoute<RouteProp<MainTabStackNavigatorParamList, 'FeedEvent'>>();
  const query = useLazyLoadQuery<FeedEventScreenQuery>(
    graphql`
      query FeedEventScreenQuery(
        $feedEventId: DBID!
        $interactionsFirst: Int!
        $interactionsAfter: String
      ) {
        feedEventById(id: $feedEventId) {
          ... on FeedEvent {
            __typename
            ...FeedListFragment
          }
        }

        ...FeedListQueryFragment
      }
    `,
    { interactionsFirst: 10, feedEventId: route.params.eventId }
  );

  const navigation = useNavigation();
  if (query.feedEventById?.__typename === 'FeedEvent') {
    return (
      <View className="flex-1 bg-white dark:bg-black">
        <SafeAreaViewWithPadding className="flex-1">
          <View className="px-3 pb-6">
            <IconContainer icon={<BackIcon />} onPress={navigation.goBack} />
          </View>

          <FeedList
            queryRef={query}
            feedEventRefs={[query.feedEventById]}
            onLoadMore={() => {}}
            isLoadingMore={false}
          />
        </SafeAreaViewWithPadding>
      </View>
    );
  }

  return null;
}
