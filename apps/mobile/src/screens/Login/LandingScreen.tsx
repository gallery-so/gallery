import { useNavigation } from '@react-navigation/native';
import { useCallback } from 'react';
import { View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { LoginStackNavigatorProp } from '~/navigation/types';

import { Button } from '../../components/Button';
import { Typography } from '../../components/Typography';
import { EmailIcon } from './EmailIcon';
import { LandingLogo } from './LandingLogo';
import { QRCodeIcon } from './QRCodeIcon';

export function LandingScreen() {
  const navigation = useNavigation<LoginStackNavigatorProp>();

  const handleEmailPress = useCallback(() => {
    navigation.navigate('EnterEmail', {});
  }, [navigation]);

  const handleQrCodePress = useCallback(() => {
    navigation.navigate('QRCode', {});
  }, [navigation]);

  return (
    <SafeAreaView className="flex h-full flex-col justify-end bg-white">
      <View className="mb-32 flex flex-col items-center space-y-12">
        <LandingLogo />

        <View className="flex flex-col space-y-4">
          <Typography
            className="text-metal text-center text-sm"
            font={{ family: 'ABCDiatype', weight: 'Regular' }}
          >
            Choose a sign in method
          </Typography>

          <Button
            onPress={handleEmailPress}
            icon={<EmailIcon />}
            text="Use verified email address"
          />

          <Typography
            className="text-metal text-center text-sm"
            font={{ family: 'ABCDiatype', weight: 'Regular' }}
          >
            or
          </Typography>

          <Button
            onPress={handleQrCodePress}
            variant="light"
            icon={<QRCodeIcon />}
            text="Scan QR Code on gallery.so"
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
    </SafeAreaView>
  );
}
