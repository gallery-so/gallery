import { View } from 'react-native';
import { graphql, useFragment } from 'react-relay';

import { CommunityHeaderFragment$key } from '~/generated/CommunityHeaderFragment.graphql';

import { Markdown } from '../Markdown';
import { CommunityProfilePicture } from '../ProfilePicture/CommunityProfilePicture';
import { Typography } from '../Typography';

type Props = {
  communityRef: CommunityHeaderFragment$key;
};
export function CommunityHeader({ communityRef }: Props) {
  const community = useFragment(
    graphql`
      fragment CommunityHeaderFragment on Community {
        name
        description
        ...CommunityProfilePictureFragment
      }
    `,
    communityRef
  );

  const formattedDescription = community.description?.replace(/\n/g, ' ');

  return (
    <View className="mb-4">
      <View className="flex flex-row space-x-2">
        <CommunityProfilePicture communityRef={community} size="xxl" />
        <View className="flex-1">
          <Typography font={{ family: 'ABCDiatype', weight: 'Bold' }} className="text-lg">
            {community.name}
          </Typography>
          {formattedDescription && (
            <Typography font={{ family: 'ABCDiatype', weight: 'Regular' }} className="text-sm mt-1">
              <Markdown numberOfLines={3}>{formattedDescription}</Markdown>
            </Typography>
          )}
        </View>
      </View>
    </View>
  );
}
