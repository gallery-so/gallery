import { useCallback } from 'react';
import { View } from 'react-native';

import { useBottomSheetModalActions } from '~/contexts/BottomSheetModalContext';
import { contexts } from '~/shared/analytics/constants';

import { Button } from '../Button';
import { Typography } from '../Typography';

type Props = {
  username: string;
  onContinue: () => void;
};

export function WelcomeNewUser({ username, onContinue }: Props) {
  const { hideBottomSheetModal } = useBottomSheetModalActions();

  const handleContinue = useCallback(() => {
    hideBottomSheetModal();
    onContinue();
  }, [hideBottomSheetModal, onContinue]);

  return (
    <View className="flex flex-column space-y-8 ">
      <View className="space-y-6">
        <View>
          <Typography
            className="text-3xl text-center"
            font={{ family: 'GTAlpina', weight: 'StandardLight' }}
          >
            Welcome to Gallery,
          </Typography>
          <Typography
            className="text-3xl text-center"
            font={{ family: 'GTAlpina', weight: 'StandardLight' }}
          >
            {username}!
          </Typography>
        </View>
        <Typography className="text-center" font={{ family: 'ABCDiatype', weight: 'Regular' }}>
          This is where you’ll see updates from other Gallery users. Toggle between your
          personalized For 'You feed' and the 'Following' feed, showing the latest updates from your
          connections
        </Typography>
      </View>

      <Button
        onPress={handleContinue}
        text="continue"
        eventElementId="Welcome New User Bottom Sheet"
        eventName="Welcome New User Continue Clicked"
        eventContext={contexts.Onboarding}
      />
    </View>
  );
}
