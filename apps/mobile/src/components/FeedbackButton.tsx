import React, { useCallback, useRef } from 'react';
import { View } from 'react-native';

import { FeedbackBottomSheet } from '~/components/FeedbackBottomSheet';
import { GalleryBottomSheetModalType } from '~/components/GalleryBottomSheet/GalleryBottomSheetModal';

import { BugReportIcon } from '../icons/BugReportIcon';
import { GalleryTouchableOpacity } from './GalleryTouchableOpacity';

export function FeedbackButton() {
  const bottomSheetRef = useRef<GalleryBottomSheetModalType>(null);

  const handleOpenSheet = useCallback(() => {
    bottomSheetRef.current?.present();
  }, []);

  return (
    <>
      <View className="flex flex-row space-x-4 h-full items-center">
        <GalleryTouchableOpacity
          eventElementId={null}
          eventName={null}
          eventContext={null}
          onPress={handleOpenSheet}
        >
          <BugReportIcon width={24} height={24} />
        </GalleryTouchableOpacity>

        <FeedbackBottomSheet ref={bottomSheetRef} />
      </View>
    </>
  );
}
