import { useNavigation } from '@react-navigation/native';
import { useCallback, useState } from 'react';
import { KeyboardAvoidingView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { LoginStackNavigatorProp } from '~/navigation/types';

import { Button } from '../../components/Button';
import { FadedInput } from '../../components/FadedInput';
import { Typography } from '../../components/Typography';
import { useLogin } from '../../hooks/useLogin';
import { magic } from '../../magic';

export function EnterEmailScreen() {
  const navigation = useNavigation<LoginStackNavigatorProp>();

  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const [login] = useLogin();

  const handleContinue = useCallback(async () => {
    setIsLoggingIn(true);
    try {
      const token = await magic.auth.loginWithMagicLink({ email });

      if (!token) {
        setError('Something went wrong');
        return;
      }

      const result = await login({ magicLink: { token } });

      console.log(result);

      if (result.kind === 'failure') {
        setError(result.message);
      } else {
        navigation.replace('MainTabs', { screen: 'Home', params: { screen: 'Trending' } });
      }
    } finally {
      setIsLoggingIn(false);
    }
  }, [email, login, navigation]);

  return (
    <SafeAreaView className="flex h-screen flex-col items-center justify-center bg-white">
      <KeyboardAvoidingView behavior="position" className="flex max-w-xs flex-col space-y-4">
        <Typography className="text-lg" font={{ family: 'ABCDiatype', weight: 'Bold' }}>
          Enter your Verified email
        </Typography>

        <Typography font={{ family: 'ABCDiatype', weight: 'Regular' }}>
          If you’re an existing Gallery user with a verified email address, we’ll deliver a magic
          sign-in link to your inbox.
        </Typography>

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
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
