import { forwardRef } from 'react';
import { View } from 'react-native';
import { graphql, useFragment } from 'react-relay';

import { CommunityBottomSheetFragment$key } from '~/generated/CommunityBottomSheetFragment.graphql';

import { Markdown } from '../Markdown';
import { Typography } from '../Typography';

const markdownStyles = {
  paragraph: {
    marginBottom: 16,
  },
};

type Props = {
  communityRef: CommunityBottomSheetFragment$key;
};

function CommunityBottomSheet({ communityRef }: Props) {
  const community = useFragment(
    graphql`
      fragment CommunityBottomSheetFragment on Community {
        name
        description
      }
    `,
    communityRef
  );

  return (
    <View className="flex flex-col space-y-6">
      <View className="flex flex-col space-y-4">
        <Typography
          className="text-lg text-black-900 dark:text-offWhite"
          font={{ family: 'ABCDiatype', weight: 'Bold' }}
        >
          {community.name}
        </Typography>
        <Typography
          className="text-sm text-black-900 dark:text-offWhite"
          font={{ family: 'ABCDiatype', weight: 'Regular' }}
        >
          <Markdown style={markdownStyles}>{community.description}</Markdown>
        </Typography>
      </View>
    </View>
  );
}

const ForwardedCommunityBottomSheet = forwardRef(CommunityBottomSheet);

export { ForwardedCommunityBottomSheet as CommunityBottomSheet };
