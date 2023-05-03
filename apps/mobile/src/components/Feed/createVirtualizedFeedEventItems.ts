import { graphql } from 'react-relay';
import { readInlineData } from 'relay-runtime';

import { SUPPORTED_FEED_EVENT_TYPES } from '~/components/Feed/constants';
import {
  createVirtualizedFeedEventItemsFragment$data,
  createVirtualizedFeedEventItemsFragment$key,
} from '~/generated/createVirtualizedFeedEventItemsFragment.graphql';
import { createVirtualizedFeedEventItemsQueryFragment$key } from '~/generated/createVirtualizedFeedEventItemsQueryFragment.graphql';
import { FeedEventSocializeSectionQueryFragment$key } from '~/generated/FeedEventSocializeSectionQueryFragment.graphql';

export type FeedListItemType = { key: string } & (
  | { kind: 'feed-item-header'; event: createVirtualizedFeedEventItemsFragment$data }
  | { kind: 'feed-item-caption'; event: createVirtualizedFeedEventItemsFragment$data }
  | { kind: 'feed-item-event'; event: createVirtualizedFeedEventItemsFragment$data }
  | {
      kind: 'feed-item-socialize';
      event: createVirtualizedFeedEventItemsFragment$data;
      queryRef: FeedEventSocializeSectionQueryFragment$key;
    }
);

type createVirtualizedItemsFromFeedEventsArgs = {
  failedEvents: Set<string>;
  queryRef: createVirtualizedFeedEventItemsQueryFragment$key;
  eventRefs: readonly createVirtualizedFeedEventItemsFragment$key[];
};

type createVirtualizedItemsFromFeedEventsReturnType = {
  items: FeedListItemType[];
  stickyIndices: number[];
};

export function createVirtualizedFeedEventItems({
  failedEvents,
  eventRefs,
  queryRef,
}: createVirtualizedItemsFromFeedEventsArgs): createVirtualizedItemsFromFeedEventsReturnType {
  const query = readInlineData(
    graphql`
      fragment createVirtualizedFeedEventItemsQueryFragment on Query @inline {
        # eslint-disable-next-line relay/must-colocate-fragment-spreads
        ...FeedEventSocializeSectionQueryFragment
      }
    `,
    queryRef
  );

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

      items.push({
        kind: 'feed-item-socialize',
        event,
        key: `feed-item-socialize-${event.dbid}`,
        queryRef: query,
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
