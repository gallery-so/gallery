import { useNavigation } from '@react-navigation/native';
import { useCallback, useState } from 'react';
import { KeyboardAvoidingView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { LoginStackNavigatorProp } from '~/navigation/types';
import { useReportError } from '~/shared/contexts/ErrorReportingContext';

import { Button } from '../../components/Button';
import { FadedInput } from '../../components/FadedInput';
import { IconContainer } from '../../components/IconContainer';
import { Typography } from '../../components/Typography';
import { useLogin } from '../../hooks/useLogin';
import { BackIcon } from '../../icons/BackIcon';
import { magic } from '../../magic';

export function EnterEmailScreen() {
  const navigation = useNavigation<LoginStackNavigatorProp>();

  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const [login] = useLogin();
  const reportError = useReportError();

  const handleContinue = useCallback(async () => {
    setError('');
    setIsLoggingIn(true);

    // Show the waiting screen.
    navigation.navigate('WaitingForConfirmation', { email });

    function handleLoginError(message: string) {
      reportError(`LoginError: ${message}`);

      setError(message);

      // Bring the user back to the login route with an error displayed.
      navigation.goBack();
    }

    try {
      const token = await magic.auth.loginWithMagicLink({ email, showUI: false });

      if (!token) {
        handleLoginError(
          "Something unexpected went wrong while logigng in. We've been notified and are looking into it"
        );
        return;
      }

      const result = await login({ magicLink: { token } });

      if (result.kind === 'failure') {
        handleLoginError(result.message);
      } else {
        navigation.navigate('AskForNotifications');
      }
    } finally {
      setIsLoggingIn(false);
    }
  }, [email, login, navigation, reportError]);

  return (
    <SafeAreaView className="h-screen bg-white">
      <KeyboardAvoidingView behavior="padding" className="flex flex-1 flex-col">
        <IconContainer className="px-6 py-2" icon={<BackIcon />} onPress={navigation.goBack} />

        <View className="flex flex-grow flex-col items-center justify-center">
          <View className="flex max-w-xs flex-col space-y-4">
            <Typography className="text-lg" font={{ family: 'ABCDiatype', weight: 'Bold' }}>
              Enter your Verified email
            </Typography>

            <Typography className="text-sm" font={{ family: 'ABCDiatype', weight: 'Regular' }}>
              If you’re an existing Gallery user with a verified email address, we’ll deliver a
              magic sign-in link to your inbox.
            </Typography>

            {error && (
              <Typography
                className="text-error text-sm"
                font={{ family: 'ABCDiatype', weight: 'Regular' }}
              >
                {error}
              </Typography>
            )}

            <FadedInput
              placeholder="Email"
              keyboardType="email-address"
              autoCorrect={false}
              autoCapitalize="none"
              autoComplete="email"
              value={email}
              onChangeText={setEmail}
            />

            <Button loading={isLoggingIn} onPress={handleContinue} text="Continue" />

            {/* Add some extra space for the keyboard avoiding view */}
            <View />
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
