import { BottomSheetBackdrop, BottomSheetModal } from '@gorhom/bottom-sheet';
import { useEffect, useMemo, useRef } from 'react';
import { useColorScheme, View } from 'react-native';

import colors from '~/shared/theme/colors';

import { Typography } from './Typography';

type Props = {
  username?: string;
};

export function WelcomeToBeta({ username }: Props) {
  const colorScheme = useColorScheme();
  const snapPoints = useMemo(() => ['50%'], []);
  const bottomSheetRef = useRef<BottomSheetModal>(null);
  useEffect(() => bottomSheetRef.current?.present(), []);

  return (
    <BottomSheetModal
      ref={bottomSheetRef}
      index={0}
      snapPoints={snapPoints}
      backdropComponent={({ animatedIndex, ...props }) => (
        <BottomSheetBackdrop
          {...props}
          animatedIndex={animatedIndex}
          appearsOnIndex={0}
          disappearsOnIndex={-1}
          opacity={0.3}
        />
      )}
      handleIndicatorStyle={{
        backgroundColor: colorScheme === 'dark' ? colors.shadow : colors.porcelain,
        width: 80,
      }}
      backgroundStyle={{
        backgroundColor: colorScheme === 'dark' ? colors.offBlack : colors.white,
      }}
    >
      <View className="flex flex-column space-y-2 mx-4 mt-2">
        <Typography className="text-xl" font={{ family: 'ABCDiatype', weight: 'Bold' }}>
          Welcome, {username}.
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
    </BottomSheetModal>
  );
}
