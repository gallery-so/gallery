import { useCallback, useState } from 'react';
import { KeyboardAvoidingView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button } from '../../components/Button';
import { FadedInput } from '../../components/FadedInput';
import { Typography } from '../../components/Typography';
import { magic } from '../../magic';

export function EnterEmailScreen() {
  const [email, setEmail] = useState('');

  const handleContinue = useCallback(async () => {
    const token = await magic.auth.loginWithMagicLink({ email });

    console.log(token);
  }, [email]);

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

        <Button onPress={handleContinue} text="Continue" />

        {/* Add some extra space for the keyboard avoiding view */}
        <View />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
