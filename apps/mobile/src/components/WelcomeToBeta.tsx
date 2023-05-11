import { useEffect, useMemo, useRef } from 'react';
import { View } from 'react-native';

import {
  GalleryBottomSheetModal,
  GalleryBottomSheetModalType,
} from './GalleryBottomSheet/GalleryBottomSheetModal';
import { Typography } from './Typography';

type Props = {
  username: string;
};

export function WelcomeToBeta({ username }: Props) {
  const snapPoints = useMemo(() => ['50%'], []);
  const bottomSheetRef = useRef<GalleryBottomSheetModalType>(null);
  useEffect(() => bottomSheetRef.current?.present(), []);

  const capitalizedUsername = useMemo(() => {
    return username.charAt(0).toUpperCase() + username.slice(1);
  }, [username]);

  return (
    <GalleryBottomSheetModal ref={bottomSheetRef} index={0} snapPoints={snapPoints}>
      <View className="flex flex-column space-y-2 mx-4 mt-2">
        <Typography className="text-xl" font={{ family: 'ABCDiatype', weight: 'Bold' }}>
          Welcome, {capitalizedUsername}.
        </Typography>
        <Typography font={{ family: 'ABCDiatype', weight: 'Regular' }}>
          Thank you for trying the Gallery mobile app.
        </Typography>
        <Typography font={{ family: 'ABCDiatype', weight: 'Regular' }}>
          Just a heads up: our app is still in beta. We're going to keep iterating and polishing to
          make it shine.
        </Typography>
        <Typography font={{ family: 'ABCDiatype', weight: 'Regular' }}>
          Your feedback is super valuable to us so if there's something you'd love to see, or any
          rough edges you spot, please let us know.
        </Typography>
        <Typography font={{ family: 'ABCDiatype', weight: 'Regular' }}>
          We're thrilled to have you here, helping shape the app's future. Thank you for joining us
          and for your patience as we refine and perfect your experience.
        </Typography>
        <Typography
          style={{ textAlign: 'center', paddingTop: 16 }}
          font={{ family: 'ABCDiatype', weight: 'Regular' }}
        >
          The Gallery Team
        </Typography>
      </View>
    </GalleryBottomSheetModal>
  );
}
