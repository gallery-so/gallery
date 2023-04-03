import { useNavigation } from '@react-navigation/native';
import { useCallback, useState } from 'react';
import { View } from 'react-native';
import { useRelayEnvironment } from 'react-relay';

import { LoginStackNavigatorProp } from '~/navigation/types';

import { Button } from '../../components/Button';
import { IconContainer } from '../../components/IconContainer';
import { SafeAreaViewWithPadding } from '../../components/SafeAreaViewWithPadding';
import { Typography } from '../../components/Typography';
import { BackIcon } from '../../icons/BackIcon';
import { registerNotificationToken } from '../../utils/registerNotificationToken';

export function AskForNotificationsScreen() {
  const relayEnvironment = useRelayEnvironment();
  const navigation = useNavigation<LoginStackNavigatorProp>();

  const [error, setError] = useState<string | null>(null);

  const transitionToLoggedInState = useCallback(() => {
    navigation.replace('MainTabs', { screen: 'Home', params: { screen: 'Latest' } });
  }, [navigation]);

  const handleSkip = useCallback(() => {
    transitionToLoggedInState();
  }, [transitionToLoggedInState]);

  const handleContinue = useCallback(async () => {
    setError(null);

    const result = await registerNotificationToken({ shouldPrompt: true, relayEnvironment });

    if (result.kind === 'registered') {
      transitionToLoggedInState();
    } else if (result.kind === 'did_not_register') {
      // Do nothing, and let them select the option again.
    } else if (result.kind === 'failure') {
      setError(result.reason);
    }
  }, [relayEnvironment, transitionToLoggedInState]);

  return (
    <SafeAreaViewWithPadding className="flex h-screen flex-1 flex-col bg-white">
      <IconContainer className="px-6 py-2" icon={<BackIcon />} onPress={navigation.goBack} />

      <View className="flex flex-grow flex-col items-center justify-center">
        <View className="flex max-w-xs flex-col space-y-4">
          <Typography className="text-2xl" font={{ family: 'ABCDiatype', weight: 'Bold' }}>
            Turn on push notifications?
          </Typography>

          <Typography className="text-base" font={{ family: 'ABCDiatype', weight: 'Regular' }}>
            Don’t miss important messages like friend activity, feature updates, member-only events,
            and exclusive gallery events.
          </Typography>

          {error && (
            <Typography
              className="text-error text-base"
              font={{ family: 'ABCDiatype', weight: 'Regular' }}
            >
              {error}
            </Typography>
          )}
        </View>
      </View>

      <View className="flex flex-row space-x-3 px-6">
        <Button onPress={handleSkip} className="flex-grow" text="SKIP" variant="light" />
        <Button onPress={handleContinue} className="flex-grow" text="TURN ON" variant="dark" />
      </View>
    </SafeAreaViewWithPadding>
  );
}
