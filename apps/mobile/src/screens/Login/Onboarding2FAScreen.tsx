import { useEmbeddedWallet, usePrivy } from '@privy-io/expo';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import clsx from 'clsx';
import React, { Suspense, useCallback, useState } from 'react';
import { KeyboardAvoidingView, Platform, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { contexts } from 'shared/analytics/constants';
import { useTrack } from 'shared/contexts/AnalyticsContext';
import { useReportError } from 'shared/contexts/ErrorReportingContext';
import { useLogin } from 'src/hooks/useLogin';

import { BackButton } from '~/components/BackButton';
import { OnboardingProgressBar } from '~/components/Onboarding/OnboardingProgressBar';
import { Typography } from '~/components/Typography';
import { LoginStackNavigatorParamList, LoginStackNavigatorProp } from '~/navigation/types';

import { Button } from '../../components/Button';
import { navigateToNotificationUpsellOrHomeScreen } from './navigateToNotificationUpsellOrHomeScreen';
import Onboarding2FAInput from './Onboarding2FAInput';

const FALLBACK_ERROR_MESSAGE = `Something unexpected went wrong while logging in. We've been notified and are looking into it`;

function InnerOnboardingEmailScreen() {
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [error, setError] = useState('');
  const [code, setCode] = useState<string[]>(new Array(6).fill('')); // Lifted code state

  const navigation = useNavigation<LoginStackNavigatorProp>();
  const route = useRoute<RouteProp<LoginStackNavigatorParamList, 'Onboarding2FA'>>();

  const { authMethod, authMechanism, email, loginWithCode } = route.params;

  const { bottom } = useSafeAreaInsets();

  const [login] = useLogin();
  const reportError = useReportError();
  const track = useTrack();

  const { getAccessToken } = usePrivy();
  const embeddedWallet = useEmbeddedWallet();

  const handleLoginError = useCallback(
    ({ message, underlyingError }: { message: string; underlyingError?: Error }) => {
      track('Sign In Failure', { 'Sign in method': 'Email', error: message });

      if (underlyingError) {
        reportError(underlyingError);
      } else {
        reportError(`LoginError: ${message}`);
      }

      setError(message);
    },
    [reportError, track]
  );

  const handleLoginOrCreateUser = useCallback(
    async (inputCode?: string): Promise<void> => {
      const codeString = inputCode || code.join('');
      if (codeString.length !== 6) return;
      try {
        setIsLoggingIn(true);
        const privyUser = await loginWithCode({ code: codeString, email });
        if (!privyUser) {
          throw new Error('No email found; code may be invalid. Restart and try again.');
        }

        const token = await getAccessToken();
        if (!token) {
          throw new Error('no access token for privy user');
        }
        const result = await login({ privy: { token } });

        // If user not found, create a new user
        if (result.kind !== 'success') {
          if (authMethod === 'Privy') {
            // create an embedded wallet for users signing up through privy
            await embeddedWallet?.create?.({ recoveryMethod: 'privy' });

            navigation.navigate('OnboardingUsername', {
              authMethod: 'Privy',
              authMechanism: {
                authMechanismType: 'privy',
                privyToken: token,
              },
              email,
            });
          }
          if (authMethod === 'Wallet' || authMethod === 'Farcaster') {
            navigation.navigate('OnboardingUsername', {
              authMethod,
              authMechanism: {
                ...authMechanism,
                privyToken: token,
              },
              email,
            });
          }
        } else {
          // otherwise, log them in
          track('Sign In Success', { 'Sign in method': 'Email' });
          await navigateToNotificationUpsellOrHomeScreen(navigation);
        }
      } catch (error) {
        if (error instanceof Error) {
          handleLoginError({
            message: error.message || FALLBACK_ERROR_MESSAGE,
            underlyingError: error as Error,
          });
        }
      } finally {
        setIsLoggingIn(false);
      }
    },
    [
      authMechanism,
      authMethod,
      email,
      embeddedWallet,
      getAccessToken,
      handleLoginError,
      login,
      loginWithCode,
      navigation,
      track,
      code,
    ]
  );

  const handleBack = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  return (
    <View className="flex flex-col flex-grow space-y-8 px-4">
      <View>
        <View className="relative flex-row items-center justify-between pb-4">
          <BackButton onPress={handleBack} />

          <View
            className="absolute w-full flex flex-row justify-center items-center"
            pointerEvents="none"
          >
            <Typography className="text-sm" font={{ family: 'ABCDiatype', weight: 'Bold' }}>
              Confirm email
            </Typography>
          </View>

          <View />
        </View>

        <OnboardingProgressBar from={20} to={30} />
      </View>
      <View
        className="flex-1 justify-center items-center space-y-12 px-8"
        style={{
          marginBottom: bottom,
        }}
      >
        <View>
          <Typography
            className="text-center text-lg"
            font={{ family: 'ABCDiatype', weight: 'Regular' }}
          >
            Please enter the code sent to
          </Typography>
          <Typography
            className="text-center text-lg"
            font={{ family: 'ABCDiatype', weight: 'Bold' }}
          >
            {email}
          </Typography>
        </View>

        <View>
          <Onboarding2FAInput
            code={code}
            setCode={setCode}
            onCodeComplete={handleLoginOrCreateUser}
          />
        </View>

        <View className="space-y-4 w-full">
          <Button
            eventElementId="Submit 2FA Button"
            eventName="Submit 2FA Attempt"
            eventContext={contexts.Onboarding}
            className="w-full"
            text="Next"
            onPress={() => {
              handleLoginOrCreateUser();
            }}
            loading={isLoggingIn}
            disabled={isLoggingIn}
          />

          <Typography
            className={clsx(
              'text-sm text-red',
              email.length > 0 && 'opacity-100',
              email.length === 0 && 'opacity-0',
              error && 'text-red',
              !error && 'text-shadow'
            )}
            font={{ family: 'ABCDiatype', weight: 'Regular' }}
          >
            {error}
          </Typography>
        </View>
        <View />
      </View>
    </View>
  );
}

export function Onboarding2FAScreen() {
  const { top } = useSafeAreaInsets();

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ paddingTop: top }}
      className="flex flex-1 flex-col bg-white dark:bg-black-900"
    >
      <Suspense fallback={null}>
        <InnerOnboardingEmailScreen />
      </Suspense>
    </KeyboardAvoidingView>
  );
}
