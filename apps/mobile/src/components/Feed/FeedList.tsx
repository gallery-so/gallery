import { useScrollToTop } from '@react-navigation/native';
import { FlashList, ListRenderItem } from '@shopify/flash-list';
import { useCallback, useMemo, useRef } from 'react';
import { RefreshControl } from 'react-native';
import { graphql, useFragment } from 'react-relay';

import {
  createVirtualizedFeedEventItems,
  createVirtualizedItemsFromFeedEventsArgs,
  FeedListItemType,
} from '~/components/Feed/createVirtualizedFeedEventItems';
import { FeedVirtualizedRow } from '~/components/Feed/FeedVirtualizedRow';
import { useFailedEventTracker } from '~/components/Feed/useFailedEventTracker';
import { FeedListFragment$key } from '~/generated/FeedListFragment.graphql';
import { FeedListQueryFragment$key } from '~/generated/FeedListQueryFragment.graphql';

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

  const events = useFragment(
    graphql`
      fragment FeedListFragment on FeedEvent @relay(plural: true) {
        __typename

        dbid

        ...createVirtualizedFeedEventItemsFragment
      }
    `,
    feedEventRefs
  );

  const { failedEvents, markEventAsFailure } = useFailedEventTracker();
  const ref = useRef<FlashList<FeedListItemType> | null>(null);

  const { items, stickyIndices } = useMemo(() => {
    return createVirtualizedFeedEventItems({
      eventRefs: events,
      failedEvents,
      queryRef: query,
      feedFilter,
      listRef: ref,
    });
  }, [events, failedEvents, feedFilter, query]);

  // @ts-expect-error - useScrollToTop is not typed correctly for FlashList
  useScrollToTop(ref);

  const renderItem = useCallback<ListRenderItem<FeedListItemType>>(
    ({ item }) => {
      const markFailure = () => (item.event ? markEventAsFailure(item.event.dbid) : () => {});

      return <FeedVirtualizedRow eventId={item.eventId} item={item} onFailure={markFailure} />;
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
      stickyHeaderIndices={stickyIndices}
      getItemType={(item) => item.kind}
      keyExtractor={(item) => item.key}
      refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} />}
    />
  );
}
