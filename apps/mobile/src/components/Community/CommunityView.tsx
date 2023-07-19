import { useNavigation } from '@react-navigation/native';
import { useCallback, useMemo } from 'react';
import { View } from 'react-native';
import { graphql, useFragment } from 'react-relay';
import { EthIcon } from 'src/icons/EthIcon';
import { PoapIcon } from 'src/icons/PoapIcon';
import { TezosIcon } from 'src/icons/TezosIcon';

import { Chain, CommunityViewFragment$key } from '~/generated/CommunityViewFragment.graphql';
import { MainTabStackNavigatorProp } from '~/navigation/types';

import { BackButton } from '../BackButton';
import { GalleryTouchableOpacity } from '../GalleryTouchableOpacity';
import { LinkableAddress } from '../LinkableAddress';
import { ProfilePicture } from '../ProfilePicture/ProfilePicture';
import { RawProfilePicture } from '../ProfilePicture/RawProfilePicture';
import { Typography } from '../Typography';
import { CommunityCollectorsList } from './CommunityCollectorsList';
import { CommunityHeader } from './CommunityHeader';

type Props = {
  queryRef: CommunityViewFragment$key;
};

const ENABLED_TOTAL_TOKENS = false;

export function CommunityView({ queryRef }: Props) {
  const query = useFragment(
    graphql`
      fragment CommunityViewFragment on Query {
        community: communityByAddress(communityAddress: $communityAddress)
          @required(action: THROW) {
          ... on ErrCommunityNotFound {
            __typename
          }
          ... on Community {
            __typename
            chain
            contractAddress {
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
                ...LinkableAddressFragment
              }
            }
            tokensInCommunity(first: 10000) {
              pageInfo {
                total
              }
            }
            ...CommunityCollectorsListFragment
            ...CommunityHeaderFragment
          }
        }

        ...CommunityCollectorsListQueryFragment
      }
    `,
    queryRef
  );

  const { community } = query;

  if (!community || community.__typename !== 'Community') {
    throw new Error(`Unable to fetch the community`);
  }

  const navigation = useNavigation<MainTabStackNavigatorProp>();

  const handleUsernamePress = useCallback(() => {
    if (community.creator?.__typename === 'GalleryUser' && community.creator?.username) {
      navigation.navigate('Profile', { username: community.creator?.username });
    }
  }, [community.creator, navigation]);

  const totalTokens = community.tokensInCommunity?.pageInfo?.total;

  const formattedTotalTokens = useMemo(() => {
    if (totalTokens && totalTokens > 999) {
      return `${Math.floor(totalTokens / 1000)}K`;
    }

    return totalTokens;
  }, [totalTokens]);

  const showAddressOrGalleryUser = useMemo(() => {
    if (community.creator?.__typename === 'GalleryUser' && !community.creator?.universal) {
      return (
        <GalleryTouchableOpacity
          className="flex flex-row items-center space-x-1"
          onPress={handleUsernamePress}
          eventElementId="NFT Detail Token Owner Username"
          eventName="NFT Detail Token Owner Username"
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
          <RawProfilePicture
            size="xs"
            default
            eventElementId="ProfilePicture"
            eventName="ProfilePicture pressed"
          />
          <LinkableAddress
            chainAddressRef={community.contractAddress}
            type="Community Contract Address"
          />
        </View>
      );
    } else {
      return null;
    }
  }, [community.creator, community.contractAddress, handleUsernamePress]);

  return (
    <View className="flex-1">
      <View className="flex flex-col px-4 pb-4 z-10 bg-white dark:bg-black">
        <View className="flex flex-row justify-between bg-white dark:bg-black">
          <BackButton />
        </View>
      </View>

      <View className="flex-grow">
        <View className="mb-4 px-4">
          <CommunityHeader communityRef={community} />
          <View className="mb-4 flex flex-row space-x-6">
            <View className="space-y-1">
              <Typography
                font={{ family: 'ABCDiatype', weight: 'Regular' }}
                className="text-xs uppercase"
              >
                created by
              </Typography>

              <Typography
                font={{ family: 'ABCDiatype', weight: 'Regular' }}
                className="text-sm text-shadow"
              >
                {showAddressOrGalleryUser}
              </Typography>
            </View>
            <View className="space-y-1">
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
            {ENABLED_TOTAL_TOKENS && (
              <View className="space-y-1">
                <Typography
                  font={{ family: 'ABCDiatype', weight: 'Regular' }}
                  className="text-xs uppercase text-right"
                >
                  items
                </Typography>

                <Typography
                  font={{ family: 'ABCDiatype', weight: 'Regular' }}
                  className="text-sm text-shadow text-right"
                >
                  {formattedTotalTokens}
                </Typography>
              </View>
            )}
          </View>
        </View>

        <Typography font={{ family: 'ABCDiatype', weight: 'Bold' }} className="text-sm mb-4 px-4">
          Collectors on Gallery
        </Typography>

        <CommunityCollectorsList queryRef={query} communityRef={community} />
      </View>
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
