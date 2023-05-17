import { useScrollToTop } from '@react-navigation/native';
import { FlashList, ListRenderItem } from '@shopify/flash-list';
import { useCallback, useMemo, useRef } from 'react';
import { RefreshControl } from 'react-native';
import { graphql, useFragment } from 'react-relay';

import {
  createVirtualizedFeedEventItems,
  FeedListItemType,
} from '~/components/Feed/createVirtualizedFeedEventItems';
import { FeedVirtualizedRow } from '~/components/Feed/FeedVirtualizedRow';
import { useFailedEventTracker } from '~/components/Feed/useFailedEventTracker';
import { FeedListFragment$key } from '~/generated/FeedListFragment.graphql';
import { FeedListQueryFragment$key } from '~/generated/FeedListQueryFragment.graphql';

import { ActiveFeed } from './FeedFilter';

type FeedListProps = {
  queryRef: FeedListQueryFragment$key;
  feedEventRefs: FeedListFragment$key;
  onLoadMore: () => void;
  isLoadingMore: boolean;

  isRefreshing: boolean;
  onRefresh: () => void;

  activeFeed: ActiveFeed;
  onChangeFeedMode?: (feedMode: ActiveFeed) => void;
};

export function FeedList({
  activeFeed,
  feedEventRefs,
  onLoadMore,
  queryRef,
  isRefreshing,
  onRefresh,
  onChangeFeedMode = () => {},
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

  const { items, stickyIndices } = useMemo(() => {
    return createVirtualizedFeedEventItems({ eventRefs: events, failedEvents, queryRef: query });
  }, [events, failedEvents, query]);

  const ref = useRef<FlashList<FeedListItemType> | null>(null);

  // @ts-expect-error - useScrollToTop is not typed correctly for FlashList
  useScrollToTop(ref);

  const scrollToFeedEvent = useCallback((item: FeedListItemType) => {
    if (ref.current) {
      ref.current.scrollToItem({ item, animated: true, viewPosition: 0.5 });
    }
  }, []);

  const renderItem = useCallback<ListRenderItem<FeedListItemType>>(
    ({ item }) => {
      const markFailure = () => (item.event ? markEventAsFailure(item.event.dbid) : () => {});

      return (
        <FeedVirtualizedRow
          activeFeed={activeFeed}
          eventId={item.eventId}
          item={item}
          onFailure={markFailure}
          onCommentPress={scrollToFeedEvent}
          onChangeFeed={onChangeFeedMode}
        />
      );
    },
    [activeFeed, markEventAsFailure, onChangeFeedMode, scrollToFeedEvent]
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
