import { useNavigation } from '@react-navigation/native';
import { useCallback } from 'react';
import { View } from 'react-native';

import { useBottomSheetModalActions } from '~/contexts/BottomSheetModalContext';
import { contexts } from '~/shared/analytics/constants';

import { Button } from '../Button';
import { Typography } from '../Typography';

export default function WarningPostBottomSheet() {
  const navigation = useNavigation();

  const { hideBottomSheetModal } = useBottomSheetModalActions();

  const handleBack = useCallback(() => {
    hideBottomSheetModal();

    navigation.goBack();
  }, [hideBottomSheetModal, navigation]);

  return (
    <View className=" flex flex-col space-y-6">
      <View className="flex flex-col space-y-4">
        <Typography
          className="text-lg text-black-900 dark:text-offWhite"
          font={{ family: 'ABCDiatype', weight: 'Bold' }}
        >
          Are you sure?
        </Typography>
        <Typography
          className="text-lg text-black-900 dark:text-offWhite"
          font={{ family: 'ABCDiatype', weight: 'Regular' }}
        >
          If you go back now, this post will be discarded.
        </Typography>
      </View>

      <Button
        onPress={handleBack}
        text="DISCARD POST"
        eventElementId="Discard Post Button"
        eventName="Discard Post"
        eventContext={contexts.Posts}
      />
    </View>
  );
}
