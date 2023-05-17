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

type ProfileViewActivityTabProps = {
  queryRef: ProfileViewActivityTabFragment$key;
};

export function ProfileViewActivityTab({ queryRef }: ProfileViewActivityTabProps) {
  const { data: query } = usePaginationFragment(
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

  const { items, stickyIndices } = createVirtualizedFeedEventItems({
    failedEvents,
    eventRefs: events,
    queryRef: query,
  });

  const ref = useRef<FlashList<FeedListItemType> | null>(null);
  const scrollToFeedEvent = useCallback((item: FeedListItemType) => {
    if (ref.current) {
      ref.current.scrollToItem({ item, animated: true, viewPosition: 0.5 });
    }
  }, []);

  const renderItem = useCallback<ListRenderItem<FeedListItemType>>(
    ({ item }) => {
      const markFailure = () => {
        markEventAsFailure(item.event.dbid);
      };

      return (
        <FeedVirtualizedRow
          eventId={item.eventId}
          item={item}
          onFailure={markFailure}
          onCommentPress={scrollToFeedEvent}
        />
      );
    },
    [markEventAsFailure, scrollToFeedEvent]
  );

  const contentContainerStyle = useListContentStyle();

  return (
    <View style={contentContainerStyle}>
      <Tabs.FlashList
        ref={ref}
        data={items}
        renderItem={renderItem}
        estimatedItemSize={400}
        stickyHeaderIndices={stickyIndices}
      />
    </View>
  );
}
