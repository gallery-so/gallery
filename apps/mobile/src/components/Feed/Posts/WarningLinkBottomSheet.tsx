import { useCallback } from 'react';
import { Linking, View } from 'react-native';

import { useBottomSheetModalActions } from '~/contexts/BottomSheetModalContext';
import { contexts } from '~/shared/analytics/constants';

import { Button } from '../../Button';
import { Typography } from '../../Typography';

type Props = {
  redirectUrl: string;
};

export default function WarningLinkBottomSheet(props: Props) {
  const { hideBottomSheetModal } = useBottomSheetModalActions();

  const handleCancel = useCallback(() => hideBottomSheetModal(), [hideBottomSheetModal]);

  const handleContinue = useCallback(() => Linking.openURL(props.redirectUrl), [props.redirectUrl]);

  return (
    <View className="flex flex-col space-y-6">
      <View className="flex flex-col space-y-4">
        <Typography
          className="text-lg text-black-900 dark:text-offWhite"
          font={{ family: 'ABCDiatype', weight: 'Bold' }}
        >
          Leaving Gallery
        </Typography>
        <Typography
          className="text-md text-black-900 dark:text-offWhite"
          font={{ family: 'ABCDiatype', weight: 'Regular' }}
        >
          You are going to{' '}
          <Typography font={{ family: 'ABCDiatype', weight: 'Bold' }}>
            {props.redirectUrl}
          </Typography>
        </Typography>
      </View>

      <View className="pb-1.5 flex flex-col space-y-2.5">
        <Button
          onPress={handleContinue}
          text="CONTINUE"
          eventElementId="External URL Confirmation Continue Button"
          eventName="Pressed External URL Confirmation Continue Button"
          eventContext={contexts.Posts}
        />
        <Button
          variant="secondary"
          onPress={handleCancel}
          text="CANCEL"
          eventElementId="External URL Confirmation Cancel Button"
          eventName="Pressed External URL Confirmation Cancel Button"
          eventContext={contexts.Posts}
        />
      </View>
    </View>
  );
}
