import { useNavigation } from '@react-navigation/native';
import { useColorScheme } from 'nativewind';
import { useCallback, useMemo } from 'react';
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

import { useBottomSheetModalActions } from '~/contexts/BottomSheetModalContext';
import { useManageWalletActions } from '~/contexts/ManageWalletContext';
import { CommunityMetaFragment$key } from '~/generated/CommunityMetaFragment.graphql';
import { CommunityMetaQueryFragment$key } from '~/generated/CommunityMetaQueryFragment.graphql';
import { CommunityMetaRefetchQuery } from '~/generated/CommunityMetaRefetchQuery.graphql';
import { PostIcon } from '~/navigation/MainTabNavigator/PostIcon';
import { MainTabStackNavigatorProp } from '~/navigation/types';
import { contexts } from '~/shared/analytics/constants';
import colors from '~/shared/theme/colors';
import { Chain } from '~/shared/utils/chains';
import { extractRelevantMetadataFromCommunity } from '~/shared/utils/extractRelevantMetadataFromCommunity';

import { Button } from '../Button';
import { MintLinkButton } from '../MintLinkButton';
import { CreatorProfilePictureAndUsernameOrAddress } from '../ProfilePicture/ProfilePictureAndUserOrAddress';
import { Typography } from '../Typography';
import CommunityPostBottomSheet from './CommunityPostBottomSheet';

type Props = {
  communityRef: CommunityMetaFragment$key;
  queryRef: CommunityMetaQueryFragment$key;
};

export function CommunityMeta({ communityRef, queryRef }: Props) {
  const community = useFragment(
    graphql`
      fragment CommunityMetaFragment on Community {
        dbid
        creator {
          ...ProfilePictureAndUserOrAddressCreatorFragment
          __typename
          ... on GalleryUser {
            username
            primaryWallet {
              chainAddress {
                address
              }
            }
          }
        }
        ...CommunityPostBottomSheetFragment
        ...extractRelevantMetadataFromCommunityFragment
      }
    `,
    communityRef
  );

  const { chain, contractAddress, mintUrl } = extractRelevantMetadataFromCommunity(community);

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

  const creatorWalletAddress = community?.creator?.primaryWallet?.chainAddress?.address ?? '';

  const { colorScheme } = useColorScheme();
  const { openManageWallet } = useManageWalletActions();

  const navigation = useNavigation<MainTabStackNavigatorProp>();

  const handleUsernamePress = useCallback(() => {
    if (community.creator?.__typename === 'GalleryUser') {
      navigation.navigate('Profile', { username: community.creator?.username ?? '' });
    }
  }, [community.creator, navigation]);

  const handleRefresh = useCallback(() => {
    refetch(
      {
        communityID: community.dbid,
      },
      { fetchPolicy: 'network-only' }
    );
  }, [community.dbid, refetch]);

  const { showBottomSheetModal } = useBottomSheetModalActions();
  const handleCreatePost = useCallback(() => {
    if (!isMemberOfCommunity) {
      showBottomSheetModal({
        content: <CommunityPostBottomSheet communityRef={community} onRefresh={handleRefresh} />,
      });

      return;
    }

    if (!contractAddress) return;
    navigation.navigate('CommunityNftSelectorScreen', {
      contractAddress,
      page: 'Community',
    });
  }, [
    community,
    contractAddress,
    handleRefresh,
    isMemberOfCommunity,
    navigation,
    showBottomSheetModal,
  ]);

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

  return (
    <View className="flex flex-row justify-between">
      <View className="space-y-3">
        {community.creator && chain !== 'POAP' ? (
          <View className="flex flex-column space-y-0.5">
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
        ) : null}

        {chain && (
          <View className="flex flex-column space-y-0.5">
            <Typography
              font={{ family: 'ABCDiatype', weight: 'Regular' }}
              className="text-xs uppercase"
            >
              NETWORK
            </Typography>

            <View className="flex flex-row space-x-1 items-center">
              <NetworkIcon chain={chain} />
              <Typography
                font={{ family: 'ABCDiatype', weight: 'Bold' }}
                className="text-sm text-black-800 dark:text-offWhite"
              >
                {chain}
              </Typography>
            </View>
          </View>
        )}
      </View>
      {isMemberOfCommunity ? (
        <Button
          size="sm"
          text="Post"
          className="w-[100px]"
          variant={isMemberOfCommunity ? 'primary' : 'disabled'}
          headerElement={<PostIcon width={16} color={PostIconColor} strokeWidth={2} />}
          onPress={handlePress}
          eventElementId="Attempt Create Post Button"
          eventName="Attempt Create Post"
          eventContext={contexts.Community}
        />
      ) : (
        <MintLinkButton
          tokenRef={null}
          overrideMetadata={{
            contractAddress,
            chain,
            mintUrl,
          }}
          size="sm"
          eventContext={contexts.Community}
          referrerAddress={creatorWalletAddress}
        />
      )}
    </View>
  );
}

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
