import { useNavigation } from '@react-navigation/native';
import { useCallback } from 'react';
import { View } from 'react-native';

import { SafeAreaViewWithPadding } from '~/components/SafeAreaViewWithPadding';
import { LoginStackNavigatorProp } from '~/navigation/types';

import { Button } from '../../components/Button';
import { Typography } from '../../components/Typography';
import { EmailIcon } from './EmailIcon';
import { LandingLogo } from './LandingLogo';
import { QRCodeIcon } from './QRCodeIcon';

export function LandingScreen() {
  const navigation = useNavigation<LoginStackNavigatorProp>();

  const handleEmailPress = useCallback(() => {
    navigation.navigate('EnterEmail');
  }, [navigation]);

  const handleQrCodePress = useCallback(() => {
    navigation.navigate('QRCode');
  }, [navigation]);

  return (
    <SafeAreaViewWithPadding className="flex h-full flex-col justify-end bg-white dark:bg-black">
      <View className="mb-32 flex flex-col items-center space-y-12">
        <LandingLogo />

        <View className="flex flex-col space-y-4 w-8/12">
          <Typography
            className="text-metal text-center text-sm"
            font={{ family: 'ABCDiatype', weight: 'Regular' }}
          >
            Select a sign in method
          </Typography>

          <Button
            id="Email Button"
            eventName="Sign In Selection"
            properties={{
              'Sign In Method': 'Email',
            }}
            onPress={handleEmailPress}
            icon={<EmailIcon />}
            text="Use verified email"
          />

          <Button
            id="QR Code Button"
            eventName="Sign In Selection"
            properties={{
              'Sign In Method': 'QR Code',
            }}
            onPress={handleQrCodePress}
            variant="secondary"
            icon={<QRCodeIcon />}
            text="Scan QR Code"
            style={{ justifyContent: 'space-between' }}
          />
        </View>
      </View>

      <View className="py-8">
        <Typography
          className="text-metal text-center text-sm"
          font={{ family: 'ABCDiatype', weight: 'Regular' }}
        >
          New user? Please sign up on gallery.so first.
        </Typography>
      </View>
    </SafeAreaViewWithPadding>
  );
}
