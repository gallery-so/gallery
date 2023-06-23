import { useBottomSheetDynamicSnapPoints } from '@gorhom/bottom-sheet';
import { View } from 'react-native';
import { useFragment } from 'react-relay';
import { graphql } from 'relay-runtime';

import { PfpBottomSheetFragment$key } from '~/generated/PfpBottomSheetFragment.graphql';

import { GalleryBottomSheetModal } from '../GalleryBottomSheet/GalleryBottomSheetModal';
import { useSafeAreaPadding } from '../SafeAreaViewWithPadding';
import { Typography } from '../Typography';

const SNAP_POINTS = [0, 'CONTENT_HEIGHT'];

type PfpBottomSheetProps = {
  queryRef: PfpBottomSheetFragment$key;
};

export function PfpBottomSheet({ queryRef }: PfpBottomSheetProps) {
  const query = useFragment(
    graphql`
      fragment PfpBottomSheetFragment on Query {
        viewer {
          ... on Viewer {
            __typename
          }
        }
      }
    `,
    queryRef
  );

  const { bottom } = useSafeAreaPadding();
  const { animatedHandleHeight, animatedSnapPoints, animatedContentHeight, handleContentLayout } =
    useBottomSheetDynamicSnapPoints(SNAP_POINTS);

  return (
    <GalleryBottomSheetModal
      snapPoints={animatedSnapPoints}
      handleHeight={animatedHandleHeight}
      contentHeight={animatedContentHeight}
    >
      <View
        onLayout={handleContentLayout}
        style={{ paddingBottom: bottom }}
        className="px-8 flex flex-col space-y-8"
      >
        <Typography font={{ family: 'ABCDiatype', weight: 'Bold' }}>Profile picture</Typography>
      </View>
    </GalleryBottomSheetModal>
  );
}
