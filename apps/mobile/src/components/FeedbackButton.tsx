import React, { useCallback, useMemo, useRef } from 'react';
import { Linking, View } from 'react-native';
import { TouchableOpacity } from 'react-native-gesture-handler';
import { ChatIcon } from 'src/icons/ChatIcon';

import {
  GalleryBottomSheetModal,
  GalleryBottomSheetModalType,
} from '~/components/GalleryBottomSheet/GalleryBottomSheetModal';

import { Button } from './Button';
import { Typography } from './Typography';

const FEEDBACK_FORM_URL =
  'https://docs.google.com/forms/d/1jHf7BrfdcO507YUlcfpT94XkgDLAi7slOW-uGUb0o34';

export function FeedbackButton() {
  const snapPoints = useMemo(() => ['35%'], []);
  const bottomSheetRef = useRef<GalleryBottomSheetModalType>(null);

  const handleOpenSheet = useCallback(() => {
    bottomSheetRef.current?.present();
  }, []);

  const handleOpenForm = useCallback(() => {
    Linking.openURL(FEEDBACK_FORM_URL);
  }, []);

  return (
    <>
      <View className="flex flex-row space-x-4 h-full items-center">
        <TouchableOpacity onPress={handleOpenSheet}>
          <ChatIcon width={20} height={20} />
        </TouchableOpacity>
      </View>
      <GalleryBottomSheetModal ref={bottomSheetRef} index={0} snapPoints={snapPoints}>
        <View className="flex flex-column space-y-2 mx-4">
          <Typography className="text-xl" font={{ family: 'ABCDiatype', weight: 'Bold' }}>
            Got Feedback?
          </Typography>
          <Typography font={{ family: 'ABCDiatype', weight: 'Regular' }}>
            Thanks for trying the Beta!
          </Typography>
          <Typography font={{ family: 'ABCDiatype', weight: 'Regular' }}>
            Please share your thoughts, suggestions, feature requests or any issues you've
            encountered.
          </Typography>
          <Typography font={{ family: 'ABCDiatype', weight: 'Regular' }}>
            Your feedback will help shape the future of the app.
          </Typography>
          <View className="flex pt-4 w-full  content-center justify-center">
            <Button text="Open Feedback Form" onPress={handleOpenForm} />
          </View>
        </View>
      </GalleryBottomSheetModal>
    </>
  );
}
