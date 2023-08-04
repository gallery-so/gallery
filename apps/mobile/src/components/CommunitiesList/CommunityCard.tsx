/* eslint-disable no-console */
import { useCallback } from 'react';
import { View } from 'react-native';
import { useFragment } from 'react-relay';
import { graphql } from 'relay-runtime';

import { Typography } from '~/components/Typography';
import { CommunityCardFragment$key } from '~/generated/CommunityCardFragment.graphql';

import { GalleryTouchableOpacity } from '../GalleryTouchableOpacity';
import { Markdown } from '../Markdown';
import { CommunityProfilePicture } from '../ProfilePicture/CommunityProfilePicture';
type ContractAddress = {
  address: string | null;
  chain: string | null;
};

type CommunityCardProps = {
  communityRef: CommunityCardFragment$key;
  onPress: (contractAddress: ContractAddress) => void;
};

export function CommunityCard({ communityRef, onPress }: CommunityCardProps) {
  const community = useFragment(
    graphql`
      fragment CommunityCardFragment on Community {
        name
        description
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

  const descriptionFirstLine = community.description?.split('\n')[0];
  return (
    <GalleryTouchableOpacity
      onPress={handlePress}
      className="flex flex-row items-center space-x-4 py-3 px-4 h-16"
      eventElementId="Community Name"
      eventName="Community Name Clicked"
    >
      <CommunityProfilePicture communityRef={community} size="md" />

      <View className="flex-1">
        <Typography className="text-sm" font={{ family: 'ABCDiatype', weight: 'Bold' }}>
          {community.name}
        </Typography>
        {descriptionFirstLine && <Markdown numberOfLines={1}>{descriptionFirstLine}</Markdown>}
      </View>
    </GalleryTouchableOpacity>
  );
}
