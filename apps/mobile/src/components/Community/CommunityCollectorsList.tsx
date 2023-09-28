import { useNavigation } from '@react-navigation/native';
import { ListRenderItem } from '@shopify/flash-list';
import { useCallback, useMemo } from 'react';
import { Tabs } from 'react-native-collapsible-tab-view';
import { graphql, useFragment, usePaginationFragment } from 'react-relay';

import { UserFollowCard } from '~/components/UserFollowList/UserFollowCard';
import { CommunityCollectorsListFragment$key } from '~/generated/CommunityCollectorsListFragment.graphql';
import { CommunityCollectorsListQueryFragment$key } from '~/generated/CommunityCollectorsListQueryFragment.graphql';
import { MainTabStackNavigatorProp } from '~/navigation/types';
import { removeNullValues } from '~/shared/relay/removeNullValues';

type Props = {
  queryRef: CommunityCollectorsListQueryFragment$key;
  communityRef: CommunityCollectorsListFragment$key;
};

export function CommunityCollectorsList({ communityRef, queryRef }: Props) {
  const query = useFragment(
    graphql`
      fragment CommunityCollectorsListQueryFragment on Query {
        ...UserFollowCardQueryFragment
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
      fragment CommunityCollectorsListFragment on Community
      @refetchable(queryName: "CommunityCollectorsListRefetchableFragment") {
        owners(
          first: $listOwnersFirst
          after: $listOwnersAfter
          onlyGalleryUsers: $onlyGalleryUsers
        ) @connection(key: "CommunityPageView_owners") {
          edges {
            node {
              __typename

              user {
                username
                ...UserFollowCardFragment
              }
            }
          }
        }
      }
    `,
    communityRef
  );

  const holders = useMemo(() => {
    return removeNullValues(community?.owners?.edges?.map((edge) => edge?.node?.user));
  }, [community?.owners?.edges]);

  const navigation = useNavigation<MainTabStackNavigatorProp>();
  const loadMore = useCallback(() => {
    if (hasNext) {
      loadNext(100);
    }
  }, [hasNext, loadNext]);

  type ListItemType = (typeof holders)[number];
  const renderItem = useCallback<ListRenderItem<ListItemType>>(
    ({ item: user }) => {
      return (
        <UserFollowCard
          userRef={user}
          queryRef={query}
          onPress={() => {
            if (user.username) {
              navigation.push('Profile', {
                username: user.username,
                hideBackButton: false,
              });
            }
          }}
        />
      );
    },
    [navigation, query]
  );

  return (
    <Tabs.FlashList
      data={holders}
      estimatedItemSize={40}
      renderItem={renderItem}
      onEndReached={loadMore}
      refreshing={isLoadingNext}
      onEndReachedThreshold={0.8}
    />
  );
}
