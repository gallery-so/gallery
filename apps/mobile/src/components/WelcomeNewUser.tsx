import { BlurView } from 'expo-blur';
import { useCallback, useEffect, useMemo, useRef } from 'react';
import { View } from 'react-native';

import { contexts } from '~/shared/analytics/constants';

import { Button } from './Button';
import {
  GalleryBottomSheetModal,
  GalleryBottomSheetModalType,
} from './GalleryBottomSheet/GalleryBottomSheetModal';
import { Typography } from './Typography';

type Props = {
  username: string;
  onContinue: () => void;
};

export function WelcomeNewUser({ username, onContinue }: Props) {
  const snapPoints = useMemo(() => [360], []);
  const bottomSheetRef = useRef<GalleryBottomSheetModalType>(null);
  useEffect(() => bottomSheetRef.current?.present(), []);

  const handleContinue = useCallback(() => {
    bottomSheetRef.current?.dismiss();
    onContinue();
  }, [onContinue]);

  return (
    <GalleryBottomSheetModal
      ref={bottomSheetRef}
      index={0}
      snapPoints={snapPoints}
      backdropComponent={BackdropComponent}
    >
      <View className="flex flex-column space-y-8 mx-4 mt-2">
        <View className="space-y-6">
          <View>
            <Typography
              className="text-3xl text-center"
              font={{ family: 'GTAlpina', weight: 'StandardLight' }}
            >
              Welcome to Gallery,
            </Typography>
            <Typography
              className="text-3xl text-center"
              font={{ family: 'GTAlpina', weight: 'StandardLight' }}
            >
              {username}!
            </Typography>
          </View>
          <Typography className="text-center" font={{ family: 'ABCDiatype', weight: 'Regular' }}>
            This is where you’ll see updates from other Gallery users. Toggle between your
            personalized For 'You feed' and the 'Following' feed, showing the latest updates from
            your connections
          </Typography>
        </View>

        <Button
          onPress={handleContinue}
          text="continue"
          eventElementId="Welcome New User Bottom Sheet"
          eventName="Welcome New User Continue Clicked"
          eventContext={contexts.Onboarding}
        />
      </View>
    </GalleryBottomSheetModal>
  );
}

function BackdropComponent() {
  return <BlurView intensity={4} className="absolute h-full w-full top-0 bg-black/50 "></BlurView>;
}
