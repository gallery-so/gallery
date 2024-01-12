import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import * as Notifications from 'expo-notifications';
import { ForwardedRef, forwardRef, useCallback, useEffect, useState } from 'react';
import { View } from 'react-native';
import { MARFA_2023_SUBMITTED_FORM_KEY } from 'src/constants/storageKeys';

import {
  GalleryBottomSheetModal,
  GalleryBottomSheetModalType,
} from '~/components/GalleryBottomSheet/GalleryBottomSheetModal';
import { Typography } from '~/components/Typography';

import { Button } from '../../components/Button';

const snapPoints = ['35%'];

// eslint-disable-next-line @typescript-eslint/ban-types
type Props = {};

function DebugBottomSheet(props: Props, ref: ForwardedRef<GalleryBottomSheetModalType>) {
  const [expoPushToken, setExpoPushToken] = useState<string>('');

  useEffect(() => {
    const getToken = async () => {
      const token = await Notifications.getExpoPushTokenAsync({
        projectId: Constants.expoConfig?.extra?.eas.projectId,
      });
      setExpoPushToken(token.data);
    };
    getToken();
  }, []);

  const handleClearStorage = useCallback(() => {
    AsyncStorage.multiRemove([MARFA_2023_SUBMITTED_FORM_KEY]);
  }, []);

  return (
    <GalleryBottomSheetModal ref={ref} index={0} snapPoints={snapPoints}>
      <View className="flex flex-column space-y-1 mx-4">
        <Typography font={{ family: 'ABCDiatype', weight: 'Bold' }}>Push Token</Typography>
        <Typography font={{ family: 'ABCDiatype', weight: 'Regular' }}>{expoPushToken}</Typography>
        <Button
          text="Clear Local Storage"
          onPress={handleClearStorage}
          eventElementId={null}
          eventName={null}
          eventContext={null}
        />
      </View>
    </GalleryBottomSheetModal>
  );
}

const ForwardedDebugBottomSheet = forwardRef<GalleryBottomSheetModalType, Props>(DebugBottomSheet);

export { ForwardedDebugBottomSheet as DebugBottomSheet };
