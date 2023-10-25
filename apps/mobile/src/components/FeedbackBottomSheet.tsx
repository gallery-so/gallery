import Constants from 'expo-constants';
import React, { ForwardedRef, forwardRef, useCallback } from 'react';
import { Linking, View } from 'react-native';

import { Button } from '~/components/Button';
import {
  GalleryBottomSheetModal,
  GalleryBottomSheetModalType,
} from '~/components/GalleryBottomSheet/GalleryBottomSheetModal';
import { Typography } from '~/components/Typography';

const snapPoints = ['35%'];

// eslint-disable-next-line @typescript-eslint/ban-types
type Props = {};

const appVersion = Constants.expoConfig?.version;
const commitHash = Constants.expoConfig?.extra?.commitHash;
const FEEDBACK_FORM_URL = `https://docs.google.com/forms/d/e/1FAIpQLScEG3M1-R5BLcmK-hiaDhaUC_QybtiYZBh1op0KX5wK-8H--w/viewform?usp=pp_url&entry.2078886577=${appVersion}&entry.1683794134=${commitHash}`;

function FeedbackBottomSheet(props: Props, ref: ForwardedRef<GalleryBottomSheetModalType>) {
  const handleOpenForm = useCallback(() => {
    Linking.openURL(FEEDBACK_FORM_URL);
  }, []);

  return (
    <GalleryBottomSheetModal ref={ref} index={0} snapPoints={snapPoints}>
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
          <Button
            eventElementId={null}
            eventName={null}
            eventContext={null}
            text="Open Feedback Form"
            onPress={handleOpenForm}
          />
        </View>
      </View>
    </GalleryBottomSheetModal>
  );
}

const ForwardedFeedbackBottomSheet = forwardRef<GalleryBottomSheetModalType, Props>(
  FeedbackBottomSheet
);

export { ForwardedFeedbackBottomSheet as FeedbackBottomSheet };
