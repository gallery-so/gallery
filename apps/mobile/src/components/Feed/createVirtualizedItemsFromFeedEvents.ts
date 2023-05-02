import { graphql } from 'react-relay';
import { readInlineData } from 'relay-runtime';

import { SUPPORTED_FEED_EVENT_TYPES } from '~/components/Feed/constants';
import {
  createVirtualizedItemsFromFeedEvents$data,
  createVirtualizedItemsFromFeedEvents$key,
} from '~/generated/createVirtualizedItemsFromFeedEvents.graphql';

export type FeedListItemType = { key: string } & (
  | { kind: 'feed-item-header'; event: createVirtualizedItemsFromFeedEvents$data }
  | { kind: 'feed-item-caption'; event: createVirtualizedItemsFromFeedEvents$data }
  | { kind: 'feed-item-event'; event: createVirtualizedItemsFromFeedEvents$data }
  | { kind: 'feed-item-socialize'; event: createVirtualizedItemsFromFeedEvents$data }
);

type createVirtualizedItemsFromFeedEventsArgs = {
  failedEvents: Set<string>;
  eventRefs: readonly createVirtualizedItemsFromFeedEvents$key[];
};

type createVirtualizedItemsFromFeedEventsReturnType = {
  items: FeedListItemType[];
  stickyIndices: number[];
};

export function createVirtualizedItemsFromFeedEvents({
  failedEvents,
  eventRefs,
}: createVirtualizedItemsFromFeedEventsArgs): createVirtualizedItemsFromFeedEventsReturnType {
  const events = eventRefs.map((eventRef) =>
    readInlineData(
      graphql`
        fragment createVirtualizedItemsFromFeedEvents on FeedEvent @inline {
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
          # eslint-disable-next-line relay/must-colocate-fragment-spreads
          ...FeedEventSocializeSectionFragment
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
      items.push({ kind: 'feed-item-header', event, key: `feed-item-header-${event.dbid}` });

      if (event.caption) {
        items.push({ kind: 'feed-item-caption', event, key: `feed-item-caption-${event.dbid}` });
      }

      items.push({ kind: 'feed-item-event', event, key: `feed-item-event-${event.dbid}` });
      items.push({ kind: 'feed-item-socialize', event, key: `feed-item-socialize-${event.dbid}` });
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
