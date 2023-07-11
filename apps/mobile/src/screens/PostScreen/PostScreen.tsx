import { useCallback, useRef } from 'react';
import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { BackButton } from '~/components/BackButton';
import { GalleryBottomSheetModalType } from '~/components/GalleryBottomSheet/GalleryBottomSheetModal';
import { GalleryTouchableOpacity } from '~/components/GalleryTouchableOpacity';
import { PostInput } from '~/components/Post/PostInput';
import { PostTokenPreview } from '~/components/Post/PostTokenPreview';
import { WarningPostBottomSheet } from '~/components/Post/WarningPostBottomSheet';
import { Typography } from '~/components/Typography';

export function PostScreen() {
  const { top } = useSafeAreaInsets();

  const bottomSheetRef = useRef<GalleryBottomSheetModalType | null>(null);
  const handleBackPress = useCallback(() => {
    bottomSheetRef.current?.present();
  }, []);

  return (
    <View className="flex-1 bg-white dark:bg-black-900" style={{ paddingTop: top }}>
      <View className="flex flex-col flex-grow space-y-8">
        <View className="px-4 relative flex-row items-center justify-between">
          <BackButton onPress={handleBackPress} />

          <View className="flex flex-row justify-center items-center" pointerEvents="none">
            <Typography className="text-sm" font={{ family: 'ABCDiatype', weight: 'Bold' }}>
              New post
            </Typography>
          </View>

          <GalleryTouchableOpacity onPress={() => {}} eventElementId={null} eventName={null}>
            <Typography
              className="text-sm text-activeBlue"
              font={{
                family: 'ABCDiatype',
                weight: 'Bold',
              }}
            >
              POST
            </Typography>
          </GalleryTouchableOpacity>
        </View>

        <View className="px-4 flex flex-col flex-grow space-y-2">
          <PostInput />

          <View className="py-4">
            <PostTokenPreview bottomSheetRef={bottomSheetRef} />
          </View>
        </View>
      </View>

      <WarningPostBottomSheet ref={bottomSheetRef} />
    </View>
  );
}
