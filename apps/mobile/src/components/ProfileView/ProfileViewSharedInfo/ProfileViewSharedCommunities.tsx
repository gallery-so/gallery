import { useNavigation } from '@react-navigation/native';
import React, { useCallback, useMemo, useRef } from 'react';
import { View } from 'react-native';
import { graphql, useFragment } from 'react-relay';

import { GalleryBottomSheetModalType } from '~/components/GalleryBottomSheet/GalleryBottomSheetModal';
import { InteractiveLink } from '~/components/InteractiveLink';
import { Typography } from '~/components/Typography';
import { ProfileViewSharedCommunitiesFragment$key } from '~/generated/ProfileViewSharedCommunitiesFragment.graphql';
import { MainTabStackNavigatorProp } from '~/navigation/types';
import { removeNullValues } from '~/shared/relay/removeNullValues';

import {
  ContractAddress,
  ProfileViewSharedCommunitiesSheet,
} from './ProfileViewSharedCommunitiesSheet';

type Props = {
  userRef: ProfileViewSharedCommunitiesFragment$key;
};

export const SHARED_COMMUNITIES_PER_PAGE = 20;

export default function ProfileViewSharedCommunities({ userRef }: Props) {
  const user = useFragment(
    graphql`
      fragment ProfileViewSharedCommunitiesFragment on GalleryUser {
        __typename
        sharedCommunities(first: $sharedCommunitiesFirst, after: $sharedCommunitiesAfter)
          @connection(key: "UserSharedInfoFragment_sharedCommunities") {
          edges {
            node {
              __typename
              ... on Community {
                __typename
                id
                name
                chain
                contractAddress {
                  address
                  chain
                }
              }
            }
          }
          pageInfo {
            total
          }
        }
        ...ProfileViewSharedCommunitiesSheetFragment
      }
    `,
    userRef
  );

  const sharedCommunities = useMemo(() => {
    const list = user.sharedCommunities?.edges?.map((edge) => edge?.node) ?? [];
    return removeNullValues(list);
  }, [user.sharedCommunities?.edges]);

  const totalSharedCommunities = user.sharedCommunities?.pageInfo?.total ?? 0;

  // Determine how many users to display by username
  const communitiesToDisplay = useMemo(() => {
    // In most cases we display a max of 2 communities. ie "community1, community2 and 3 others"
    // But if there are exactly 3 shared communities, we display all 3. ie "community1, community2 and community3"
    const maxNamesToDisplay = totalSharedCommunities === 3 ? 3 : 2;
    return sharedCommunities.slice(0, maxNamesToDisplay);
  }, [sharedCommunities, totalSharedCommunities]);

  const bottomSheetRef = useRef<GalleryBottomSheetModalType | null>(null);
  const handleSeeAllPress = useCallback(() => {
    bottomSheetRef.current?.present();
  }, []);

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

  const content = useMemo(() => {
    // Display up to 3 communities
    const result = communitiesToDisplay.map((community) => {
      if (!!community.contractAddress && community.chain) {
        return (
          <InteractiveLink
            type="Profile View Shared Communities"
            key={community.id}
            textStyle={{ fontSize: 12 }}
            showUnderline
            onPress={() =>
              community.contractAddress && handleCommunityPress(community.contractAddress)
            }
          >
            {community.name}
          </InteractiveLink>
        );
      }

      return (
        <Typography
          className="text-xs "
          font={{ family: 'ABCDiatype', weight: 'Regular' }}
          key={community.id}
        >
          {community.name}
        </Typography>
      );
    });

    // If there are more than 3 communities, add a link to show all in a popover
    if (totalSharedCommunities > 3) {
      result.push(
        <InteractiveLink
          type="Shared Communmities See All"
          showUnderline
          onPress={handleSeeAllPress}
          textStyle={{ fontSize: 12 }}
          key="shared-communities-see-all"
        >
          {totalSharedCommunities - 2} others
        </InteractiveLink>
      );
    }

    // Add punctuation: "," and "and"
    if (result.length === 3) {
      result.splice(
        1,
        0,
        <Typography
          className="text-xs"
          font={{ family: 'ABCDiatype', weight: 'Bold' }}
          key="shared-communities-comma"
        >
          ,&nbsp;
        </Typography>
      );
    }
    if (result.length > 1) {
      result.splice(
        -1,
        0,
        <Typography
          className="text-xs"
          font={{ family: 'ABCDiatype', weight: 'Bold' }}
          key="shared-communities-and"
        >
          &nbsp;and&nbsp;
        </Typography>
      );
    }

    return result;
  }, [communitiesToDisplay, handleCommunityPress, handleSeeAllPress, totalSharedCommunities]);

  if (totalSharedCommunities === 0) {
    return null;
  }

  return (
    <View className="flex flex-row flex-wrap">
      <Typography className="text-xs" font={{ family: 'ABCDiatype', weight: 'Bold' }}>
        Also holds{' '}
      </Typography>
      {content}
      <ProfileViewSharedCommunitiesSheet ref={bottomSheetRef} userRef={user} />
    </View>
  );
}
