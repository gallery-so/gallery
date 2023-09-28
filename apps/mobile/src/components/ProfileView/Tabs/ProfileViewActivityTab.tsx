import { FlashList, ListRenderItem } from '@shopify/flash-list';
import { useCallback, useRef } from 'react';
import { View } from 'react-native';
import { Tabs } from 'react-native-collapsible-tab-view';
import { usePaginationFragment } from 'react-relay';
import { graphql } from 'relay-runtime';

import {
  createVirtualizedFeedEventItems,
  FeedListItemType,
} from '~/components/Feed/createVirtualizedFeedEventItems';
import { FeedVirtualizedRow } from '~/components/Feed/FeedVirtualizedRow';
import { useFailedEventTracker } from '~/components/Feed/useFailedEventTracker';
import { useListContentStyle } from '~/components/ProfileView/Tabs/useListContentStyle';
import { ProfileViewActivityTabFragment$key } from '~/generated/ProfileViewActivityTabFragment.graphql';
import { ACTIVITY_FEED_ITEMS_PER_PAGE } from '~/screens/ProfileScreen/ProfileScreen';

type ProfileViewActivityTabProps = {
  queryRef: ProfileViewActivityTabFragment$key;
};

export function ProfileViewActivityTab({ queryRef }: ProfileViewActivityTabProps) {
  const {
    data: query,
    hasPrevious,
    loadPrevious,
  } = usePaginationFragment(
    graphql`
      fragment ProfileViewActivityTabFragment on Query
      @refetchable(queryName: "ProfileViewActivityTabFragmentPaginationQuery") {
        userByUsername(username: $username) {
          ... on GalleryUser {
            feed(before: $feedBefore, last: $feedLast)
              @connection(key: "ProfileViewActivityTabFragment_feed") {
              edges {
                node {
                  ...createVirtualizedFeedEventItemsFragment
                  ...createVirtualizedFeedEventItemsPostFragment
                }
              }
            }
          }
        }

        ...createVirtualizedFeedEventItemsQueryFragment
      }
    `,
    queryRef
  );

  const { markEventAsFailure, failedEvents } = useFailedEventTracker();

  const user = query.userByUsername;

  const events = [];
  for (const edge of user?.feed?.edges ?? []) {
    if (edge?.node) {
      events.push(edge.node);
    }
  }

  events.reverse();

  const ref = useRef<FlashList<FeedListItemType> | null>(null);
  const { items } = createVirtualizedFeedEventItems({
    itemRefs: events,
    listRef: ref,
    failedEvents,
    queryRef: query,
  });

  const renderItem = useCallback<ListRenderItem<FeedListItemType>>(
    ({ item }) => {
      // Set a default for feed navigation pill
      let itemId: string | null = null;

      if (item.post) {
        itemId = item.post.dbid;
      } else if (item.event) {
        itemId = item.event.dbid;
      } else {
        itemId = item.eventId;
      }

      const markFailure = () => (itemId ? markEventAsFailure(itemId) : () => {});

      return <FeedVirtualizedRow item={item} onFailure={markFailure} />;
    },
    [markEventAsFailure]
  );

  const contentContainerStyle = useListContentStyle();
  const loadMore = useCallback(() => {
    if (hasPrevious) {
      loadPrevious(ACTIVITY_FEED_ITEMS_PER_PAGE);
    }
  }, [hasPrevious, loadPrevious]);

  return (
    <View style={contentContainerStyle}>
      <Tabs.FlashList
        ref={ref}
        data={items}
        renderItem={renderItem}
        estimatedItemSize={400}
        onEndReached={loadMore}
      />
    </View>
  );
}
