import { graphql } from 'react-relay';
import { readInlineData } from 'relay-runtime';

import { SUPPORTED_FEED_EVENT_TYPES } from '~/components/Feed/constants';
import {
  createVirtualizedFeedEventItemsFragment$data,
  createVirtualizedFeedEventItemsFragment$key,
} from '~/generated/createVirtualizedFeedEventItemsFragment.graphql';

export type FeedListItemType = { key: string; eventId: string } & (
  | { kind: 'feed-item-header'; event: createVirtualizedFeedEventItemsFragment$data }
  | { kind: 'feed-item-caption'; event: createVirtualizedFeedEventItemsFragment$data }
  | { kind: 'feed-item-event'; event: createVirtualizedFeedEventItemsFragment$data }
);

type createVirtualizedItemsFromFeedEventsArgs = {
  failedEvents: Set<string>;
  eventRefs: readonly createVirtualizedFeedEventItemsFragment$key[];
};

type createVirtualizedItemsFromFeedEventsReturnType = {
  items: FeedListItemType[];
  stickyIndices: number[];
};

export function createVirtualizedFeedEventItems({
  failedEvents,
  eventRefs,
}: createVirtualizedItemsFromFeedEventsArgs): createVirtualizedItemsFromFeedEventsReturnType {
  const events = eventRefs.map((eventRef) =>
    readInlineData(
      graphql`
        fragment createVirtualizedFeedEventItemsFragment on FeedEvent @inline {
          dbid
          caption

          eventData {
            ... on GalleryUpdatedFeedEventData {
              __typename
              subEventDatas {
                __typename
              }
            }

            # eslint-disable-next-line relay/must-colocate-fragment-spreads
            ...FeedListItemFragment
          }

          # eslint-disable-next-line relay/must-colocate-fragment-spreads
          ...FeedListCaptionFragment
          # eslint-disable-next-line relay/must-colocate-fragment-spreads
          ...FeedListSectionHeaderFragment
        }
      `,
      eventRef
    )
  );

  const items: FeedListItemType[] = [];

  for (const event of events) {
    if (!event.eventData) continue;

    // Make sure this is a supported feed event
    let isSupportedFeedEvent = false;
    if (event.eventData.__typename === 'GalleryUpdatedFeedEventData') {
      isSupportedFeedEvent =
        event.eventData.subEventDatas?.some((subEvent) =>
          SUPPORTED_FEED_EVENT_TYPES.has(subEvent.__typename)
        ) ?? false;
    } else {
      isSupportedFeedEvent = SUPPORTED_FEED_EVENT_TYPES.has(event.eventData.__typename);
    }

    const isAFailedEvent = failedEvents.has(event.dbid);

    if (isSupportedFeedEvent && !isAFailedEvent) {
      items.push({
        kind: 'feed-item-header',
        event,
        key: `feed-item-header-${event.dbid}`,
        eventId: event.dbid,
      });

      if (event.caption) {
        items.push({
          kind: 'feed-item-caption',
          event,
          key: `feed-item-caption-${event.dbid}`,
          eventId: event.dbid,
        });
      }

      items.push({
        kind: 'feed-item-event',
        event,
        key: `feed-item-event-${event.dbid}`,
        eventId: event.dbid,
      });
    }
  }

  const stickyIndices: number[] = [];
  items.forEach((item, index) => {
    if (item.kind === 'feed-item-header') {
      stickyIndices.push(index);
    }
  });

  return { items, stickyIndices };
}
