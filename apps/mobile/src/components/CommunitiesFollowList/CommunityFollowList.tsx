import { FlashList, ListRenderItem } from '@shopify/flash-list';
import { useCallback } from 'react';
import { useFragment } from 'react-relay';
import { graphql } from 'relay-runtime';

import { CommunityFollowListFragment$key } from '~/generated/CommunityFollowListFragment.graphql';

import { CommunityFollowCard } from './CommunityFollowCard';

type ContractAddress = {
  address: string | null;
  chain: string | null;
};

type CommunityFollowListProps = {
  communityRefs: CommunityFollowListFragment$key;
  onLoadMore?: () => void;
  onCommunityPress: (contractAddress: ContractAddress) => void;
};

export function CommunityFollowList({
  communityRefs,
  onLoadMore,
  onCommunityPress,
}: CommunityFollowListProps) {
  const communities = useFragment(
    graphql`
      fragment CommunityFollowListFragment on Community @relay(plural: true) {
        ...CommunityFollowCardFragment
      }
    `,
    communityRefs
  );

  const renderItem = useCallback<ListRenderItem<(typeof communities)[number]>>(
    ({ item }) => {
      return <CommunityFollowCard onPress={onCommunityPress} communityRef={item} />;
    },
    [onCommunityPress]
  );

  return (
    <FlashList
      onEndReached={onLoadMore}
      onEndReachedThreshold={0.8}
      renderItem={renderItem}
      data={communities}
      estimatedItemSize={60}
    />
  );
}
