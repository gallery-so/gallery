import { useCallback } from 'react';
import { View } from 'react-native';
import { useFragment } from 'react-relay';
import { graphql } from 'relay-runtime';

import { Typography } from '~/components/Typography';
import { CommunityFollowCardFragment$key } from '~/generated/CommunityFollowCardFragment.graphql';

import { GalleryTouchableOpacity } from '../GalleryTouchableOpacity';
import { CommunityProfilePicture } from '../ProfilePicture/CommunityProfilePicture';

type ContractAddress = {
  address: string | null;
  chain: string | null;
};

type CommunityFollowCardProps = {
  communityRef: CommunityFollowCardFragment$key;
  onPress: (contractAddress: ContractAddress) => void;
};

export function CommunityFollowCard({ communityRef, onPress }: CommunityFollowCardProps) {
  const community = useFragment(
    graphql`
      fragment CommunityFollowCardFragment on Community {
        name
        contractAddress {
          address
          chain
        }
        ...CommunityProfilePictureFragment
      }
    `,
    communityRef
  );

  const handlePress = useCallback(() => {
    if (community.contractAddress?.address && community?.contractAddress?.chain) {
      onPress(community.contractAddress);
    }
  }, [onPress, community.contractAddress]);

  return (
    <View className="flex w-full flex-row items-center justify-between space-x-8 overflow-hidden py-2 px-4">
      <GalleryTouchableOpacity
        onPress={handlePress}
        className="flex flex-1 flex-grow flex-col h-full space-y-1"
        eventElementId="Common Community Name"
        eventName="Common Community Name Clicked"
      >
        <View className="flex flex-row items-center space-x-2">
          <CommunityProfilePicture communityRef={community} size="md" />
          <View>
            <Typography className="text-sm" font={{ family: 'ABCDiatype', weight: 'Bold' }}>
              {community.name}
            </Typography>
          </View>
        </View>
      </GalleryTouchableOpacity>
    </View>
  );
}
