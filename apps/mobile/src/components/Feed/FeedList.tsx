import { useScrollToTop } from '@react-navigation/native';
import { FlashList, ListRenderItem } from '@shopify/flash-list';
import { useCallback, useMemo, useRef } from 'react';
import { graphql, useFragment } from 'react-relay';

import {
  createVirtualizedItemsFromFeedEvents,
  FeedListItemType,
} from '~/components/Feed/createVirtualizedItemsFromFeedEvents';
import { FeedVirtualizedRow } from '~/components/Feed/FeedVirtualizedRow';
import { useFailedEventTracker } from '~/components/Feed/useFailedEventTracker';
import { FeedListFragment$key } from '~/generated/FeedListFragment.graphql';

type FeedListProps = {
  feedEventRefs: FeedListFragment$key;
  onLoadMore: () => void;
  isLoadingMore: boolean;
};

export function FeedList({ feedEventRefs, onLoadMore }: FeedListProps) {
  const events = useFragment(
    graphql`
      fragment FeedListFragment on FeedEvent @relay(plural: true) {
        __typename

        dbid

        ...createVirtualizedItemsFromFeedEvents
      }
    `,
    feedEventRefs
  );

  const { failedEvents, markEventAsFailure } = useFailedEventTracker();

  const { items, stickyIndices } = useMemo(() => {
    return createVirtualizedItemsFromFeedEvents({ eventRefs: events, failedEvents });
  }, [events, failedEvents]);

  const ref = useRef<FlashList<FeedListItemType> | null>(null);

  // @ts-expect-error - useScrollToTop is not typed correctly for FlashList
  useScrollToTop(ref);

  const renderItem = useCallback<ListRenderItem<FeedListItemType>>(
    ({ item }) => {
      const markFailure = () => markEventAsFailure(item.event.dbid);

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
      stickyHeaderIndices={stickyIndices}
      getItemType={(item) => item.kind}
      keyExtractor={(item) => item.key}
    />
  );
}
