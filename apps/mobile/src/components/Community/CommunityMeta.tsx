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
import isFeatureEnabled, { FeatureFlag } from 'src/utils/isFeatureEnabled';

import { useManageWalletActions } from '~/contexts/ManageWalletContext';
import { Chain, CommunityMetaFragment$key } from '~/generated/CommunityMetaFragment.graphql';
import { CommunityMetaQueryFragment$key } from '~/generated/CommunityMetaQueryFragment.graphql';
import { CommunityMetaRefetchQuery } from '~/generated/CommunityMetaRefetchQuery.graphql';
import { PostIcon } from '~/navigation/MainTabNavigator/PostIcon';
import { MainTabStackNavigatorProp } from '~/navigation/types';
import colors from '~/shared/theme/colors';

import { Button } from '../Button';
import { GalleryBottomSheetModalType } from '../GalleryBottomSheet/GalleryBottomSheetModal';
import { GalleryTouchableOpacity } from '../GalleryTouchableOpacity';
import { LinkableAddress } from '../LinkableAddress';
import { ProfilePicture } from '../ProfilePicture/ProfilePicture';
import { RawProfilePicture } from '../ProfilePicture/RawProfilePicture';
import { Typography } from '../Typography';
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
          ...LinkableAddressFragment
        }
        creator {
          __typename
          ... on GalleryUser {
            username
            universal
            ...ProfilePictureFragment
          }
          ... on ChainAddress {
            chain
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
        ...isFeatureEnabledFragment
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

  const isKoalaEnabled = isFeatureEnabled(FeatureFlag.KOALA, query);

  const navigation = useNavigation<MainTabStackNavigatorProp>();
  const bottomSheetRef = useRef<GalleryBottomSheetModalType | null>(null);

  const handleUsernamePress = useCallback(() => {
    if (community.creator?.__typename === 'GalleryUser' && community.creator?.username) {
      navigation.navigate('Profile', { username: community.creator?.username });
    }
  }, [community.creator, navigation]);

  const handleCreatePost = useCallback(() => {
    if (!community?.contractAddress?.address) return;
    navigation.navigate('NftSelectorContractScreen', {
      contractAddress: community?.contractAddress?.address,
      page: 'Community',
    });
  }, [navigation, community?.contractAddress?.address]);

  const handlePress = useCallback(() => {
    if (!userHasWallet) {
      openManageWallet({
        title: 'You need to connect a wallet to post',
      });
      return;
    }

    if (isMemberOfCommunity) {
      handleCreatePost();
      return;
    }

    bottomSheetRef.current?.present();
  }, [handleCreatePost, isMemberOfCommunity, openManageWallet, userHasWallet]);

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

  const showAddressOrGalleryUser = useMemo(() => {
    if (community.creator?.__typename === 'GalleryUser' && !community.creator?.universal) {
      return (
        <GalleryTouchableOpacity
          className="flex flex-row items-center space-x-1"
          onPress={handleUsernamePress}
          eventElementId="Community Page Creator Username"
          eventName="Tapped Community Page Creator Username"
        >
          {community.creator.__typename && <ProfilePicture userRef={community.creator} size="xs" />}

          <Typography
            className="text-sm text-black-800 dark:text-offWhite"
            font={{ family: 'ABCDiatype', weight: 'Bold' }}
          >
            {community.creator.username}
          </Typography>
        </GalleryTouchableOpacity>
      );
    } else if (community.contractAddress) {
      return (
        <View className="flex flex-row items-center space-x-1">
          <RawProfilePicture size="xs" default eventElementId={null} eventName={null} />
          <LinkableAddress
            chainAddressRef={community.contractAddress}
            type="Community Contract Address"
            textStyle={{ color: colorScheme === 'light' ? colors.black[800] : colors.offWhite }}
            font={{ family: 'ABCDiatype', weight: 'Bold' }}
          />
        </View>
      );
    } else {
      return null;
    }
  }, [colorScheme, community.creator, community.contractAddress, handleUsernamePress]);

  return (
    <View className="flex flex-row space-x-6">
      {community?.chain !== 'POAP' && (
        <View className="flex flex-column space-y-1">
          <Typography
            font={{ family: 'ABCDiatype', weight: 'Regular' }}
            className="text-xs uppercase"
          >
            created by
          </Typography>
          {showAddressOrGalleryUser}
        </View>
      )}
      <View className="flex flex-column space-y-1">
        <Typography
          font={{ family: 'ABCDiatype', weight: 'Regular' }}
          className="text-xs uppercase"
        >
          network
        </Typography>

        {community.chain && (
          <View className="flex flex-row space-x-1 items-center">
            <NetworkIcon chain={community.chain} />
            <Typography
              font={{ family: 'ABCDiatype', weight: 'Bold' }}
              className="text-sm text-black-800 dark:text-offWhite"
            >
              {community.chain}
            </Typography>
          </View>
        )}
      </View>
      {isKoalaEnabled && (
        <Button
          size="sm"
          text="Post"
          className="w-[100px]"
          variant={isMemberOfCommunity ? 'primary' : 'disabled'}
          icon={<PostIcon width={16} color={PostIconColor} strokeWidth={2} />}
          onPress={handlePress}
          eventElementId={null}
          eventName={null}
        />
      )}
      <CommunityPostBottomSheet
        ref={bottomSheetRef}
        communityRef={community}
        onRefresh={handleRefresh}
      />
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
