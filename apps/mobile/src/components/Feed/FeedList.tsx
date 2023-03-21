import { FlashList, ListRenderItem } from '@shopify/flash-list';
import { useCallback, useMemo } from 'react';
import { graphql, useFragment } from 'react-relay';

import { CaptionListItemFragment$key } from '~/generated/CaptionListItemFragment.graphql';
import { FeedListFragment$key } from '~/generated/FeedListFragment.graphql';
import { FeedListItemFragment$key } from '~/generated/FeedListItemFragment.graphql';
import { FeedListSectionHeaderFragment$key } from '~/generated/FeedListSectionHeaderFragment.graphql';
import { removeNullValues } from '~/shared/relay/removeNullValues';

import { CaptionListItem } from './CaptionListItem';
import { FeedListItem } from './FeedListItem';
import { FeedListSectionHeader } from './FeedListSectionHeader';

type FeedListProps = {
  feedEventRefs: FeedListFragment$key;
};

export function FeedList({ feedEventRefs }: FeedListProps) {
  const events = useFragment(
    graphql`
      fragment FeedListFragment on FeedEvent @relay(plural: true) {
        __typename

        eventData {
          ... on GalleryUpdatedFeedEventData {
            __typename
            subEventDatas {
              ...FeedListItemFragment
            }
          }

          ...FeedListItemFragment
        }

        ...FeedListSectionHeaderFragment
        ...CaptionListItemFragment
      }
    `,
    feedEventRefs
  );

  const items = useMemo(() => {
    const items: Array<
      | { kind: 'header'; item: FeedListSectionHeaderFragment$key }
      | { kind: 'caption'; item: CaptionListItemFragment$key }
      | { kind: 'event'; item: FeedListItemFragment$key }
    > = [];

    for (const event of events) {
      items.push({ kind: 'header', item: event });
      items.push({ kind: 'caption', item: event });

      const eventsInSection = [];
      if (event.eventData?.__typename === 'GalleryUpdatedFeedEventData') {
        eventsInSection.push(...removeNullValues(event.eventData.subEventDatas));
      } else if (event.eventData) {
        eventsInSection.push(event.eventData);
      }

      items.push(
        ...eventsInSection.map((event) => {
          return { kind: 'event', item: event } as const;
        })
      );
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

  console.log(stickyHeaderIndices);

  const renderItem = useCallback<ListRenderItem<(typeof items)[number]>>(({ item }) => {
    switch (item.kind) {
      case 'header':
        return <FeedListSectionHeader feedEventRef={item.item} />;
      case 'caption':
        return <CaptionListItem feedEventRef={item.item} />;
      case 'event':
        return <FeedListItem eventDataRef={item.item} />;
    }
  }, []);

  return (
    <FlashList
      estimatedItemSize={400}
      data={items}
      stickyHeaderIndices={stickyHeaderIndices}
      renderItem={renderItem}
    />
  );
}
