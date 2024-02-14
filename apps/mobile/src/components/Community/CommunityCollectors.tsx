import { ListRenderItem } from '@shopify/flash-list';
import { useCallback, useMemo, useState } from 'react';
import { View } from 'react-native';
import { Tabs } from 'react-native-collapsible-tab-view';
import { graphql, useFragment, usePaginationFragment } from 'react-relay';
import { removeNullValues } from 'shared/relay/removeNullValues';

import { CommunityCollectorsFragment$key } from '~/generated/CommunityCollectorsFragment.graphql';
import { CommunityCollectorsGridRowFragment$key } from '~/generated/CommunityCollectorsGridRowFragment.graphql';
import { CommunityCollectorsListItemFragment$key } from '~/generated/CommunityCollectorsListItemFragment.graphql';
import { CommunityCollectorsQueryFragment$key } from '~/generated/CommunityCollectorsQueryFragment.graphql';

import { useListContentStyle } from '../ProfileView/Tabs/useListContentStyle';
import { CommunityCollectorsGridRow } from './CommunityCollectors/CommunityCollectorsGridRow';
import { CommunityCollectorsHeader } from './CommunityCollectors/CommunityCollectorsHeader';
import { CommunityCollectorsListItem } from './CommunityCollectors/CommunityCollectorsListItem';

type Props = {
  communityRef: CommunityCollectorsFragment$key;
  queryRef: CommunityCollectorsQueryFragment$key;
};

export type CollectorTokenLayout = 'grid' | 'list';

type CollectorItemList =
  | {
      kind: 'collector-section-header';
    }
  | {
      kind: 'collector-list-item';
      userRef: CommunityCollectorsListItemFragment$key;
    }
  | {
      kind: 'collector-grid-item';
      tokenRefs: CommunityCollectorsGridRowFragment$key;
    };

export function CommunityCollectors({ communityRef, queryRef }: Props) {
  const query = useFragment(
    graphql`
      fragment CommunityCollectorsQueryFragment on Query {
        ...CommunityCollectorsGridRowQueryFragment
        ...CommunityCollectorsListItemQueryFragment
      }
    `,
    queryRef
  );

  const {
    data: community,
    loadNext,
    hasNext,
    isLoadingNext,
  } = usePaginationFragment(
    graphql`
      fragment CommunityCollectorsFragment on Community
      @refetchable(queryName: "CommunityCollectorsRefetchableFragment") {
        tokens(first: $listOwnersFirst, after: $listOwnersAfter)
          @connection(key: "CommunityCollectorsList_tokens") {
          edges {
            node {
              __typename
              ...CommunityCollectorsGridRowFragment
            }
          }
        }
        holders(first: $listOwnersFirst, after: $listOwnersAfter) {
          edges {
            node {
              __typename
              user {
                ...CommunityCollectorsListItemFragment
              }
            }
          }
        }
      }
    `,
    communityRef
  );

  const [tokenLayout, setTokenLayout] = useState<CollectorTokenLayout>('grid');

  const nonNullTokens = useMemo(() => {
    return removeNullValues(community?.tokens?.edges?.map((edge) => edge?.node));
  }, [community?.tokens?.edges]);

  const nonNullHolders = useMemo(() => {
    return removeNullValues(community?.holders?.edges?.map((edge) => edge?.node));
  }, [community?.holders?.edges]);

  const listItems = useMemo(() => {
    const items: CollectorItemList[] = [];

    items.push({
      kind: 'collector-section-header',
    });

    nonNullHolders.forEach((holder) => {
      if (!holder.user) return;
      items.push({
        kind: 'collector-list-item',
        userRef: holder.user,
      });
    });

    return items;
  }, [nonNullHolders]);

  const gridItems = useMemo(() => {
    const items: CollectorItemList[] = [];

    items.push({
      kind: 'collector-section-header',
    });

    for (let i = 0; i < nonNullTokens.length; i += 2) {
      const tokenRefs: CommunityCollectorsGridRowFragment$key = removeNullValues([
        nonNullTokens[i],
        nonNullTokens[i + 1],
      ]);

      if (tokenRefs.every((ref) => ref !== undefined)) {
        items.push({
          kind: 'collector-grid-item',
          tokenRefs,
        });
      }
    }

    return items;
  }, [nonNullTokens]);

  const items = useMemo(() => {
    if (tokenLayout === 'grid') {
      return gridItems;
    } else {
      return listItems;
    }
  }, [tokenLayout, gridItems, listItems]);

  const renderItem = useCallback<ListRenderItem<CollectorItemList>>(
    ({ item }) => {
      switch (item.kind) {
        case 'collector-section-header':
          return <CommunityCollectorsHeader layout={tokenLayout} onLayoutChange={setTokenLayout} />;
        case 'collector-grid-item':
          return <CommunityCollectorsGridRow queryRef={query} tokenRefs={item.tokenRefs} />;
        case 'collector-list-item':
          return <CommunityCollectorsListItem queryRef={query} userRef={item.userRef} />;
      }
    },
    [query, setTokenLayout, tokenLayout]
  );

  const loadMore = useCallback(() => {
    if (hasNext) {
      loadNext(100);
    }
  }, [hasNext, loadNext]);

  const contentContainerStyle = useListContentStyle();

  return (
    <View
      style={{
        ...contentContainerStyle,
        paddingTop: 0,
      }}
    >
      <Tabs.FlashList
        data={items}
        estimatedItemSize={240}
        renderItem={renderItem}
        onEndReached={loadMore}
        refreshing={isLoadingNext}
        onEndReachedThreshold={0.8}
        extraData={tokenLayout}
      />
    </View>
  );
}
