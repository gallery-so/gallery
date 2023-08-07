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
import { MainTabStackNavigatorProp } from '~/navigation/types';
import colors from '~/shared/theme/colors';

import { GalleryTouchableOpacity } from '../GalleryTouchableOpacity';
import { LinkableAddress } from '../LinkableAddress';
import { ProfilePicture } from '../ProfilePicture/ProfilePicture';
import { RawProfilePicture } from '../ProfilePicture/RawProfilePicture';
import { Typography } from '../Typography';

type Props = {
  communityRef: CommunityMetaFragment$key;
  queryRef: CommunityMetaQueryFragment$key;
};
const ENABLED_TOTAL_TOKENS = false;

export function CommunityMeta({ communityRef, queryRef }: Props) {
  const community = useFragment(
    graphql`
      fragment CommunityMetaFragment on Community {
        chain
        contractAddress {
          chain
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
        tokensInCommunity(first: 1) {
          pageInfo {
            total
          }
        }
        posts(first: $postLast, after: $postBefore)
          @connection(key: "CommunityViewPostsTabFragment_posts") {
          # Relay requires that we grab the edges field if we use the connection directive
          # We're selecting __typename since that shouldn't have a cost
          # eslint-disable-next-line relay/unused-fields
          edges {
            __typename
          }
          pageInfo {
            total
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

  const totalTokens = community.tokensInCommunity?.pageInfo?.total;
  const totalPosts = community.posts?.pageInfo?.total ?? 0;

  const formattedTotalTokens = useMemo(() => {
    if (totalTokens && totalTokens > 999) {
      return `${Math.floor(totalTokens / 1000)}K`;
    }

    return totalTokens;
  }, [totalTokens]);

  const formattedTotalPosts = useMemo(() => {
    if (totalPosts && totalPosts > 999) {
      return `${Math.floor(totalPosts / 1000)}K`;
    }

    return totalPosts;
  }, [totalPosts]);

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
        <View className="flex flex-row space-x-1 items-center">
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
      {totalPosts > 0 && isKoalaEnabled && (
        <View className="flex flex-column space-y-1">
          <Typography
            font={{ family: 'ABCDiatype', weight: 'Regular' }}
            className="text-xs uppercase"
          >
            posts
          </Typography>

          <View className="space-y-1">
            <Typography
              font={{ family: 'ABCDiatype', weight: 'Bold' }}
              className="text-sm text-black-800 dark:text-offWhite text-right"
            >
              {formattedTotalPosts}
            </Typography>
          </View>
        </View>
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
