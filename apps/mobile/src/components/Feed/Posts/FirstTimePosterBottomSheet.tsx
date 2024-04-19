import { View } from 'react-native';

import { Button } from '~/components/Button';
import { Typography } from '~/components/Typography';
import { useBottomSheetModalActions } from '~/contexts/BottomSheetModalContext';
import { contexts } from '~/shared/analytics/constants';

export default function FirstTimePosterBottomSheet() {
  const { hideBottomSheetModal } = useBottomSheetModalActions();

  return (
    <View className="flex flex-col space-y-6">
      <View className="flex flex-col space-y-4">
        <Typography
          className="text-lg text-black-900 dark:text-offWhite"
          font={{ family: 'ABCDiatype', weight: 'Bold' }}
        >
          First-time poster
        </Typography>
        <Typography
          className="text-lg text-black-900 dark:text-offWhite"
          font={{ family: 'ABCDiatype', weight: 'Regular' }}
        >
          This is my first post—gm!
        </Typography>
      </View>

      <Button
        onPress={hideBottomSheetModal}
        text="CLOSE"
        eventElementId={null}
        eventName={null}
        eventContext={contexts.Posts}
      />
    </View>
  );
}
