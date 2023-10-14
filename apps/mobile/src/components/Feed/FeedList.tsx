import { useScrollToTop } from '@react-navigation/native';
import { FlashList, ListRenderItem } from '@shopify/flash-list';
import { useCallback, useMemo, useRef } from 'react';
import { graphql, useFragment } from 'react-relay';

import {
  createVirtualizedFeedEventItems,
  createVirtualizedItemsFromFeedEventsArgs,
  FeedListItemType,
} from '~/components/Feed/createVirtualizedFeedEventItems';
import { FeedVirtualizedRow } from '~/components/Feed/FeedVirtualizedRow';
import { useFailedEventTracker } from '~/components/Feed/useFailedEventTracker';
import { GalleryRefreshControl } from '~/components/GalleryRefreshControl';
import { FeedListFragment$key } from '~/generated/FeedListFragment.graphql';
import { FeedListQueryFragment$key } from '~/generated/FeedListQueryFragment.graphql';
import { noop } from '~/shared/utils/noop';

type FeedListProps = {
  queryRef: FeedListQueryFragment$key;
  feedEventRefs: FeedListFragment$key;
  onLoadMore: () => void;
  isLoadingMore: boolean;

  isRefreshing: boolean;
  onRefresh: () => void;

  feedFilter?: createVirtualizedItemsFromFeedEventsArgs['feedFilter'];
};

export function FeedList({
  feedEventRefs,
  onLoadMore,
  queryRef,
  isRefreshing,
  onRefresh,
  feedFilter,
}: FeedListProps) {
  const query = useFragment(
    graphql`
      fragment FeedListQueryFragment on Query {
        ...createVirtualizedFeedEventItemsQueryFragment
      }
    `,
    queryRef
  );

  const posts = useFragment(
    graphql`
      fragment FeedListFragment on FeedEventOrError @relay(plural: true) {
        __typename
        ...createVirtualizedFeedEventItemsFragment
        ...createVirtualizedFeedEventItemsPostFragment
      }
    `,
    feedEventRefs
  );

  const { failedEvents, markEventAsFailure } = useFailedEventTracker();
  const ref = useRef<FlashList<FeedListItemType> | null>(null);

  const { items } = useMemo(() => {
    return createVirtualizedFeedEventItems({
      itemRefs: posts,
      failedEvents,
      queryRef: query,
      feedFilter,
      listRef: ref,
    });
  }, [posts, failedEvents, feedFilter, query]);

  // @ts-expect-error - useScrollToTop is not typed correctly for FlashList
  useScrollToTop(ref);

  const renderItem = useCallback<ListRenderItem<FeedListItemType>>(
    ({ item }) => {
      let itemId: string | null = null;

      if (item.post) {
        itemId = item.post.dbid;
      } else if (item.event) {
        itemId = item.event.dbid;
      } else {
        itemId = item.eventId;
      }

      const markFailure = () => (itemId ? markEventAsFailure(itemId) : noop);

      return <FeedVirtualizedRow item={item} onFailure={markFailure} />;
    },
    [markEventAsFailure]
  );

  return (
    <FlashList
      ref={ref}
      data={items}
      onEndReached={onLoadMore}
      onEndReachedThreshold={0.8}
      estimatedItemSize={300}
      renderItem={renderItem}
      scrollEventThrottle={100}
      getItemType={(item) => item.kind}
      keyExtractor={(item) => item.key}
      refreshControl={<GalleryRefreshControl refreshing={isRefreshing} onRefresh={onRefresh} />}
    />
  );
}
