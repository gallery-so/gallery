import { graphql } from 'react-relay';
import { readInlineData } from 'relay-runtime';

import { SUPPORTED_FEED_EVENT_TYPES } from '~/components/Feed/constants';
import {
  createVirtualizedFeedEventItemsFragment$data,
  createVirtualizedFeedEventItemsFragment$key,
} from '~/generated/createVirtualizedFeedEventItemsFragment.graphql';
import {
  createVirtualizedFeedEventItemsQueryFragment$data,
  createVirtualizedFeedEventItemsQueryFragment$key,
} from '~/generated/createVirtualizedFeedEventItemsQueryFragment.graphql';

export type FeedListItemType = { key: string; eventId: string } & (
  | {
      kind: 'feed-item-navigation';
      event: null;
      queryRef?: null;
    }
  | {
      kind: 'feed-item-header';
      event: createVirtualizedFeedEventItemsFragment$data;
      queryRef?: null;
    }
  | {
      kind: 'feed-item-caption';
      event: createVirtualizedFeedEventItemsFragment$data;
      queryRef?: null;
    }
  | {
      kind: 'feed-item-event';
      event: createVirtualizedFeedEventItemsFragment$data;
      queryRef?: null;
    }
  | {
      kind: 'feed-item-socialize';
      event: createVirtualizedFeedEventItemsFragment$data;
      queryRef: createVirtualizedFeedEventItemsQueryFragment$data;
    }
);

type createVirtualizedItemsFromFeedEventsArgs = {
  failedEvents: Set<string>;
  eventRefs: readonly createVirtualizedFeedEventItemsFragment$key[];
  queryRef: createVirtualizedFeedEventItemsQueryFragment$key;
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
            __typename

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

  items.push({
    kind: 'feed-item-navigation',
    event: null,
    key: 'feed-item-navigation',
    eventId: 'feed-item-navigation',
  });

  for (const event of events) {
    if (!event.eventData) continue;

    // Make sure this is a supported feed event
    let isSupportedFeedEvent = false;
    if (event.eventData.__typename === 'GalleryUpdatedFeedEventData') {
      isSupportedFeedEvent =
        event.eventData.subEventDatas?.some((subEvent) => {
          return SUPPORTED_FEED_EVENT_TYPES.has(subEvent.__typename);
        }) ?? false;
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

      items.push({
        kind: 'feed-item-socialize',
        event,
        key: `feed-item-socialize-${event.dbid}`,
        eventId: event.dbid,
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
