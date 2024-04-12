import { useCallback } from 'react';
import { View } from 'react-native';
import { graphql, useFragment } from 'react-relay';
import { EditPencilIcon } from 'src/icons/EditPencilIcon';

import { useBottomSheetModalActions } from '~/contexts/BottomSheetModalContext';
import { CommunityHeaderFragment$key } from '~/generated/CommunityHeaderFragment.graphql';
import { CommunityHeaderQueryFragment$key } from '~/generated/CommunityHeaderQueryFragment.graphql';
import { contexts } from '~/shared/analytics/constants';
import { extractRelevantMetadataFromCommunity } from '~/shared/utils/extractRelevantMetadataFromCommunity';
import { truncateAddress } from '~/shared/utils/wallet';

import { GalleryTouchableOpacity } from '../GalleryTouchableOpacity';
import { Markdown } from '../Markdown';
import { CommunityProfilePicture } from '../ProfilePicture/CommunityProfilePicture';
import { Typography } from '../Typography';
import { CommunityBottomSheet } from './CommunityBottomSheet';
import CommunityMetadataFormBottomSheet from './CommunityMetadataFormBottomSheet';

type Props = {
  communityRef: CommunityHeaderFragment$key;
  queryRef: CommunityHeaderQueryFragment$key;
};
export function CommunityHeader({ communityRef, queryRef }: Props) {
  const community = useFragment(
    graphql`
      fragment CommunityHeaderFragment on Community {
        name
        description
        ...CommunityProfilePictureFragment
        ...CommunityBottomSheetFragment
        ...extractRelevantMetadataFromCommunityFragment
        ...CommunityMetadataFormBottomSheetFragment
      }
    `,
    communityRef
  );

  const query = useFragment(
    graphql`
      fragment CommunityHeaderQueryFragment on Query {
        ...CommunityMetadataFormBottomSheetQueryFragment
      }
    `,
    queryRef
  );

  const hasCommunityDescription = Boolean(community.description);

  const { showBottomSheetModal } = useBottomSheetModalActions();
  const handlePress = useCallback(() => {
    if (!hasCommunityDescription) return;

    showBottomSheetModal({
      content: <CommunityBottomSheet communityRef={community} />,
    });
  }, [community, hasCommunityDescription, showBottomSheetModal]);

  // combines description into a single paragraph by removing extra whitespace,
  //  then splitting the cleaned text into sentences using a regular expression
  //  and then joining them.
  const cleanedSentences = community.description?.trim().replace(/\s+/g, ' ');
  const formattedDescription = cleanedSentences?.split(/[.!?]\s+/).join(' ');

  const { contractAddress } = extractRelevantMetadataFromCommunity(community);

  const displayName = community.name || truncateAddress(contractAddress);

  const handleEditPress = useCallback(() => {
    showBottomSheetModal({
      content: <CommunityMetadataFormBottomSheet communityRef={community} queryRef={query} />,
    });
  }, [community, query, showBottomSheetModal]);

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
            <GalleryTouchableOpacity
              onPress={handleEditPress}
              eventElementId="Community Header Edit Button"
              eventName="Community Header Edit Button Press"
              eventContext={contexts.Community}
              className="flex-row gap-1 items-center mb-1"
            >
              <Typography font={{ family: 'ABCDiatype', weight: 'Bold' }} className="text-lg">
                {displayName}
              </Typography>
              <View className="bg-faint h-4 w-4 rounded-full items-center justify-center">
                <EditPencilIcon width={10} />
              </View>
            </GalleryTouchableOpacity>
            {formattedDescription && <Markdown numberOfLines={3}>{formattedDescription}</Markdown>}
          </View>
        </GalleryTouchableOpacity>
      </View>
    </View>
  );
}
