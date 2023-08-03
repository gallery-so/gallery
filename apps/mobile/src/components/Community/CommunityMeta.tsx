import { useNavigation } from '@react-navigation/native';
import { useColorScheme } from 'nativewind';
import { useCallback, useMemo } from 'react';
import { View } from 'react-native';
import { graphql, useFragment } from 'react-relay';
import { EthIcon } from 'src/icons/EthIcon';
import { PoapIcon } from 'src/icons/PoapIcon';
import { TezosIcon } from 'src/icons/TezosIcon';
import isFeatureEnabled, { FeatureFlag } from 'src/utils/isFeatureEnabled';

import { Chain, CommunityMetaFragment$key } from '~/generated/CommunityMetaFragment.graphql';
import { CommunityMetaQueryFragment$key } from '~/generated/CommunityMetaQueryFragment.graphql';
import { PostIcon } from '~/navigation/MainTabNavigator/PostIcon';
import { MainTabStackNavigatorProp } from '~/navigation/types';
import colors from '~/shared/theme/colors';

import { Button } from '../Button';
import { GalleryTouchableOpacity } from '../GalleryTouchableOpacity';
import { LinkableAddress } from '../LinkableAddress';
import { ProfilePicture } from '../ProfilePicture/ProfilePicture';
import { RawProfilePicture } from '../ProfilePicture/RawProfilePicture';
import { Typography } from '../Typography';

type Props = {
  communityRef: CommunityMetaFragment$key;
  queryRef: CommunityMetaQueryFragment$key;
};

export function CommunityMeta({ communityRef, queryRef }: Props) {
  const community = useFragment(
    graphql`
      fragment CommunityMetaFragment on Community {
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
      }
    `,
    communityRef
  );

  const query = useFragment(
    graphql`
      fragment CommunityMetaQueryFragment on Query {
        ...isFeatureEnabledFragment
      }
    `,
    queryRef
  );

  const { colorScheme } = useColorScheme();
  const isKoalaEnabled = isFeatureEnabled(FeatureFlag.KOALA, query);

  const navigation = useNavigation<MainTabStackNavigatorProp>();

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
            className="text-sm text-shadow"
            font={{ family: 'ABCDiatype', weight: 'Regular' }}
          >
            {community.creator.username}
          </Typography>
        </GalleryTouchableOpacity>
      );
    } else if (community.contractAddress) {
      return (
        <View className="flex flex-row space-x-1 items-center">
          <RawProfilePicture size="xs" default eventElementId={null} eventName={null} />
          <LinkableAddress
            chainAddressRef={community.contractAddress}
            type="Community Contract Address"
            textStyle={{ color: colors.shadow }}
          />
        </View>
      );
    } else {
      return null;
    }
  }, [community.creator, community.contractAddress, handleUsernamePress]);

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
              font={{ family: 'ABCDiatype', weight: 'Regular' }}
              className="text-sm text-shadow"
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
          icon={
            <PostIcon
              size={14}
              color={colorScheme === 'dark' ? colors.black['800'] : colors.white}
            />
          }
          onPress={handleCreatePost}
          eventElementId={null}
          eventName={null}
        />
      )}
    </View>
  );
}

function NetworkIcon({ chain }: { chain: Chain }) {
  if (chain === 'Ethereum') {
    return <EthIcon />;
  } else if (chain === 'POAP') {
    return <PoapIcon className="w-4 h-4" />;
  } else if (chain === 'Tezos') {
    return <TezosIcon />;
  }

  return null;
}
