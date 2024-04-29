import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import * as Notifications from 'expo-notifications';
import { useCallback, useEffect, useState } from 'react';
import React from 'react';
import { View } from 'react-native';
import { MARFA_2023_SUBMITTED_FORM_KEY, MCHX_CLAIM_CODE_KEY } from 'src/constants/storageKeys';

import { Button } from '~/components/Button';
import { Typography } from '~/components/Typography';

export default function DebugBottomSheetModal() {
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
    AsyncStorage.multiRemove([
      MARFA_2023_SUBMITTED_FORM_KEY,
      MCHX_CLAIM_CODE_KEY,
      `hasSeenAnnouncement-oxen-farcon-2024`,
      `hasDismissedAnnouncement-oxen-farcon-2024`,
    ]);
  }, []);
  return (
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
  );
}
