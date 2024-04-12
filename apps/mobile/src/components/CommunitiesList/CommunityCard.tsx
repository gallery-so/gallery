import { useCallback } from 'react';
import { View } from 'react-native';
import { useFragment } from 'react-relay';
import { graphql } from 'relay-runtime';
import { useNavigateToCommunityScreen } from 'src/hooks/useNavigateToCommunityScreen';

import { Typography } from '~/components/Typography';
import { CommunityCardFragment$key } from '~/generated/CommunityCardFragment.graphql';
import { contexts } from '~/shared/analytics/constants';

import { GalleryTouchableOpacity } from '../GalleryTouchableOpacity';
import { Markdown } from '../Markdown';
import { CommunityProfilePicture } from '../ProfilePicture/CommunityProfilePicture';

type CommunityCardProps = {
  communityRef: CommunityCardFragment$key;
};

export function CommunityCard({ communityRef }: CommunityCardProps) {
  const community = useFragment(
    graphql`
      fragment CommunityCardFragment on Community {
        name
        description
        ...CommunityProfilePictureFragment
        ...useNavigateToCommunityScreenFragment
      }
    `,
    communityRef
  );

  const navigateToCommunity = useNavigateToCommunityScreen();

  const handlePress = useCallback(() => {
    navigateToCommunity(community);
  }, [community, navigateToCommunity]);

  const descriptionFirstLine = community.description?.split('\n')[0];
  return (
    <GalleryTouchableOpacity
      onPress={handlePress}
      className="flex flex-row items-center space-x-4 py-2"
      eventElementId="Community Name"
      eventName="Community Name Clicked"
      eventContext={contexts.Community}
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
