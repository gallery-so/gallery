import { FlashList, ListRenderItem } from '@shopify/flash-list';
import { useCallback } from 'react';
import { graphql, useFragment } from 'react-relay';

import { SuggestedUserListFragment$key } from '~/generated/SuggestedUserListFragment.graphql';
import { SuggestedUserListQueryFragment$key } from '~/generated/SuggestedUserListQueryFragment.graphql';

import { SuggestedUserFollowCard } from './SuggestedUserFollowCard';

type SuggestedUserListProps = {
  userRefs: SuggestedUserListFragment$key;
  queryRef: SuggestedUserListQueryFragment$key;
  onLoadMore?: () => void;
};

export function SuggestedUserFollowList({
  userRefs,
  queryRef,
  onLoadMore,
}: SuggestedUserListProps) {
  const query = useFragment(
    graphql`
      fragment SuggestedUserFollowListQueryFragment on Query {
        ...SuggestedUserFollowCardQueryFragment
      }
    `,
    queryRef
  );

  const users = useFragment(
    graphql`
      fragment SuggestedUserFollowListFragment on GalleryUser @relay(plural: true) {
        ...SuggestedUserFollowCardFragment
      }
    `,
    userRefs
  );

  const renderItem = useCallback<ListRenderItem<(typeof users)[number]>>(
    ({ item }) => {
      return <SuggestedUserFollowCard userRef={item} queryRef={query} />;
    },
    [query]
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
