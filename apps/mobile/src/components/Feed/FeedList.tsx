import { FlashList, ListRenderItem } from '@shopify/flash-list';
import { useCallback, useMemo } from 'react';
import { graphql, useFragment } from 'react-relay';

import { FeedListCaptionFragment$key } from '~/generated/FeedListCaptionFragment.graphql';
import { FeedListFragment$key } from '~/generated/FeedListFragment.graphql';
import { FeedListItemFragment$key } from '~/generated/FeedListItemFragment.graphql';
import { FeedListSectionHeaderFragment$key } from '~/generated/FeedListSectionHeaderFragment.graphql';
import { removeNullValues } from '~/shared/relay/removeNullValues';

import { FeedListCaption } from './FeedListCaption';
import { FeedListItem } from './FeedListItem';
import { FeedListSectionHeader } from './FeedListSectionHeader';

type FeedListProps = {
  feedEventRefs: FeedListFragment$key;
};

const SUPPORTED_FEED_EVENT_TYPES = new Set([
  'GalleryUpdatedFeedEventData',
  'CollectionCreatedFeedEventData',
  'CollectionUpdatedFeedEventData',
  'TokensAddedToCollectionFeedEventData',
  'CollectorsNoteAddedToCollectionFeedEventData',
]);

export function FeedList({ feedEventRefs }: FeedListProps) {
  const events = useFragment(
    graphql`
      fragment FeedListFragment on FeedEvent @relay(plural: true) {
        __typename

        caption

        eventData {
          __typename

          ... on GalleryUpdatedFeedEventData {
            subEventDatas {
              __typename
              ...FeedListItemFragment
            }
          }

          ...FeedListItemFragment
        }

        ...FeedListCaptionFragment
        ...FeedListSectionHeaderFragment
      }
    `,
    feedEventRefs
  );

  const items = useMemo(() => {
    const items: Array<
      | { kind: 'header'; item: FeedListSectionHeaderFragment$key }
      | { kind: 'caption'; item: FeedListCaptionFragment$key }
      | { kind: 'event'; item: FeedListItemFragment$key }
    > = [];

    for (const event of events) {
      // Make sure this is a supported feed event
      if (!event.eventData || !SUPPORTED_FEED_EVENT_TYPES.has(event.eventData?.__typename)) {
        continue;
      }

      const eventsInSection = [];
      if (event.eventData?.__typename === 'GalleryUpdatedFeedEventData') {
        eventsInSection.push(
          ...removeNullValues(event.eventData.subEventDatas).filter((subEvent) => {
            return SUPPORTED_FEED_EVENT_TYPES.has(subEvent.__typename);
          })
        );
      } else if (event.eventData) {
        eventsInSection.push(event.eventData);
      }

      if (eventsInSection.length) {
        items.push({ kind: 'header', item: event });
        items.push({ kind: 'caption', item: event });

        items.push(
          ...eventsInSection.map((event) => {
            return { kind: 'event', item: event } as const;
          })
        );
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

  const renderItem = useCallback<ListRenderItem<(typeof items)[number]>>(({ item }) => {
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
