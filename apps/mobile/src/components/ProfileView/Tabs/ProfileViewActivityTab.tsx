import { ListRenderItem } from '@shopify/flash-list';
import { useCallback } from 'react';
import { Tabs } from 'react-native-collapsible-tab-view';
import { usePaginationFragment } from 'react-relay';
import { graphql } from 'relay-runtime';

import {
  createVirtualizedItemsFromFeedEvents,
  FeedListItemType,
} from '~/components/Feed/createVirtualizedItemsFromFeedEvents';
import { FeedVirtualizedRow } from '~/components/Feed/FeedVirtualizedRow';
import { useFailedEventTracker } from '~/components/Feed/useFailedEventTracker';
import { useListContentStyle } from '~/components/ProfileView/Tabs/useListContentStyle';
import { ProfileViewActivityTabFragment$key } from '~/generated/ProfileViewActivityTabFragment.graphql';

type ProfileViewActivityTabProps = {
  userRef: ProfileViewActivityTabFragment$key;
};

export function ProfileViewActivityTab({ userRef }: ProfileViewActivityTabProps) {
  const { data: user } = usePaginationFragment(
    graphql`
      fragment ProfileViewActivityTabFragment on GalleryUser
      @refetchable(queryName: "ProfileViewActivityTabFragmentPaginationQuery") {
        __typename
        feed(before: $feedBefore, last: $feedLast)
          @connection(key: "ProfileViewActivityTabFragment_feed") {
          edges {
            node {
              ...createVirtualizedItemsFromFeedEvents
            }
          }
        }
      }
    `,
    userRef
  );

  const { markEventAsFailure, failedEvents } = useFailedEventTracker();

  const events = [];
  for (const edge of user.feed?.edges ?? []) {
    if (edge?.node) {
      events.push(edge.node);
    }
  }

  const { items, stickyIndices } = createVirtualizedItemsFromFeedEvents({
    failedEvents,
    eventRefs: events,
  });

  const renderItem = useCallback<ListRenderItem<FeedListItemType>>(
    ({ item }) => {
      const markFailure = () => {
        markEventAsFailure(item.event.dbid);
      };

      return <FeedVirtualizedRow item={item} onFailure={markFailure} />;
    },
    [markEventAsFailure]
  );

  const contentContainerStyle = useListContentStyle();

  return (
    <Tabs.FlashList
      data={items}
      renderItem={renderItem}
      estimatedItemSize={400}
      stickyHeaderIndices={stickyIndices}
      contentContainerStyle={contentContainerStyle}
    />
  );
}
