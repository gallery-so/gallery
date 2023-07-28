import { FlashList, ListRenderItem } from '@shopify/flash-list';
import { useCallback, useRef } from 'react';
import { View } from 'react-native';
import { Tabs } from 'react-native-collapsible-tab-view';
import { graphql, useFragment, usePaginationFragment } from 'react-relay';

import {
  createVirtualizedFeedEventItems,
  FeedListItemType,
} from '~/components/Feed/createVirtualizedFeedEventItems';
import { FeedVirtualizedRow } from '~/components/Feed/FeedVirtualizedRow';
import { useFailedEventTracker } from '~/components/Feed/useFailedEventTracker';
import { useListContentStyle } from '~/components/ProfileView/Tabs/useListContentStyle';
import { CommunityViewPostsTabFragment$key } from '~/generated/CommunityViewPostsTabFragment.graphql';
import { CommunityViewPostsTabQueryFragment$key } from '~/generated/CommunityViewPostsTabQueryFragment.graphql';

type Props = {
  communityRef: CommunityViewPostsTabFragment$key;
  queryRef: CommunityViewPostsTabQueryFragment$key;
};

export function CommunityViewPostsTab({ communityRef, queryRef }: Props) {
  const { data: community } = usePaginationFragment(
    graphql`
      fragment CommunityViewPostsTabFragment on Community
      @refetchable(queryName: "CommunityViewPostsTabFragmentPaginationQuery") {
        posts(first: $postLast, after: $postBefore)
          @connection(key: "CommunityViewPostsTabFragment_posts") {
          edges {
            node {
              ...createVirtualizedFeedEventItemsPostFragment
            }
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

      return <FeedVirtualizedRow itemId={itemId} item={item} onFailure={markFailure} />;
    },
    [markEventAsFailure]
  );

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
