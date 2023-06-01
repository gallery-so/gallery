import { useNavigation } from '@react-navigation/native';
import { FlashList, ListRenderItem } from '@shopify/flash-list';
import { useCallback, useMemo } from 'react';
import { View } from 'react-native';
import { graphql, usePaginationFragment } from 'react-relay';

import { CommunityCollectorsListFragment$key } from '~/generated/CommunityCollectorsListFragment.graphql';
import { MainTabStackNavigatorProp } from '~/navigation/types';

import { GalleryTouchableOpacity } from '../GalleryTouchableOpacity';
import { Typography } from '../Typography';

type Props = {
  communityRef: CommunityCollectorsListFragment$key;
};

type HolderType = {
  id: string;
  username: string;
};

export function CommunityCollectorsList({ communityRef }: Props) {
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
                id
                username
              }
            }
          }
        }
      }
    `,
    communityRef
  );

  const nonNullTokenHolders = useMemo(() => {
    const holders: HolderType[] = [];

    for (const owner of community?.owners?.edges ?? []) {
      if (owner?.node) {
        if (!owner.node.user) return;
        holders.push({
          id: owner.node.user.id,
          username: owner.node.user.username || '',
        });
      }
    }

    const holderPairs = [];

    for (let i = 0; i < holders.length; i += 2) {
      holderPairs.push(holders.slice(i, i + 2));
    }

    return holderPairs;
  }, [community?.owners?.edges]);

  const navigation = useNavigation<MainTabStackNavigatorProp>();
  const handleOpenProfile = useCallback(
    (username: string) => {
      navigation.push('Profile', {
        username,
        hideBackButton: false,
      });
    },
    [navigation]
  );

  const loadMore = useCallback(() => {
    if (hasNext) {
      loadNext(100);
    }
  }, [hasNext, loadNext]);

  const renderItem = useCallback<ListRenderItem<HolderType[]>>(
    ({ item: holderPair, index }) => {
      return (
        <View key={index} className="flex-row justify-between px-4">
          {holderPair.map((holder, subIndex) => (
            <View key={`${index}-${subIndex}`} className="w-1/2">
              <GalleryTouchableOpacity
                onPress={() => handleOpenProfile(holder.username)}
                eventElementId="community-collectors-list-user"
                eventName={'community-collectors-list-user-pressed'}
                properties={{ username: holder.username }}
              >
                <Typography font={{ family: 'ABCDiatype', weight: 'Regular' }}>
                  {holder.username}
                </Typography>
              </GalleryTouchableOpacity>
            </View>
          ))}
        </View>
      );
    },
    [handleOpenProfile]
  );

  return (
    <FlashList
      data={nonNullTokenHolders}
      estimatedItemSize={40}
      renderItem={renderItem}
      onEndReached={loadMore}
      refreshing={isLoadingNext}
      onEndReachedThreshold={0.8}
    />
  );
}
