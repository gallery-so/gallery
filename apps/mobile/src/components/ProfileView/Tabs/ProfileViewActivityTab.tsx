import { FlashList, ListRenderItem } from '@shopify/flash-list';
import { useCallback, useRef } from 'react';
import { Tabs } from 'react-native-collapsible-tab-view';
import { useFragment, usePaginationFragment } from 'react-relay';
import { graphql } from 'relay-runtime';

import {
  createVirtualizedFeedEventItems,
  FeedListItemType,
} from '~/components/Feed/createVirtualizedFeedEventItems';
import { FeedVirtualizedRow } from '~/components/Feed/FeedVirtualizedRow';
import { useFailedEventTracker } from '~/components/Feed/useFailedEventTracker';
import { useListContentStyle } from '~/components/ProfileView/Tabs/useListContentStyle';
import { ProfileViewActivityTabFragment$key } from '~/generated/ProfileViewActivityTabFragment.graphql';
import { ProfileViewActivityTabQueryFragment$key } from '~/generated/ProfileViewActivityTabQueryFragment.graphql';

type ProfileViewActivityTabProps = {
  userRef: ProfileViewActivityTabFragment$key;
  queryRef: ProfileViewActivityTabQueryFragment$key;
};

export function ProfileViewActivityTab({ userRef, queryRef }: ProfileViewActivityTabProps) {
  const { data: user } = usePaginationFragment(
    graphql`
      fragment ProfileViewActivityTabFragment on GalleryUser
      @refetchable(queryName: "ProfileViewActivityTabFragmentPaginationQuery") {
        __typename
        feed(before: $feedBefore, last: $feedLast)
          @connection(key: "ProfileViewActivityTabFragment_feed") {
          edges {
            node {
              ...createVirtualizedFeedEventItemsFragment
            }
          }
        }
      }
    `,
    userRef
  );

  const query = useFragment(
    graphql`
      fragment ProfileViewActivityTabQueryFragment on Query {
        ...createVirtualizedFeedEventItemsQueryFragment
      }
    `,
    queryRef
  );

  const { markEventAsFailure, failedEvents } = useFailedEventTracker();

  const events = [];
  for (const edge of user.feed?.edges ?? []) {
    if (edge?.node) {
      events.push(edge.node);
    }
  }

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
    <Tabs.FlashList
      ref={ref}
      data={items}
      renderItem={renderItem}
      estimatedItemSize={400}
      stickyHeaderIndices={stickyIndices}
      contentContainerStyle={contentContainerStyle}
    />
  );
}
