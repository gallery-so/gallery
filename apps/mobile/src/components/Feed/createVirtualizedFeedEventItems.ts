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
import { removeNullValues } from '~/shared/relay/removeNullValues';

export type FeedItemTypes = 'Post' | 'FeedEvent';
type itemType = FeedItemTypes | null;

const SUGGESTED_PROFILE_ROW_IDX = 8;

export type FeedListItemType = { key: string } & (
  | {
      kind: 'feed-item-navigation';
      activeFeed: ActiveFeed;
      onFilterChange: (feed: ActiveFeed) => void;
      event: null;
      post: null;
      queryRef?: null;
      eventId: string;
      itemType: itemType;
    }
  | {
      kind: 'feed-item-header';
      event: createVirtualizedFeedEventItemsFragment$data;
      post: null;
      queryRef: createVirtualizedFeedEventItemsQueryFragment$data;
      eventId: string;
      itemType: itemType;
    }
  | {
      kind: 'feed-item-caption';
      event: createVirtualizedFeedEventItemsFragment$data;
      post: null;
      queryRef?: null;
      eventId: string;
      itemType: itemType;
    }
  | {
      kind: 'feed-item-event';
      event: createVirtualizedFeedEventItemsFragment$data;
      post: null;
      queryRef: createVirtualizedFeedEventItemsQueryFragment$data;
      eventId: string;
      itemType: itemType;
    }
  | {
      kind: 'feed-item-socialize';
      event: createVirtualizedFeedEventItemsFragment$data;
      post: null;
      queryRef: createVirtualizedFeedEventItemsQueryFragment$data;
      onCommentPress: () => void;
      eventId: string;
      itemType: itemType;
    }
  | {
      kind: 'post-item-header';
      event: null;
      post: createVirtualizedFeedEventItemsPostFragment$data;
      queryRef: createVirtualizedFeedEventItemsQueryFragment$data;
      postId: string;
      itemType: itemType;
    }
  | {
      kind: 'post-item-caption';
      event: null;
      post: createVirtualizedFeedEventItemsPostFragment$data;
      queryRef?: null;
      postId: string;
      itemType: itemType;
    }
  | {
      kind: 'post-item-event';
      event: null;
      post: createVirtualizedFeedEventItemsPostFragment$data;
      queryRef: createVirtualizedFeedEventItemsQueryFragment$data;
      postId: string;
      itemType: itemType;
    }
  | {
      kind: 'post-item-socialize';
      event: null;
      post: createVirtualizedFeedEventItemsPostFragment$data;
      queryRef: createVirtualizedFeedEventItemsQueryFragment$data;
      onCommentPress: () => void;
      postId: string;
      itemType: itemType;
    }
  | {
      kind: 'post-item-mint-link';
      event: null;
      post: createVirtualizedFeedEventItemsPostFragment$data;
      queryRef: createVirtualizedFeedEventItemsQueryFragment$data;
      postId: string;
      itemType: itemType;
    }
  | {
      kind: 'suggested-profile-row';
      event: null;
      post: null;
      eventId: string;
      queryRef: createVirtualizedFeedEventItemsQueryFragment$data;
      itemType: itemType;
    }
);

export type createVirtualizedItemsFromFeedEventsArgs = {
  failedEvents: Set<string>;
  queryRef: createVirtualizedFeedEventItemsQueryFragment$key;
  listRef: MutableRefObject<FlashList<FeedListItemType> | null>;
  itemRefs: readonly (
    | createVirtualizedFeedEventItemsFragment$key
    | createVirtualizedFeedEventItemsPostFragment$key
  )[];

  feedFilter?: {
    activeFeed: ActiveFeed;
    onFeedChange: (feed: ActiveFeed) => void;
  };
};

type createVirtualizedItemsFromFeedEventsReturnType = {
  items: FeedListItemType[];
};

