import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { useCallback, useState } from 'react';
import { View } from 'react-native';
import { useRelayEnvironment } from 'react-relay';

import { Button } from '~/components/Button';
import { registerNotificationToken } from '~/components/Notification/registerNotificationToken';
import { SafeAreaViewWithPadding } from '~/components/SafeAreaViewWithPadding';
import { LoginStackNavigatorParamList, LoginStackNavigatorProp } from '~/navigation/types';
import { markAsShown } from '~/screens/Login/navigateToNotificationUpsellOrHomeScreen';
import { contexts } from '~/shared/analytics/constants';

import { Typography } from '../../components/Typography';

export function NotificationUpsellScreen() {
  const navigation = useNavigation<LoginStackNavigatorProp>();
  const route = useRoute<RouteProp<LoginStackNavigatorParamList, 'NotificationUpsell'>>();

  const { isNewUser } = route.params ?? {};
  const [error, setError] = useState('');

  const navigateIntoApp = useCallback(() => {
    markAsShown();

    navigation.reset({
      index: 0,
      routes: [
        {
          name: 'MainTabs',
          params: {
            screen: 'HomeTab',
            params: { screen: 'Home', params: { screen: 'For You', params: { isNewUser } } },
          },
        },
      ],
    });
  }, [isNewUser, navigation]);

  const relayEnvironment = useRelayEnvironment();
  const handleTurnOn = useCallback(async () => {
    const result = await registerNotificationToken({ shouldPrompt: true, relayEnvironment });

    if (result.kind === 'registered') {
      navigateIntoApp();
    } else if (result.kind === 'did_not_register') {
      // Do nothing
    } else if (result.kind === 'failure') {
      setError(result.reason);
    }
  }, [navigateIntoApp, relayEnvironment]);

  const handleSkip = useCallback(() => {
    navigateIntoApp();
  }, [navigateIntoApp]);

  return (
    <SafeAreaViewWithPadding className="flex flex-1 flex-col bg-white dark:bg-black-900">
      <View className="flex flex-grow flex-col items-center justify-center px-6">
        <View className="flex flex-col space-y-4">
          <Typography className="text-2xl" font={{ family: 'ABCDiatype', weight: 'Bold' }}>
            Stay in the loop
          </Typography>

          <Typography className="text-md" font={{ family: 'ABCDiatype', weight: 'Regular' }}>
            Enable push notifications to receive updates on friend activity, feature releases, and
            exclusive gallery events.
          </Typography>

          {error && (
            <Typography
              className="text-md text-error"
              font={{ family: 'ABCDiatype', weight: 'Regular' }}
            >
              {error}
            </Typography>
          )}

          <View />
        </View>
      </View>

      <View className="flex-row px-6 space-x-3">
        <Button
          eventElementId="Skip Enable Notification Upsell Button"
          eventName="Toggle Mobile Notification"
          eventContext={contexts.Onboarding}
          properties={{ variant: 'disable' }}
          onPress={handleSkip}
          className="flex-1"
          text="SKIP"
          variant="secondary"
        />
        <Button
          eventElementId="Skip Enable Notification Upsell Button"
          eventName="Toggle Mobile Notification"
          eventContext={contexts.Onboarding}
          properties={{ variant: 'enable' }}
          onPress={handleTurnOn}
          className="flex-1"
          text="ENABLE"
          variant="primary"
        />
      </View>
    </SafeAreaViewWithPadding>
  );
}
