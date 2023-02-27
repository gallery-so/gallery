import { useCallback } from 'react';
import { FlatList, ListRenderItem, Text, View } from 'react-native';
import { graphql, useFragment } from 'react-relay';

import { FeedListFragment$key } from '~/generated/FeedListFragment.graphql';

import { FeedListItem } from './FeedListItem';

type FeedListProps = {
  feedEventRefs: FeedListFragment$key;
};

export function FeedList({ feedEventRefs }: FeedListProps) {
  const events = useFragment(
    graphql`
      fragment FeedListFragment on FeedEvent @relay(plural: true) {
        __typename

        ...FeedListItemFragment
      }
    `,
    feedEventRefs
  );

  const renderItem = useCallback<ListRenderItem<(typeof events)[number]>>(({ item }) => {
    return <FeedListItem feedEventRef={item} />;
  }, []);

  return (
    <FlatList
      ItemSeparatorComponent={() => <View className="h-3" />}
      data={events}
      renderItem={renderItem}
    />
  );
}
