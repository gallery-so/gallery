import AsyncStorage from '@react-native-async-storage/async-storage';
import { useCallback, useEffect, useState } from 'react';
import { View } from 'react-native';
import { contexts } from 'shared/analytics/constants';
import {
  MaintenanceContent,
  useMaintenanceContext,
} from 'shared/contexts/MaintenanceStatusContext';
import { AlertIcon } from 'src/icons/AlertIcon';
import { useEffectOnAppForeground } from 'src/utils/useEffectOnAppForeground';

import { useBottomSheetModalActions } from '~/contexts/BottomSheetModalContext';

import { Button } from './Button';
import { BaseM, TitleL } from './Text';
import { Typography } from './Typography';

export function MaintenanceScreen() {
  const { currentlyActiveMaintenanceNoticeContent } = useMaintenanceContext();

  return (
    <View className="flex-1 bg-white dark:bg-black-900 flex justify-center items-center p-6">
      <Typography className="text-l mb-1" font={{ family: 'ABCDiatype', weight: 'Bold' }}>
        Maintenance in Progress
      </Typography>
      <Typography
        className="text-l text-center leading-6"
        font={{ family: 'ABCDiatype', weight: 'Regular' }}
      >
        {currentlyActiveMaintenanceNoticeContent?.message}
      </Typography>
    </View>
  );
}

export function CheckMaintenanceOnAppForeground() {
  const { fetchMaintenanceModeStatus } = useMaintenanceContext();

  useEffectOnAppForeground(fetchMaintenanceModeStatus);

  return <></>;
}

export function MaintenanceNoticeBottomSheet({ onClose }: { onClose: () => void }) {
  const { upcomingMaintenanceNoticeContent } = useMaintenanceContext();

  const handleContinuePress = useCallback(() => {
    onClose();
  }, [onClose]);

  return (
    <View className="flex items-center space-y-2 ">
      <View className="bg-offWhite rounded-full p-3">
        <AlertIcon color="#000000" width={40} height={40} />
      </View>
      <TitleL classNameOverride="m-4">Upcoming Maintenance</TitleL>
      <BaseM classNameOverride="text-center mb-4">
        {upcomingMaintenanceNoticeContent?.message}
      </BaseM>
      <Button
        className="w-full "
        containerClassName="rounded-none"
        text="continue"
        eventElementId="Maintenance Notice Continue Button"
        eventName="Pressed Maintenance Notice Continue Button"
        eventContext={contexts.Maintenance}
        onPress={handleContinuePress}
      />
    </View>
  );
}

export function MaintenanceNoticeBottomSheetWrapper({
  noticeContent,
}: {
  noticeContent: MaintenanceContent;
}) {
  const [hasSeenNotice, setHasSeenNotice] = useState('loading');

  const { showBottomSheetModal, hideBottomSheetModal } = useBottomSheetModalActions();
  const handleBottomSheetClose = useCallback(() => {
    AsyncStorage.setItem(noticeContent.id, 'true');
  }, [noticeContent.id]);

  useEffect(() => {
    const getNoticeStatus = async () => {
      try {
        const seen = await AsyncStorage.getItem(noticeContent.id);

        setHasSeenNotice(seen === 'true' ? 'true' : 'false');
      } catch (error) {}
    };

    getNoticeStatus();
  });

  useEffect(() => {
    if (hasSeenNotice === 'false') {
      showBottomSheetModal({
        content: <MaintenanceNoticeBottomSheet onClose={hideBottomSheetModal} />,
        onDismiss: handleBottomSheetClose,
      });
    }
  }, [handleBottomSheetClose, hasSeenNotice, hideBottomSheetModal, showBottomSheetModal]);

  return null;
}
