import { useCallback, useRef } from 'react';
import { View } from 'react-native';
import { graphql, useFragment } from 'react-relay';

import { CommunityHeaderFragment$key } from '~/generated/CommunityHeaderFragment.graphql';
import { contexts } from '~/shared/analytics/constants';
import { truncateAddress } from '~/shared/utils/wallet';

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
        contractAddress {
          address
        }
        description
        ...CommunityProfilePictureFragment
        ...CommunityBottomSheetFragment
      }
    `,
    communityRef
  );

  const hasCommunityDescription = Boolean(community.description);
  const bottomSheetRef = useRef<GalleryBottomSheetModalType | null>(null);
  const handlePress = useCallback(() => {
    if (!hasCommunityDescription) return;
    bottomSheetRef.current?.present();
  }, [hasCommunityDescription]);

  // combines description into a single paragraph by removing extra whitespace,
  //  then splitting the cleaned text into sentences using a regular expression
  //  and then joining them.
  const cleanedSentences = community.description?.trim().replace(/\s+/g, ' ');
  const formattedDescription = cleanedSentences?.split(/[.!?]\s+/).join(' ');

  const displayName = community.name || truncateAddress(community.contractAddress?.address ?? '');

  return (
    <View className="mb-2">
      <View className="flex flex-row space-x-2 items-center">
        <CommunityProfilePicture communityRef={community} size="xxl" />
        <GalleryTouchableOpacity
          className="flex-1"
          onPress={handlePress}
          eventElementId="Community Header"
          eventName="Community Header Press"
          eventContext={contexts.Community}
          disabled={!hasCommunityDescription}
        >
          <View>
            <Typography
              font={{ family: 'ABCDiatype', weight: 'Bold' }}
              className="text-lg leading-5 mb-1"
            >
              {displayName}
            </Typography>

            {formattedDescription && <Markdown numberOfLines={3}>{formattedDescription}</Markdown>}
          </View>
        </GalleryTouchableOpacity>
      </View>
      <CommunityBottomSheet ref={bottomSheetRef} communityRef={community} />
    </View>
  );
}
