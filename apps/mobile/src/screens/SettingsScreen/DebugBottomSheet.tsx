import * as Notifications from 'expo-notifications';
import { ForwardedRef, forwardRef, useEffect, useState } from 'react';
import { View } from 'react-native';

import {
  GalleryBottomSheetModal,
  GalleryBottomSheetModalType,
} from '~/components/GalleryBottomSheet/GalleryBottomSheetModal';
import { Typography } from '~/components/Typography';

const snapPoints = ['35%'];

// eslint-disable-next-line @typescript-eslint/ban-types
type Props = {};

function DebugBottomSheet(props: Props, ref: ForwardedRef<GalleryBottomSheetModalType>) {
  const [expoPushToken, setExpoPushToken] = useState<string>('');

  useEffect(() => {
    const getToken = async () => {
      const token = await Notifications.getExpoPushTokenAsync();
      setExpoPushToken(token.data);
    };
    getToken();
  }, []);

  return (
    <GalleryBottomSheetModal ref={ref} index={0} snapPoints={snapPoints}>
      <View className="flex flex-column space-y-1 mx-4">
        <Typography font={{ family: 'ABCDiatype', weight: 'Bold' }}>Push Token</Typography>
        <Typography font={{ family: 'ABCDiatype', weight: 'Regular' }}>{expoPushToken}</Typography>
      </View>
    </GalleryBottomSheetModal>
  );
}

const ForwardedDebugBottomSheet = forwardRef<GalleryBottomSheetModalType, Props>(DebugBottomSheet);

export { ForwardedDebugBottomSheet as DebugBottomSheet };
