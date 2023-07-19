import { useBottomSheetDynamicSnapPoints } from '@gorhom/bottom-sheet';
import { useNavigation } from '@react-navigation/native';
import { ForwardedRef, forwardRef, useCallback, useRef } from 'react';
import { View } from 'react-native';

import { Button } from '~/components/Button';
import {
  GalleryBottomSheetModal,
  GalleryBottomSheetModalType,
} from '~/components/GalleryBottomSheet/GalleryBottomSheetModal';
import { useSafeAreaPadding } from '~/components/SafeAreaViewWithPadding';
import { Typography } from '~/components/Typography';

const SNAP_POINTS = ['CONTENT_HEIGHT'];

// eslint-disable-next-line @typescript-eslint/ban-types
type Props = {};

function DeletePostBottomSheet(props: Props, ref: ForwardedRef<GalleryBottomSheetModalType>) {
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
            Delete the post
          </Typography>
          <Typography
            className="text-lg text-black-900 dark:text-offWhite"
            font={{ family: 'ABCDiatype', weight: 'Regular' }}
          >
            Are you sure you want to delete this post?
          </Typography>
        </View>

        <View className="space-y-2">
          <Button onPress={handleBack} text="DELETE" eventElementId={null} eventName={null} />
          <Button
            onPress={handleBack}
            variant="secondary"
            text="CANCEL"
            eventElementId={null}
            eventName={null}
          />
        </View>
      </View>
    </GalleryBottomSheetModal>
  );
}

const ForwardedDeletePostBottomSheet = forwardRef(DeletePostBottomSheet);

export { ForwardedDeletePostBottomSheet as DeletePostBottomSheet };
