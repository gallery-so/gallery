import { FlashList, ListRenderItem } from '@shopify/flash-list';
import { useCallback, useMemo } from 'react';
import { graphql, useFragment } from 'react-relay';

import { FeedListCaptionFragment$key } from '~/generated/FeedListCaptionFragment.graphql';
import { FeedListFragment$key } from '~/generated/FeedListFragment.graphql';
import { FeedListItemFragment$key } from '~/generated/FeedListItemFragment.graphql';
import { FeedListSectionHeaderFragment$key } from '~/generated/FeedListSectionHeaderFragment.graphql';

import { SUPPORTED_FEED_EVENT_TYPES } from './constants';
import { FeedListCaption } from './FeedListCaption';
import { FeedListItem } from './FeedListItem';
import { FeedListSectionHeader } from './FeedListSectionHeader';

type FeedListProps = {
  feedEventRefs: FeedListFragment$key;
};

type FeedListItem =
  | { kind: 'header'; item: FeedListSectionHeaderFragment$key }
  | { kind: 'caption'; item: FeedListCaptionFragment$key }
  | { kind: 'event'; item: FeedListItemFragment$key };

export function FeedList({ feedEventRefs }: FeedListProps) {
  const events = useFragment(
    graphql`
      fragment FeedListFragment on FeedEvent @relay(plural: true) {
        __typename

        caption

        eventData @required(action: THROW) {
          __typename

          ...FeedListItemFragment
        }

        ...FeedListCaptionFragment
        ...FeedListSectionHeaderFragment
      }
    `,
    feedEventRefs
  );

  const items = useMemo(() => {
    const items: FeedListItem[] = [];

    // for (const event of events.slice(0, 25)) {
    for (const event of events) {
      // Make sure this is a supported feed event
      const isSupportedFeedEvent = SUPPORTED_FEED_EVENT_TYPES.has(event.eventData?.__typename);
      if (isSupportedFeedEvent) {
        items.push({ kind: 'header', item: event });

        if (event.caption) {
          items.push({ kind: 'caption', item: event });
        }

        items.push({ kind: 'event', item: event.eventData });
      }
    }

    return items;
  }, [events]);

  const stickyHeaderIndices = useMemo(() => {
    const indices: number[] = [];
    items.forEach((item, index) => {
      if (item.kind === 'header') {
        indices.push(index);
      }
    });

    return indices;
  }, [items]);

  const renderItem = useCallback<ListRenderItem<FeedListItem>>(({ item }) => {
    switch (item.kind) {
      case 'header':
        return <FeedListSectionHeader feedEventRef={item.item} />;
      case 'caption':
        return <FeedListCaption feedEventRef={item.item} />;
      case 'event':
        return <FeedListItem eventDataRef={item.item} />;
    }
  }, []);

  return (
    <FlashList
      estimatedItemSize={300}
      data={items}
      stickyHeaderIndices={stickyHeaderIndices}
      renderItem={renderItem}
    />
  );
}
