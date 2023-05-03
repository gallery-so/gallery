import { FlashList, ListRenderItem } from '@shopify/flash-list';
import { useCallback } from 'react';
import { useFragment } from 'react-relay';
import { graphql } from 'relay-runtime';

import { UserFollowCard } from '~/components/UserFollowList/UserFollowCard';
import { UserFollowListFragment$key } from '~/generated/UserFollowListFragment.graphql';
import { UserFollowListQueryFragment$key } from '~/generated/UserFollowListQueryFragment.graphql';

type UserFollowListProps = {
  userRefs: UserFollowListFragment$key;
  queryRef: UserFollowListQueryFragment$key;
  onLoadMore?: () => void;
  onUserPress: (username: string) => void;
};

export function UserFollowList({
  userRefs,
  queryRef,
  onLoadMore,
  onUserPress,
}: UserFollowListProps) {
  const query = useFragment(
    graphql`
      fragment UserFollowListQueryFragment on Query {
        ...UserFollowCardQueryFragment
      }
    `,
    queryRef
  );

  const users = useFragment(
    graphql`
      fragment UserFollowListFragment on GalleryUser @relay(plural: true) {
        ...UserFollowCardFragment
      }
    `,
    userRefs
  );

  const renderItem = useCallback<ListRenderItem<(typeof users)[number]>>(
    ({ item }) => {
      return <UserFollowCard onPress={onUserPress} userRef={item} queryRef={query} />;
    },
    [onUserPress, query]
  );

  return (
    <FlashList
      onEndReached={onLoadMore}
      onEndReachedThreshold={0.8}
      renderItem={renderItem}
      data={users}
      estimatedItemSize={60}
    />
  );
}
