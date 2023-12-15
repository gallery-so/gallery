import { useBottomSheetDynamicSnapPoints } from '@gorhom/bottom-sheet';
import { ForwardedRef, forwardRef, useCallback, useRef } from 'react';
import { Linking, View } from 'react-native';

import { contexts } from '~/shared/analytics/constants';

import { Button } from '../Button';
import {
  GalleryBottomSheetModal,
  GalleryBottomSheetModalType,
} from '../GalleryBottomSheet/GalleryBottomSheetModal';
import { GalleryTouchableOpacity } from '../GalleryTouchableOpacity';
import { useSafeAreaPadding } from '../SafeAreaViewWithPadding';
import { Typography } from '../Typography';

const SNAP_POINTS = ['CONTENT_HEIGHT'];

// eslint-disable-next-line @typescript-eslint/ban-types
type Props = {};

function SupportedMintLinkBottomSheet(
  props: Props,
  ref: ForwardedRef<GalleryBottomSheetModalType>
) {
  const { bottom } = useSafeAreaPadding();

  const bottomSheetRef = useRef<GalleryBottomSheetModalType | null>(null);

  const { animatedHandleHeight, animatedSnapPoints, animatedContentHeight, handleContentLayout } =
    useBottomSheetDynamicSnapPoints(SNAP_POINTS);

  const handleClose = useCallback(() => {
    bottomSheetRef.current?.dismiss();
  }, []);

  const handlePress = useCallback(() => {
    Linking.openURL(
      'https://gallery-so.notion.site/Supported-Mint-Link-Domains-b4420f096413498d8aa24d857561817b'
    );
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
            Mint links
          </Typography>
          <Typography
            className="text-lg text-black-900 dark:text-offWhite"
            font={{ family: 'ABCDiatype', weight: 'Regular' }}
          >
            Gallery automatically adds your primary wallet address in mint links, ensuring you get
            100% of referral rewards on supported platforms.
          </Typography>
          <Typography
            className="text-lg text-black-900 dark:text-offWhite"
            font={{ family: 'ABCDiatype', weight: 'Regular' }}
          >
            View our supported platforms{' '}
            <GalleryTouchableOpacity
              onPress={handlePress}
              eventElementId="Supported Mint Link Bottom Sheet"
              eventName="Press Supported Mint Link Bottom Sheet"
              eventContext={contexts.Posts}
              withoutFeedback
            >
              <Typography
                className="text-lg text-black-900 dark:text-offWhite"
                font={{ family: 'ABCDiatype', weight: 'Bold' }}
              >
                here
              </Typography>
            </GalleryTouchableOpacity>
            .
          </Typography>
        </View>

        <Button
          onPress={handleClose}
          text="close"
          eventElementId="Close Supported Mint Link Bottom Sheet"
          eventName="Close Supported Mint Link Bottom Sheet"
          eventContext={contexts.Posts}
        />
      </View>
    </GalleryBottomSheetModal>
  );
}

const ForwardedSupportedMintLinkBottomSheet = forwardRef(SupportedMintLinkBottomSheet);

export { ForwardedSupportedMintLinkBottomSheet as SupportedMintLinkBottomSheet };