export function createVirtualizedFeedEventItems({
  failedEvents,
  queryRef,
  listRef,
  feedFilter,

  itemRefs,
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
        # eslint-disable-next-line relay/must-colocate-fragment-spreads
        ...FeedPostSocializeSectionQueryFragment
        # eslint-disable-next-line relay/must-colocate-fragment-spreads
        ...PostListItemQueryFragment
        # eslint-disable-next-line relay/must-colocate-fragment-spreads
        ...FeedSuggestedProfileRowFragment
      }
    `,
    queryRef
  );

  const newItems = removeNullValues(
    itemRefs.map((itemRef) => {
      if (!itemRef) return;
      if ('__typename' in itemRef) {
        if (itemRef.__typename === 'FeedEvent') {
          return readInlineData(
            graphql`
              fragment createVirtualizedFeedEventItemsFragment on FeedEvent @inline {
                __typename
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
            itemRef
          );
        }

        if (itemRef.__typename === 'Post') {
          return readInlineData(
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
                # eslint-disable-next-line relay/must-colocate-fragment-spreads
                ...FeedPostSocializeSectionFragment
                # eslint-disable-next-line relay/must-colocate-fragment-spreads
                ...PostListMintButtonSectionFragment
              }
            `,
            itemRef
          );
        }
      }
      return null;
    })
  );

  const items: FeedListItemType[] = [];

  if (feedFilter) {
    items.push({
      kind: 'feed-item-navigation',
      event: null,
      post: null,
      key: 'feed-item-navigation',
      eventId: 'feed-item-navigation',
      onFilterChange: feedFilter.onFeedChange,
      activeFeed: feedFilter.activeFeed,
      itemType: null,
    });
  }

  const setVirtualizeItemsForPost = (post: createVirtualizedFeedEventItemsPostFragment$data) => {
    const uniqueKey = Math.random().toString();

    if (!post.tokens) return;
    items.push({
      kind: 'post-item-header',
      post,
      event: null,
      queryRef: query,
      key: `post-item-header-${post.dbid}-${uniqueKey}`,
      postId: post.dbid,
      itemType: 'Post',
    });

    if (post.caption) {
      items.push({
        kind: 'post-item-caption',
        post,
        event: null,
        key: `post-item-caption-${post.dbid}-${uniqueKey}`,
        postId: post.dbid,
        itemType: 'Post',
      });
    }

    items.push({
      kind: 'post-item-event',
      post,
      event: null,
      queryRef: query,
      key: `post-item-event-${post.dbid}-${uniqueKey}`,
      postId: post.dbid,
      itemType: 'Post',
    });

    items.push({
      kind: 'post-item-socialize',
      post,
      event: null,
      queryRef: query,
      key: `post-item-socialize-${post.dbid}-${uniqueKey}`,
      postId: post.dbid,
      onCommentPress: function () {
        listRef.current?.scrollToItem({ item: this, animated: true, viewOffset: 0.5 });
      },
      itemType: 'Post',
    });

    items.push({
      kind: 'post-item-mint-link',
      post,
      event: null,
      queryRef: query,
      key: `post-item-mint-link-${post.dbid}-${uniqueKey}`,
      postId: post.dbid,
      itemType: 'Post',
    });
  };

  const setVirtualizeItemsForEvent = (event: createVirtualizedFeedEventItemsFragment$data) => {
    const uniqueKey = Math.random().toString();

    if (!event.eventData) return;

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
        post: null,
        event,
        queryRef: query,
        key: `feed-item-header-${event.dbid}-${uniqueKey}`,
        eventId: event.dbid,
        itemType: 'FeedEvent',
      });

      if (event.caption) {
        items.push({
          kind: 'feed-item-caption',
          post: null,
          event,
          key: `feed-item-caption-${event.dbid}-${uniqueKey}`,
          eventId: event.dbid,
          itemType: 'FeedEvent',
        });
      }

      items.push({
        kind: 'feed-item-event',
        post: null,
        event,
        key: `feed-item-event-${event.dbid}-${uniqueKey}`,
        queryRef: query,
        eventId: event.dbid,
        itemType: 'FeedEvent',
      });

      items.push({
        kind: 'feed-item-socialize',
        post: null,
        event,
        key: `feed-item-socialize-${event.dbid}-${uniqueKey}`,
        eventId: event.dbid,
        queryRef: query,
        onCommentPress: function () {
          listRef.current?.scrollToItem({ item: this, animated: true, viewOffset: 0.5 });
        },
        itemType: 'FeedEvent',
      });
    }
  };

  for (const item of newItems) {
    if (item.__typename === 'FeedEvent') {
      setVirtualizeItemsForEvent(item);
    }
    if (item.__typename === 'Post') {
      setVirtualizeItemsForPost(item);
    }
  }

  /**
   * insert suggested profiles in between posts.
   *
   * we need to do it this way as opposed to a simple splice based on
   * array length given there are different elements of a post component
   * that count towards array item length
   */
  let postCount = 0;
  const itemsWithSuggestedProfileRow = [];
  for (const item of items) {
    if (item.kind === 'post-item-header') {
      postCount++;
      if (postCount === SUGGESTED_PROFILE_ROW_IDX) {
        itemsWithSuggestedProfileRow.push({
          kind: 'suggested-profile-row',
          event: null,
          post: null,
          queryRef: query,
          key: 'suggested-profile-row',
          eventId: 'suggested-profile-row',
          itemType: null,
        } as FeedListItemType);
      }
    }
    itemsWithSuggestedProfileRow.push(item);
  }

  return { items: itemsWithSuggestedProfileRow };
}
