import { useNavigation } from '@react-navigation/native';
import { FlashList, ListRenderItem } from '@shopify/flash-list';
import { ForwardedRef, forwardRef, useCallback, useMemo } from 'react';
import { View } from 'react-native';
import { graphql, usePaginationFragment } from 'react-relay';

import {
  GalleryBottomSheetModal,
  GalleryBottomSheetModalType,
} from '~/components/GalleryBottomSheet/GalleryBottomSheetModal';
import { InteractiveLink } from '~/components/InteractiveLink';
import { Typography } from '~/components/Typography';
import { ProfileViewSharedCommunitiesSheetFragment$key } from '~/generated/ProfileViewSharedCommunitiesSheetFragment.graphql';
import { MainTabStackNavigatorProp } from '~/navigation/types';

import { useListContentStyle } from '../Tabs/useListContentStyle';
import { SHARED_COMMUNITIES_PER_PAGE } from './ProfileViewSharedCommunities';

type Props = {
  userRef: ProfileViewSharedCommunitiesSheetFragment$key;
};

const snapPoints = ['50%'];

export type ContractAddress = {
  address: string | null;
  chain: string | null;
};
type ListItemType = { kind: 'community'; name?: string; contractAddress: ContractAddress | null };

function ProfileViewSharedCommunitiesSheet(
  props: Props,
  ref: ForwardedRef<GalleryBottomSheetModalType>
) {
  const { data, loadNext, hasNext } = usePaginationFragment(
    graphql`
      fragment ProfileViewSharedCommunitiesSheetFragment on GalleryUser
      @refetchable(queryName: "ProfileViewSharedCommunitiesSheetRefetchableFragment") {
        sharedCommunities(first: $sharedCommunitiesFirst, after: $sharedCommunitiesAfter)
          @connection(key: "UserSharedInfoFragment_sharedCommunities") {
          edges {
            node {
              __typename
              ... on Community {
                __typename
                name
                contractAddress {
                  address
                  chain
                }
              }
            }
          }
        }
      }
    `,
    props.userRef
  );

  const nonNullCommunities = useMemo(() => {
    const items: ListItemType[] = [];

    for (const edge of data.sharedCommunities?.edges ?? []) {
      if (edge?.node?.__typename === 'Community' && edge?.node) {
        items.push({
          kind: 'community',
          name: edge.node.name ?? '',
          contractAddress: edge.node.contractAddress,
        });
      }
    }

    return items;
  }, [data.sharedCommunities?.edges]);

  const contentContainerStyle = useListContentStyle();
  const navigation = useNavigation<MainTabStackNavigatorProp>();
  const handleCommunityPress = useCallback(
    (contractAddress: ContractAddress) => {
      const { address, chain } = contractAddress ?? {};

      if (!address || !chain) return;
      navigation.push('Community', {
        contractAddress: address,
        chain,
      });
    },
    [navigation]
  );

  const loadMore = useCallback(() => {
    if (hasNext) {
      loadNext(SHARED_COMMUNITIES_PER_PAGE);
    }
  }, [hasNext, loadNext]);

  const renderItem = useCallback<ListRenderItem<ListItemType>>(
    ({ item }) => {
      return (
        <View className="mb-4 px-4" key={item.name}>
          <InteractiveLink
            onPress={() => item.contractAddress && handleCommunityPress(item.contractAddress)}
          >
            <Typography
              className="text-sm mb-4 px-4"
              font={{
                family: 'ABCDiatype',
                weight: 'Bold',
              }}
            >
              {item.name}
            </Typography>
          </InteractiveLink>
        </View>
      );
    },
    [handleCommunityPress]
  );

  return (
    <GalleryBottomSheetModal ref={ref} index={0} snapPoints={snapPoints}>
      <View style={contentContainerStyle}>
        <Typography
          className="text-sm mb-4 px-4"
          font={{
            family: 'ABCDiatype',
            weight: 'Bold',
          }}
        >
          Items you both own
        </Typography>

        <View className="flex-grow">
          <FlashList
            data={nonNullCommunities}
            renderItem={renderItem}
            onEndReached={loadMore}
            estimatedItemSize={20}
            contentContainerStyle={{ paddingBottom: 24 }}
          ></FlashList>
        </View>
      </View>
    </GalleryBottomSheetModal>
  );
}

const ForwardedProfileViewSharedCommunitiesSheet = forwardRef<GalleryBottomSheetModalType, Props>(
  ProfileViewSharedCommunitiesSheet
);

export { ForwardedProfileViewSharedCommunitiesSheet as ProfileViewSharedCommunitiesSheet };
