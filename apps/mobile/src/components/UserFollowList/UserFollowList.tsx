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
};

export function UserFollowList({ userRefs, queryRef }: UserFollowListProps) {
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
      return <UserFollowCard userRef={item} queryRef={query} />;
    },
    [query]
  );

  return <FlashList renderItem={renderItem} data={users} estimatedItemSize={60} />;
}
