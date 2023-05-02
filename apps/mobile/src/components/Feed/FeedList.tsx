import { useScrollToTop } from '@react-navigation/native';
import { FlashList, ListRenderItem } from '@shopify/flash-list';
import { useCallback, useMemo, useRef } from 'react';
import { graphql, useFragment } from 'react-relay';

import {
  createVirtualizedFeedEventItems,
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
};

export function FeedList({ feedEventRefs, onLoadMore, queryRef }: FeedListProps) {
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
