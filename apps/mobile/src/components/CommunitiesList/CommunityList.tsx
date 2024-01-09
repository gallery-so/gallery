import { FlashList, ListRenderItem } from '@shopify/flash-list';
import { useCallback } from 'react';
import { useFragment } from 'react-relay';
import { graphql } from 'relay-runtime';

import { CommunityListFragment$key } from '~/generated/CommunityListFragment.graphql';

import { CommunityCard } from './CommunityCard';

type CommunityListProps = {
  communityRefs: CommunityListFragment$key;
  onLoadMore?: () => void;
};

export function CommunityList({ communityRefs, onLoadMore }: CommunityListProps) {
  const communities = useFragment(
    graphql`
      fragment CommunityListFragment on Community @relay(plural: true) {
        ...CommunityCardFragment
      }
    `,
    communityRefs
  );

  const renderItem = useCallback<ListRenderItem<(typeof communities)[number]>>(({ item }) => {
    return <CommunityCard communityRef={item} />;
  }, []);

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
