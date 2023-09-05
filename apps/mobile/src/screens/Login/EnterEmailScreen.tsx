import { useNavigation } from '@react-navigation/native';
import clsx from 'clsx';
import { useCallback, useState } from 'react';
import { KeyboardAvoidingView, Platform, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { BackButton } from '~/components/BackButton';
import { OnboardingTextInput } from '~/components/Onboarding/OnboardingTextInput';
import { LoginStackNavigatorProp } from '~/navigation/types';
import { navigateToNotificationUpsellOrHomeScreen } from '~/screens/Login/navigateToNotificationUpsellOrHomeScreen';
import { useVerifyEmailMagicLink } from '~/screens/Login/useVerifyEmailMagicLink';
import { useTrack } from '~/shared/contexts/AnalyticsContext';
import { useReportError } from '~/shared/contexts/ErrorReportingContext';

import { Button } from '../../components/Button';
import { Typography } from '../../components/Typography';
import { useLogin } from '../../hooks/useLogin';
import { magic } from '../../magic';

const FALLBACK_ERROR_MESSAGE = `Something unexpected went wrong while logging in. We've been notified and are looking into it`;

export function EnterEmailScreen() {
  const navigation = useNavigation<LoginStackNavigatorProp>();
  const { top, bottom } = useSafeAreaInsets();

  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const [login] = useLogin();
  const [verifyEmail] = useVerifyEmailMagicLink();
  const reportError = useReportError();
  const track = useTrack();

  const handleContinue = useCallback(async () => {
    let hasNavigatedForward = false;

    setError('');
    setIsLoggingIn(true);

    function handleLoginError({
      message,
      underlyingError,
    }: {
      message: string;
      underlyingError?: Error;
    }) {
      track('Sign In Failure', { 'Sign in method': 'Email', error: message });

      if (underlyingError) {
        reportError(underlyingError);
      } else {
        reportError(`LoginError: ${message}`);
      }

      setError(message);

      if (hasNavigatedForward) {
        navigation.goBack();
      }
    }

    try {
      const { verifyEmailMagicLink } = await verifyEmail({ variables: { input: { email } } });

      if (verifyEmailMagicLink?.__typename === 'ErrInvalidInput') {
        return handleLoginError({
          message: `The email address you entered doesn't look valid. Please try again.`,
        });
      } else if (verifyEmailMagicLink?.__typename === 'VerifyEmailMagicLinkPayload') {
        if (!verifyEmailMagicLink.canSend) {
          return handleLoginError({
            message: `You have not verified your email. First verify at gallery.so/settings before signing in. Or login with QR Code instead.`,
          });
        }
      } else {
        return handleLoginError({ message: FALLBACK_ERROR_MESSAGE });
      }

      // Show the waiting screen.
      hasNavigatedForward = true;
      navigation.navigate('WaitingForConfirmation', { email });

      const token = await magic.auth.loginWithMagicLink({ email, showUI: false });

      if (!token) {
        return handleLoginError({ message: FALLBACK_ERROR_MESSAGE });
      }

      const result = await login({ magicLink: { token } });

      if (result.kind === 'failure') {
        handleLoginError({ message: result.message });
      } else {
        track('Sign In Success', { 'Sign in method': 'Email' });
        await navigateToNotificationUpsellOrHomeScreen(navigation);
      }
    } catch (error) {
      handleLoginError({
        message: FALLBACK_ERROR_MESSAGE,
        underlyingError: error as Error,
      });
    } finally {
      setIsLoggingIn(false);
    }
  }, [email, login, navigation, reportError, track, verifyEmail]);
  const handleBack = useCallback(() => {
    navigation.goBack();
  }, [navigation]);
  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ paddingTop: top }}
      className="flex flex-1 flex-col bg-white dark:bg-black-900"
    >
      <View className="flex flex-col flex-grow space-y-8 px-4">
        <View className="relative flex-row items-center justify-between ">
          <BackButton onPress={handleBack} />

          <View
            className="absolute w-full flex flex-row justify-center items-center"
            pointerEvents="none"
          >
            <Typography className="text-sm" font={{ family: 'ABCDiatype', weight: 'Bold' }}>
              Enter email
            </Typography>
          </View>

          <View />
        </View>

        <View
          className="flex-1  justify-center space-y-12 px-8"
          style={{
            marginBottom: bottom,
          }}
        >
          <OnboardingTextInput
            autoFocus
            placeholder="name@email.com"
            keyboardType="email-address"
            autoComplete="email"
            value={email}
            onChangeText={setEmail}
          />
          <View className="space-y-4">
            <Button
              eventElementId="Submit Email Button"
              eventName="Sign In Attempt"
              className={clsx(
                'w-full',
                email.length > 0 && 'opacity-100',
                email.length === 0 && 'opacity-0'
              )}
              loading={isLoggingIn}
              onPress={handleContinue}
              text="Continue"
              properties={{
                'Sign In Selection': 'Email',
              }}
            />

            <Typography
              className={clsx(
                'text-sm text-red',
                email.length > 0 && 'opacity-100',
                email.length === 0 && 'opacity-0'
              )}
              font={{ family: 'ABCDiatype', weight: 'Regular' }}
            >
              {error}
            </Typography>
          </View>
          <View />
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}
