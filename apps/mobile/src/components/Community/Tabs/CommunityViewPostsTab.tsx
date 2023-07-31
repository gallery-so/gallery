import { useNavigation } from '@react-navigation/native';
import { FlashList, ListRenderItem } from '@shopify/flash-list';
import { useCallback, useRef } from 'react';
import { View } from 'react-native';
import { Tabs } from 'react-native-collapsible-tab-view';
import { graphql, useFragment, usePaginationFragment } from 'react-relay';

import { Button } from '~/components/Button';
import {
  createVirtualizedFeedEventItems,
  FeedListItemType,
} from '~/components/Feed/createVirtualizedFeedEventItems';
import { FeedVirtualizedRow } from '~/components/Feed/FeedVirtualizedRow';
import { useFailedEventTracker } from '~/components/Feed/useFailedEventTracker';
import { useListContentStyle } from '~/components/ProfileView/Tabs/useListContentStyle';
import { Typography } from '~/components/Typography';
import { CommunityViewPostsTabFragment$key } from '~/generated/CommunityViewPostsTabFragment.graphql';
import { CommunityViewPostsTabQueryFragment$key } from '~/generated/CommunityViewPostsTabQueryFragment.graphql';
import { MainTabStackNavigatorProp } from '~/navigation/types';

type Props = {
  communityRef: CommunityViewPostsTabFragment$key;
  queryRef: CommunityViewPostsTabQueryFragment$key;
};

export function CommunityViewPostsTab({ communityRef, queryRef }: Props) {
  const { data: community } = usePaginationFragment(
    graphql`
      fragment CommunityViewPostsTabFragment on Community
      @refetchable(queryName: "CommunityViewPostsTabFragmentPaginationQuery") {
        name
        contractAddress {
          address
        }
        posts(first: $postLast, after: $postBefore)
          @connection(key: "CommunityViewPostsTabFragment_posts") {
          edges {
            node {
              ...createVirtualizedFeedEventItemsPostFragment
            }
          }
          pageInfo {
            total
          }
        }
      }
    `,
    communityRef
  );

  const query = useFragment(
    graphql`
      fragment CommunityViewPostsTabQueryFragment on Query {
        ...createVirtualizedFeedEventItemsQueryFragment
      }
    `,
    queryRef
  );

  const contentContainerStyle = useListContentStyle();

  const totalPosts = community?.posts?.pageInfo?.total ?? 0;

  const { markEventAsFailure, failedEvents } = useFailedEventTracker();

  const posts = [];
  for (const edge of community?.posts?.edges ?? []) {
    if (edge?.node) {
      posts.push(edge.node);
    }
  }

  posts.reverse();

  const ref = useRef<FlashList<FeedListItemType> | null>(null);
  const { items, stickyIndices } = createVirtualizedFeedEventItems({
    itemRefs: posts,
    listRef: ref,
    failedEvents,
    queryRef: query,
  });

  const renderItem = useCallback<ListRenderItem<FeedListItemType>>(
    ({ item }) => {
      // Set a default for feed navigation pill
      let itemId: string | null = null;

      if (item.post) {
        itemId = item.post.dbid;
      } else if (item.event) {
        itemId = item.event.dbid;
      } else {
        itemId = item.eventId;
      }

      const markFailure = () => (itemId ? markEventAsFailure(itemId) : () => {});

      return <FeedVirtualizedRow item={item} onFailure={markFailure} />;
    },
    [markEventAsFailure]
  );

  const navigation = useNavigation<MainTabStackNavigatorProp>();

  const handleCreatePost = useCallback(() => {
    if (!community?.contractAddress?.address) return;
    navigation.navigate('NftSelectorContractScreen', {
      contractAddress: community?.contractAddress?.address,
      page: 'Post',
    });
  }, [navigation, community?.contractAddress?.address]);

  if (totalPosts === 0) {
    return (
      <View className="flex-1 pt-16 justify-center">
        <View className="space-y-6 px-8">
          <Typography
            font={{ family: 'ABCDiatype', weight: 'Regular' }}
            className="text-lg text-center"
          >
            It’s still early... be the first to post about{' '}
            <Typography
              font={{ family: 'ABCDiatype', weight: 'Bold' }}
              className="text-lg text-center"
            >
              {community?.name}
            </Typography>{' '}
            and inspire others!
          </Typography>

          <Button
            text={'CREATE A POST'}
            onPress={handleCreatePost}
            eventElementId={null}
            eventName={null}
          />
        </View>
      </View>
    );
  }

  return (
    <View style={contentContainerStyle}>
      <Tabs.FlashList
        ref={ref}
        data={items}
        renderItem={renderItem}
        estimatedItemSize={400}
        stickyHeaderIndices={stickyIndices}
      />
    </View>
  );
}
