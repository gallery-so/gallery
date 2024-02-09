import { useNavigation } from '@react-navigation/native';
import { useCallback } from 'react';
import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { contexts } from 'shared/analytics/constants';
import colors from 'shared/theme/colors';
import { RightArrowIcon } from 'src/icons/RightArrowIcon';

import { BackButton } from '~/components/BackButton';
import { Button } from '~/components/Button';
import { GalleryTouchableOpacity } from '~/components/GalleryTouchableOpacity';
import { OnboardingProgressBar } from '~/components/Onboarding/OnboardingProgressBar';
import { Typography } from '~/components/Typography';
import { LoginStackNavigatorProp } from '~/navigation/types';

import { navigateToNotificationUpsellOrHomeScreen } from '../Login/navigateToNotificationUpsellOrHomeScreen';

const PERSONAS = ['collector', 'creator', 'both'];

export function OnboardingPersonaScreen() {
  const { top } = useSafeAreaInsets();
  const navigation = useNavigation<LoginStackNavigatorProp>();

  const handleBack = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  const handleNext = useCallback(async () => {
    await navigateToNotificationUpsellOrHomeScreen(navigation, true);
  }, [navigation]);

  return (
    <View style={{ paddingTop: top }} className="bg-white flex-1">
      <View className="flex flex-col flex-grow space-y-3 px-4 bg-white">
        <View className="relative flex-row items-center justify-between pb-4">
          <BackButton onPress={handleBack} />
          <GalleryTouchableOpacity
            onPress={handleNext}
            className="flex flex-row items-center space-x-2"
            eventElementId="Skip button on onboarding persona screen"
            eventName="Skip button on onboarding persona screen pressed"
            eventContext={contexts.Onboarding}
          >
            <Typography
              className="text-sm text-metal"
              font={{ family: 'ABCDiatype', weight: 'Regular' }}
            >
              Skip
            </Typography>
            <RightArrowIcon color={colors.metal} />
          </GalleryTouchableOpacity>
        </View>

        <View className="mb-10">
          <OnboardingProgressBar from={90} to={95} />
        </View>

        <View className="flex-grow space-y-12">
          <Typography
            className="text-center text-lg"
            font={{ family: 'ABCDiatype', weight: 'Bold' }}
          >
            What best describes you?
          </Typography>

          <View className="space-y-2 px-2">
            {PERSONAS.map((persona) => (
              <Button
                key={persona}
                variant="secondary"
                text={persona}
                onPress={handleNext}
                eventElementId="Onboarding Persona Button"
                eventName="Onboarding Persona Button Press"
                eventContext={contexts.Onboarding}
                properties={{ variant: persona }}
              />
            ))}
          </View>
        </View>
      </View>
    </View>
  );
}
