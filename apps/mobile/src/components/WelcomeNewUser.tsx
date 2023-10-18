import { useEffect, useMemo, useRef } from 'react';
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
};

export function WelcomeNewUser({ username }: Props) {
  const snapPoints = useMemo(() => [360], []);
  const bottomSheetRef = useRef<GalleryBottomSheetModalType>(null);
  useEffect(() => bottomSheetRef.current?.present(), []);

  return (
    <GalleryBottomSheetModal ref={bottomSheetRef} index={0} snapPoints={snapPoints}>
      <View className="flex flex-column space-y-8 mx-4 mt-2">
        <View className="space-y-6">
          <View>
            <Typography
              className="text-3xl text-center"
              font={{ family: 'GTAlpina', weight: 'StandardLight' }}
            >
              Welcome to your feed,
            </Typography>
            <Typography
              className="text-3xl text-center"
              font={{ family: 'GTAlpina', weight: 'StandardLight' }}
            >
              {username}!
            </Typography>
          </View>
          <Typography className="text-center" font={{ family: 'ABCDiatype', weight: 'Regular' }}>
            This is where you'll see what people are collecting, creating and sharing. Choose 'For
            You' for tailored content or 'Following' to see what your connections are up to!
          </Typography>
        </View>

        <Button
          onPress={() => bottomSheetRef.current?.dismiss()}
          text="continue"
          eventElementId="welcome-bottom-sheet-continue"
          eventName="welcome-bottom-sheet-continue"
          eventContext={contexts.Onboarding}
        />
      </View>
    </GalleryBottomSheetModal>
  );
}
