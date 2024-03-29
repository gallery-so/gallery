import { useBottomSheetDynamicSnapPoints } from '@gorhom/bottom-sheet';
import { ForwardedRef, forwardRef, useCallback, useRef } from 'react';
import { StyleSheet, View } from 'react-native';

import { contexts } from '~/shared/analytics/constants';

import { Button } from '../Button';
import {
  GalleryBottomSheetModal,
  GalleryBottomSheetModalType,
} from '../GalleryBottomSheet/GalleryBottomSheetModal';
import { Markdown } from '../Markdown';
import { useSafeAreaPadding } from '../SafeAreaViewWithPadding';
import { Typography } from '../Typography';

const SNAP_POINTS = ['CONTENT_HEIGHT'];

type Props = {
  title: string;
  description: string;
};

const markdownStyles = StyleSheet.create({
  paragraph: {
    marginBottom: 0,
  },
  body: {
    fontSize: 18,
  },
  strong: {
    fontFamily: 'ABCDiatypeBold',
  },
});

function BadgeProfileBottomSheet(
  { title, description }: Props,
  ref: ForwardedRef<GalleryBottomSheetModalType>
) {
  const { bottom } = useSafeAreaPadding();

  const bottomSheetRef = useRef<GalleryBottomSheetModalType | null>(null);

  const { animatedHandleHeight, animatedSnapPoints, animatedContentHeight, handleContentLayout } =
    useBottomSheetDynamicSnapPoints(SNAP_POINTS);

  const handleClose = useCallback(() => {
    bottomSheetRef.current?.dismiss();
  }, []);

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
      snapPoints={animatedSnapPoints}
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
            {title}
          </Typography>
          {description && (
            <Typography
              className="text-lg text-black-900 dark:text-offWhite"
              font={{ family: 'ABCDiatype', weight: 'Regular' }}
            >
              <Markdown style={markdownStyles}>{description}</Markdown>
            </Typography>
          )}
        </View>

        <Button
          onPress={handleClose}
          text="CLOSE"
          eventElementId="Close badge details"
          eventName="Close badge"
          eventContext={contexts.Badge}
          variant="secondary"
        />
      </View>
    </GalleryBottomSheetModal>
  );
}

const ForwardedBadgeProfileBottomSheet = forwardRef(BadgeProfileBottomSheet);

export { ForwardedBadgeProfileBottomSheet as BadgeProfileBottomSheet };
