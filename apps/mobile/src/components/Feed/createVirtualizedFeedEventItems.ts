import { FlashList } from '@shopify/flash-list';
import { MutableRefObject } from 'react';
import { graphql } from 'react-relay';
import { readInlineData } from 'relay-runtime';

import { SUPPORTED_FEED_EVENT_TYPES } from '~/components/Feed/constants';
import { ActiveFeed } from '~/components/Feed/FeedFilter';
import {
  createVirtualizedFeedEventItemsFragment$data,
  createVirtualizedFeedEventItemsFragment$key,
} from '~/generated/createVirtualizedFeedEventItemsFragment.graphql';
import {
  createVirtualizedFeedEventItemsPostFragment$data,
  createVirtualizedFeedEventItemsPostFragment$key,
} from '~/generated/createVirtualizedFeedEventItemsPostFragment.graphql';
import {
  createVirtualizedFeedEventItemsQueryFragment$data,
  createVirtualizedFeedEventItemsQueryFragment$key,
} from '~/generated/createVirtualizedFeedEventItemsQueryFragment.graphql';

export type FeedListItemType = { key: string } & (
  | {
      kind: 'feed-item-navigation';
      activeFeed: ActiveFeed;
      onFilterChange: (feed: ActiveFeed) => void;
      event: null;
      queryRef?: null;
      eventId: string;
    }
  | {
      kind: 'feed-item-header';
      event: createVirtualizedFeedEventItemsFragment$data;
      queryRef: createVirtualizedFeedEventItemsQueryFragment$data;
      eventId: string;
    }
  | {
      kind: 'feed-item-caption';
      event: createVirtualizedFeedEventItemsFragment$data;
      queryRef?: null;
      eventId: string;
    }
  | {
      kind: 'feed-item-event';
      event: createVirtualizedFeedEventItemsFragment$data;
      queryRef: createVirtualizedFeedEventItemsQueryFragment$data;
      eventId: string;
    }
  | {
      kind: 'feed-item-socialize';
      event: createVirtualizedFeedEventItemsFragment$data;
      queryRef: createVirtualizedFeedEventItemsQueryFragment$data;
      onCommentPress: () => void;
      eventId: string;
    }
  | {
      kind: 'post-item-header';
      post: createVirtualizedFeedEventItemsPostFragment$data;
      queryRef: createVirtualizedFeedEventItemsQueryFragment$data;
      postId: string;
    }
  | {
      kind: 'post-item-caption';
      post: createVirtualizedFeedEventItemsPostFragment$data;
      queryRef?: null;
      postId: string;
    }
  | {
      kind: 'post-item-event';
      post: createVirtualizedFeedEventItemsPostFragment$data;
      queryRef: createVirtualizedFeedEventItemsQueryFragment$data;
      postId: string;
    }
  | {
      kind: 'post-item-socialize';
      post: createVirtualizedFeedEventItemsPostFragment$data;
      queryRef: createVirtualizedFeedEventItemsQueryFragment$data;
      onCommentPress: () => void;
      postId: string;
    }
);

export type createVirtualizedItemsFromFeedEventsArgs = {
  failedEvents: Set<string>;
  eventRefs: readonly createVirtualizedFeedEventItemsFragment$key[];
  postRefs: readonly createVirtualizedFeedEventItemsPostFragment$key[];
  queryRef: createVirtualizedFeedEventItemsQueryFragment$key;
  listRef: MutableRefObject<FlashList<FeedListItemType> | null>;

  feedFilter?: {
    activeFeed: ActiveFeed;
    onFeedChange: (feed: ActiveFeed) => void;
  };
};

type createVirtualizedItemsFromFeedEventsReturnType = {
  items: FeedListItemType[];
  stickyIndices: number[];
};

export function createVirtualizedFeedEventItems({
  failedEvents,
  eventRefs,
  postRefs,
  queryRef,
  listRef,
  feedFilter,
}: createVirtualizedItemsFromFeedEventsArgs): createVirtualizedItemsFromFeedEventsReturnType {
  const query = readInlineData(
    graphql`
      fragment createVirtualizedFeedEventItemsQueryFragment on Query @inline {
        # eslint-disable-next-line relay/must-colocate-fragment-spreads
        ...FeedEventSocializeSectionQueryFragment
        # eslint-disable-next-line relay/must-colocate-fragment-spreads
        ...FeedListItemQueryFragment
        # eslint-disable-next-line relay/must-colocate-fragment-spreads
        ...PostListSectionHeaderQueryFragment
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
          }

          # eslint-disable-next-line relay/must-colocate-fragment-spreads
          ...FeedListItemFragment
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

  const posts = postRefs
    .map((postRef) =>
      readInlineData(
        graphql`
          fragment createVirtualizedFeedEventItemsPostFragment on Post @inline {
            __typename
            dbid
            caption
            tokens {
              __typename
            }

            # eslint-disable-next-line relay/must-colocate-fragment-spreads
            ...PostListSectionHeaderFragment
            # eslint-disable-next-line relay/must-colocate-fragment-spreads
            ...PostListCaptionFragment
            # eslint-disable-next-line relay/must-colocate-fragment-spreads
            ...PostListItemFragment
          }
        `,
        postRef
      )
    )
    // Filter out posts that don't have tokens
    .filter((post) => post.tokens?.length);

  const items: FeedListItemType[] = [];

  if (feedFilter) {
    items.push({
      kind: 'feed-item-navigation',
      event: null,
      key: 'feed-item-navigation',
      eventId: 'feed-item-navigation',
      onFilterChange: feedFilter.onFeedChange,
      activeFeed: feedFilter.activeFeed,
    });
  }

  for (const post of posts) {
    items.push({
      kind: 'post-item-header',
      post,
      queryRef: query,
      key: `post-item-header-${post.dbid}`,
      postId: post.dbid,
    });

    if (post.caption) {
      items.push({
        kind: 'post-item-caption',
        post,
        key: `post-item-caption-${post.dbid}`,
        postId: post.dbid,
      });
    }

    items.push({
      kind: 'post-item-event',
      post,
      queryRef: query,
      key: `post-item-event-${post.dbid}`,
      postId: post.dbid,
    });

    items.push({
      kind: 'post-item-socialize',
      post,
      queryRef: query,
      key: `post-item-socialize-${post.dbid}`,
      postId: post.dbid,
      onCommentPress: function () {
        listRef.current?.scrollToItem({ item: this, animated: true, viewOffset: 0.5 });
      },
    });
  }

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
        queryRef: query,
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
        queryRef: query,
        eventId: event.dbid,
      });

      items.push({
        kind: 'feed-item-socialize',
        event,
        key: `feed-item-socialize-${event.dbid}`,
        eventId: event.dbid,
        queryRef: query,
        onCommentPress: function () {
          listRef.current?.scrollToItem({ item: this, animated: true, viewOffset: 0.5 });
        },
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
