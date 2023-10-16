import { useBottomSheetDynamicSnapPoints } from '@gorhom/bottom-sheet';
import { useNavigation } from '@react-navigation/native';
import { ForwardedRef, forwardRef, useCallback, useRef } from 'react';
import { View } from 'react-native';

import { contexts } from '~/shared/analytics/constants';

import { Button } from '../Button';
import {
  GalleryBottomSheetModal,
  GalleryBottomSheetModalType,
} from '../GalleryBottomSheet/GalleryBottomSheetModal';
import { useSafeAreaPadding } from '../SafeAreaViewWithPadding';
import { Typography } from '../Typography';

const SNAP_POINTS = ['CONTENT_HEIGHT'];

// eslint-disable-next-line @typescript-eslint/ban-types
type Props = {};

function WarningPostBottomSheet(props: Props, ref: ForwardedRef<GalleryBottomSheetModalType>) {
  const navigation = useNavigation();

  const { bottom } = useSafeAreaPadding();

  const bottomSheetRef = useRef<GalleryBottomSheetModalType | null>(null);

  const { animatedHandleHeight, animatedSnapPoints, animatedContentHeight, handleContentLayout } =
    useBottomSheetDynamicSnapPoints(SNAP_POINTS);

  const handleBack = useCallback(() => {
    bottomSheetRef.current?.dismiss();
    navigation.goBack();
  }, [navigation]);

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
            Are you sure?
          </Typography>
          <Typography
            className="text-lg text-black-900 dark:text-offWhite"
            font={{ family: 'ABCDiatype', weight: 'Regular' }}
          >
            If you go back now, this post will be discarded.
          </Typography>
        </View>

        <Button
          onPress={handleBack}
          text="DISCARD POST"
          eventElementId="Discard Post Button"
          eventName="Discard Post"
          eventContext={contexts.Posts}
        />
      </View>
    </GalleryBottomSheetModal>
  );
}

const ForwardedWarningPostBottomSheet = forwardRef(WarningPostBottomSheet);

export { ForwardedWarningPostBottomSheet as WarningPostBottomSheet };
