/* eslint-disable @typescript-eslint/no-unused-vars */
import { useNavigation } from '@react-navigation/native';
import { useColorScheme } from 'nativewind';
import { useCallback, useMemo, useRef } from 'react';
import { View } from 'react-native';
import { graphql, useFragment, useRefetchableFragment } from 'react-relay';
import { ArbitrumIcon } from 'src/icons/ArbitrumIcon';
import { BaseIcon } from 'src/icons/BaseIcon';
import { EthIcon } from 'src/icons/EthIcon';
import { OptimismIcon } from 'src/icons/OptimismIcon';
import { PoapIcon } from 'src/icons/PoapIcon';
import { PolygonIcon } from 'src/icons/PolygonIcon';
import { TezosIcon } from 'src/icons/TezosIcon';
import { ZoraIcon } from 'src/icons/ZoraIcon';

import { useManageWalletActions } from '~/contexts/ManageWalletContext';
import { Chain, CommunityMetaFragment$key } from '~/generated/CommunityMetaFragment.graphql';
import { CommunityMetaQueryFragment$key } from '~/generated/CommunityMetaQueryFragment.graphql';
import { CommunityMetaRefetchQuery } from '~/generated/CommunityMetaRefetchQuery.graphql';
import { PostIcon } from '~/navigation/MainTabNavigator/PostIcon';
import { MainTabStackNavigatorProp } from '~/navigation/types';
import { contexts } from '~/shared/analytics/constants';
import colors from '~/shared/theme/colors';

import { Button } from '../Button';
import { GalleryBottomSheetModalType } from '../GalleryBottomSheet/GalleryBottomSheetModal';
import { CommunityPostBottomSheet } from './CommunityPostBottomSheet';

type Props = {
  communityRef: CommunityMetaFragment$key;
  queryRef: CommunityMetaQueryFragment$key;
};

export function CommunityMeta({ communityRef, queryRef }: Props) {
  const community = useFragment(
    graphql`
      fragment CommunityMetaFragment on Community {
        dbid
        chain
        contractAddress {
          chain
          address
        }
        creator {
          __typename
          ... on GalleryUser {
            username
          }
        }
        ...CommunityPostBottomSheetFragment
      }
    `,
    communityRef
  );

  const [query, refetch] = useRefetchableFragment<
    CommunityMetaRefetchQuery,
    CommunityMetaQueryFragment$key
  >(
    graphql`
      fragment CommunityMetaQueryFragment on Query
      @refetchable(queryName: "CommunityMetaRefetchQuery") {
        viewer {
          ... on Viewer {
            user {
              __typename
              isMemberOfCommunity(communityID: $communityID)
              primaryWallet {
                __typename
              }
            }
          }
        }
      }
    `,
    queryRef
  );

  const isMemberOfCommunity = query.viewer?.user?.isMemberOfCommunity ?? false;
  const userHasWallet = query.viewer?.user?.primaryWallet?.__typename === 'Wallet';

  const { colorScheme } = useColorScheme();
  const { openManageWallet } = useManageWalletActions();

  const navigation = useNavigation<MainTabStackNavigatorProp>();
  const bottomSheetRef = useRef<GalleryBottomSheetModalType | null>(null);

  // @ts-expect-error: temporary
  const handleUsernamePress = useCallback(() => {
    if (community.creator?.__typename === 'GalleryUser') {
      navigation.navigate('Profile', { username: community.creator?.username ?? '' });
    }
  }, [community.creator, navigation]);

  const handleCreatePost = useCallback(() => {
    if (!isMemberOfCommunity) {
      bottomSheetRef.current?.present();
      return;
    }

    if (!community?.contractAddress?.address) return;
    navigation.navigate('NftSelectorContractScreen', {
      contractAddress: community?.contractAddress?.address,
      page: 'Community',
    });
  }, [community?.contractAddress?.address, isMemberOfCommunity, navigation]);

  const handlePress = useCallback(() => {
    if (!userHasWallet) {
      openManageWallet({
        title: 'You need to connect a wallet to post',
        onSuccess: () => {
          handleCreatePost();
        },
      });
      return;
    }

    handleCreatePost();
  }, [handleCreatePost, openManageWallet, userHasWallet]);

  const PostIconColor = useMemo(() => {
    if (isMemberOfCommunity) {
      if (colorScheme === 'dark') {
        return colors.black['800'];
      } else {
        return colors.white;
      }
    } else {
      if (colorScheme === 'dark') {
        return colors.shadow;
      } else {
        return colors.metal;
      }
    }
  }, [isMemberOfCommunity, colorScheme]);

  const handleRefresh = useCallback(() => {
    refetch(
      {
        communityID: community.dbid,
      },
      { fetchPolicy: 'network-only' }
    );
  }, [community.dbid, refetch]);

  return (
    <View className="flex flex-row justify-between">
      {/* {community.creator && community?.chain !== 'POAP' ? (
        <View className="flex flex-column space-y-1">
          <Typography
            font={{ family: 'ABCDiatype', weight: 'Regular' }}
            className="text-xs uppercase"
          >
            CREATED BY
          </Typography>
          <View>
            <CreatorProfilePictureAndUsernameOrAddress
              userOrAddressRef={community.creator}
              handlePress={handleUsernamePress}
              eventContext={contexts['NFT Detail']}
            />
          </View>
        </View>
      ) : null} */}

      {/* {community.chain && (
        <View className="flex flex-column space-y-1">
          <Typography
            font={{ family: 'ABCDiatype', weight: 'Regular' }}
            className="text-xs uppercase"
          >
            NETWORK
          </Typography>

          <View className="flex flex-row space-x-1 items-center">
            <NetworkIcon chain={community.chain} />
            <Typography
              font={{ family: 'ABCDiatype', weight: 'Bold' }}
              className="text-sm text-black-800 dark:text-offWhite"
            >
              {community.chain}
            </Typography>
          </View>
        </View>
      )} */}

      <Button
        size="sm"
        text="Post"
        className="w-[100px]"
        variant={isMemberOfCommunity ? 'primary' : 'disabled'}
        icon={<PostIcon width={16} color={PostIconColor} strokeWidth={2} />}
        onPress={handlePress}
        eventElementId="Attempt Create Post Button"
        eventName="Attempt Create Post"
        eventContext={contexts.Community}
      />
      <CommunityPostBottomSheet
        ref={bottomSheetRef}
        communityRef={community}
        onRefresh={handleRefresh}
      />
    </View>
  );
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
// @ts-expect-error: temporary
function NetworkIcon({ chain }: { chain: Chain }) {
  if (chain === 'Ethereum') {
    return <EthIcon />;
  } else if (chain === 'Base') {
    return <BaseIcon />;
  } else if (chain === 'Zora') {
    return <ZoraIcon />;
  } else if (chain === 'Optimism') {
    return <OptimismIcon />;
  } else if (chain === 'Polygon') {
    return <PolygonIcon />;
  } else if (chain === 'Arbitrum') {
    return <ArbitrumIcon />;
  } else if (chain === 'POAP') {
    return <PoapIcon className="w-4 h-4" />;
  } else if (chain === 'Tezos') {
    return <TezosIcon />;
  }

  return null;
}
