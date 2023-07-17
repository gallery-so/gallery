import { useCallback, useRef } from 'react';
import { View } from 'react-native';
import { graphql, useFragment } from 'react-relay';

import { CommunityHeaderFragment$key } from '~/generated/CommunityHeaderFragment.graphql';

import { GalleryBottomSheetModalType } from '../GalleryBottomSheet/GalleryBottomSheetModal';
import { GalleryTouchableOpacity } from '../GalleryTouchableOpacity';
import { Markdown } from '../Markdown';
import { CommunityProfilePicture } from '../ProfilePicture/CommunityProfilePicture';
import { Typography } from '../Typography';
import { CommunityBottomSheet } from './CommunityBottomSheet';

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
        ...CommunityBottomSheetFragment
      }
    `,
    communityRef
  );

  const bottomSheetRef = useRef<GalleryBottomSheetModalType | null>(null);
  const handlePress = useCallback(() => {
    bottomSheetRef.current?.present();
  }, []);

  const formattedDescription = community.description?.replace(/\n/g, ' ');

  return (
    <View className="mb-4">
      <View className="flex flex-row space-x-2">
        <CommunityProfilePicture communityRef={community} size="xxl" />
        <GalleryTouchableOpacity
          className="flex-1"
          onPress={handlePress}
          eventElementId={null}
          eventName={null}
        >
          <View>
            <Typography
              font={{ family: 'ABCDiatype', weight: 'Bold' }}
              className="text-lg leading-5 mb-1"
            >
              {community.name}
            </Typography>

            {formattedDescription && <Markdown numberOfLines={3}>{formattedDescription}</Markdown>}
          </View>
        </GalleryTouchableOpacity>
      </View>
      <CommunityBottomSheet ref={bottomSheetRef} communityRef={community} />
    </View>
  );
}
