import { useBottomSheetDynamicSnapPoints } from '@gorhom/bottom-sheet';
import { useNavigation } from '@react-navigation/native';
import { ForwardedRef, forwardRef, useCallback, useRef, Linking } from 'react';
import { View } from 'react-native';

import { Button } from '../../Button';
import {
  GalleryBottomSheetModal,
  GalleryBottomSheetModalType,
} from '../../GalleryBottomSheet/GalleryBottomSheetModal';
import { useSafeAreaPadding } from '../../SafeAreaViewWithPadding';
import { Typography } from '../../Typography';

const SNAP_POINTS = ['CONTENT_HEIGHT'];

// eslint-disable-next-line @typescript-eslint/ban-types
type Props = {
  url: string;
};

function WarningLinkBottomSheet(props: Props, ref: ForwardedRef<GalleryBottomSheetModalType>) {
  const { bottom } = useSafeAreaPadding();

  const bottomSheetRef = useRef<GalleryBottomSheetModalType | null>(null);

  const { animatedHandleHeight, animatedSnapPoints, animatedContentHeight, handleContentLayout } =
    useBottomSheetDynamicSnapPoints(SNAP_POINTS);

  const handleCancel = () => bottomSheetRef.current?.dismiss();

  const handleOpen = () => Linking.openURL(props.url);

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
            Leaving gallery.so
          </Typography>
          <Typography
            className="text-lg text-black-900 dark:text-offWhite"
            font={{ family: 'ABCDiatype', weight: 'Regular' }}
          >
            Confirm that you are going to{' '}
            <Typography font={{ family: 'ABCDiatype', weight: 'Bold' }}>{props.url}</Typography>
          </Typography>
        </View>

        <Button
          variant="secondary"
          onPress={handleCancel}
          text="CANCEL"
          eventElementId={null}
          eventName={null}
        />
        <Button onPress={handleOpen} text="OPEN" eventElementId={null} eventName={null} />
      </View>
    </GalleryBottomSheetModal>
  );
}

const ForwardedWarningLinkBottomSheet = forwardRef(WarningLinkBottomSheet);

export { ForwardedWarningLinkBottomSheet as WarningLinkBottomSheet };
