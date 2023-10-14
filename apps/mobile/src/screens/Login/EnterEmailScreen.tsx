import { useNavigation } from '@react-navigation/native';
import { useCallback, useState } from 'react';
import { KeyboardAvoidingView, View } from 'react-native';

import { SafeAreaViewWithPadding } from '~/components/SafeAreaViewWithPadding';
import { LoginStackNavigatorProp } from '~/navigation/types';
import { navigateToNotificationUpsellOrHomeScreen } from '~/screens/Login/navigateToNotificationUpsellOrHomeScreen';
import { useVerifyEmailMagicLink } from '~/screens/Login/useVerifyEmailMagicLink';
import { contexts } from '~/shared/analytics/constants';
import { useTrack } from '~/shared/contexts/AnalyticsContext';
import { useReportError } from '~/shared/contexts/ErrorReportingContext';

import { Button } from '../../components/Button';
import { FadedInput } from '../../components/FadedInput';
import { IconContainer } from '../../components/IconContainer';
import { Typography } from '../../components/Typography';
import { useLogin } from '../../hooks/useLogin';
import { BackIcon } from '../../icons/BackIcon';
import { magic } from '../../magic';

const FALLBACK_ERROR_MESSAGE = `Something unexpected went wrong while logging in. We've been notified and are looking into it`;

export function EnterEmailScreen() {
  const navigation = useNavigation<LoginStackNavigatorProp>();

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

  return (
    <SafeAreaViewWithPadding className="h-screen bg-white dark:bg-black-900">
      <KeyboardAvoidingView behavior="padding" className="flex flex-1 flex-col">
        <IconContainer
          eventElementId={null}
          eventName={null}
          eventContext={null}
          className="px-6 py-2"
          icon={<BackIcon />}
          onPress={navigation.goBack}
        />

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
              autoFocus
              placeholder="Email"
              keyboardType="email-address"
              autoCorrect={false}
              autoCapitalize="none"
              autoComplete="email"
              value={email}
              onChangeText={setEmail}
            />

            <Button
              eventElementId="Submit Email Button"
              eventName="Sign In Attempt"
              eventContext={contexts.Authentication}
              loading={isLoggingIn}
              onPress={handleContinue}
              text="Continue"
              properties={{
                'Sign In Selection': 'Email',
              }}
            />

            {/* Add some extra space for the keyboard avoiding view */}
            <View />
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaViewWithPadding>
  );
}
