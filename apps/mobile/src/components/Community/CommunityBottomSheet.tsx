import { useBottomSheetDynamicSnapPoints } from '@gorhom/bottom-sheet';
import { ForwardedRef, forwardRef, useRef } from 'react';
import { View } from 'react-native';
import { graphql, useFragment } from 'react-relay';

import { CommunityBottomSheetFragment$key } from '~/generated/CommunityBottomSheetFragment.graphql';

import {
  GalleryBottomSheetModal,
  GalleryBottomSheetModalType,
} from '../GalleryBottomSheet/GalleryBottomSheetModal';
import { Markdown } from '../Markdown';
import { useSafeAreaPadding } from '../SafeAreaViewWithPadding';
import { Typography } from '../Typography';

const SNAP_POINTS = ['CONTENT_HEIGHT'];

const markdownStyles = {
  paragraph: {
    marginBottom: 16,
  },
};

type Props = {
  communityRef: CommunityBottomSheetFragment$key;
};

function CommunityBottomSheet(
  { communityRef }: Props,
  ref: ForwardedRef<GalleryBottomSheetModalType>
) {
  const community = useFragment(
    graphql`
      fragment CommunityBottomSheetFragment on Community {
        name
        description
      }
    `,
    communityRef
  );

  const { bottom } = useSafeAreaPadding();

  const bottomSheetRef = useRef<GalleryBottomSheetModalType | null>(null);

  const { animatedHandleHeight, animatedSnapPoints, animatedContentHeight, handleContentLayout } =
    useBottomSheetDynamicSnapPoints(SNAP_POINTS);

  return (
    <GalleryBottomSheetModal
      ref={(value) => {
        bottomSheetRef.current = value;

        if (typeof ref === 'function') {
          ref(value);
        } else if (ref) {
          ref.current = value;
        }
      }}
      snapPoints={animatedSnapPoints.value}
      handleHeight={animatedHandleHeight}
      contentHeight={animatedContentHeight}
    >
      <View
        onLayout={handleContentLayout}
        style={{ paddingBottom: bottom }}
        className="p-4 flex flex-col space-y-6"
      >
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
    </GalleryBottomSheetModal>
  );
}

const ForwardedCommunityBottomSheet = forwardRef(CommunityBottomSheet);

export { ForwardedCommunityBottomSheet as CommunityBottomSheet };
