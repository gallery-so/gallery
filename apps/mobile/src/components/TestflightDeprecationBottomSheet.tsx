import { useCallback, useRef } from 'react';
import { Linking, View } from 'react-native';
import { useEffectOnAppForeground } from 'src/utils/useEffectOnAppForeground';

import { contexts } from '~/shared/analytics/constants';

import { Button } from './Button';
import {
  GalleryBottomSheetModal,
  GalleryBottomSheetModalType,
} from './GalleryBottomSheet/GalleryBottomSheetModal';
import { Typography } from './Typography';

const SNAP_POINTS = [360];

const APP_STORE_URL = 'https://apps.apple.com/app/gallery/id6447068892';

export function TestflightDeprecationBottomSheet() {
  const bottomSheetRef = useRef<GalleryBottomSheetModalType>(null);

  useEffectOnAppForeground(() => bottomSheetRef.current?.present());

  const handlePress = useCallback(() => {
    // NOTE: this will fail on Simulator because they don't come with App Store installed
    Linking.openURL(APP_STORE_URL);
  }, []);

  return (
    <GalleryBottomSheetModal ref={bottomSheetRef} index={0} snapPoints={SNAP_POINTS}>
      <View className="flex flex-column space-y-8 mx-4 mt-2">
        <View className="space-y-6">
          <View>
            <Typography
              className="text-5xl text-center tracking-[-2px]"
              font={{ family: 'GTAlpina', weight: 'Light' }}
            >
              Gallery is now on the App Store
            </Typography>
          </View>
          <Typography
            className="text-center text-sm"
            font={{ family: 'ABCDiatype', weight: 'Regular' }}
          >
            Thank you for joining us on TestFlight! Our app is now available on the App Store.
            Upgrade to the official version below to stay up to date with the latest features.
          </Typography>
        </View>

        <Button
          onPress={handlePress}
          text="Upgrade  🎉"
          eventElementId="Upgrade From TestFlight To App Store Button"
          eventName="Upgrade From TestFlight To App Store"
          eventContext={contexts.Onboarding}
        />
      </View>
    </GalleryBottomSheetModal>
  );
}
