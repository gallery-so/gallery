import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import clsx from 'clsx';
import { Suspense, useCallback, useMemo, useState } from 'react';
import { KeyboardAvoidingView, Platform, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { graphql, useLazyLoadQuery } from 'react-relay';
import useDebounce from 'shared/hooks/useDebounce';

import { BackButton } from '~/components/BackButton';
import { OnboardingProgressBar } from '~/components/Onboarding/OnboardingProgressBar';
import { OnboardingTextInput } from '~/components/Onboarding/OnboardingTextInput';
import { OnboardingEmailScreenQuery } from '~/generated/OnboardingEmailScreenQuery.graphql';
import { LoginStackNavigatorParamList, LoginStackNavigatorProp } from '~/navigation/types';
import { navigateToNotificationUpsellOrHomeScreen } from '~/screens/Login/navigateToNotificationUpsellOrHomeScreen';
import { contexts } from '~/shared/analytics/constants';
import { useTrack } from '~/shared/contexts/AnalyticsContext';
import { useReportError } from '~/shared/contexts/ErrorReportingContext';
import { EMAIL_FORMAT } from '~/shared/utils/regex';

import { Button } from '../../components/Button';
import { Typography } from '../../components/Typography';
import { useLogin } from '../../hooks/useLogin';
import { magic } from '../../magic';

const FALLBACK_ERROR_MESSAGE = `Something unexpected went wrong while logging in. We've been notified and are looking into it`;

function InnerOnboardingEmailScreen() {
  const [email, setEmail] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const navigation = useNavigation<LoginStackNavigatorProp>();
  const route = useRoute<RouteProp<LoginStackNavigatorParamList, 'OnboardingEmail'>>();

  const authMethod = route.params.authMethod;
  const authMechanism = route.params.authMechanism;

  const { bottom } = useSafeAreaInsets();

  const [error, setError] = useState('');

  const [login] = useLogin();
  const reportError = useReportError();
  const track = useTrack();

  const handleEmailChange = useCallback((text: string) => {
    setError('');
    setEmail(text);
  }, []);

  const handleContinueEmailFlow = useCallback(async () => {
    let hasNavigatedForward = false;

    setIsLoggingIn(true);
    setError('');

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
      hasNavigatedForward = true;

      const token = await magic.auth.loginWithMagicLink({ email, showUI: false });

      if (!token) {
        return handleLoginError({ message: FALLBACK_ERROR_MESSAGE });
      }

      const result = await login({ magicLink: { token } });

      // If user not found, create a new user
      if (result.kind === 'failure') {
        navigation.navigate('OnboardingUsername', {
          authMechanism: {
            authMechanismType: 'magicLink',
            token,
          },
          email,
          authMethod: 'Email',
        });
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
  }, [email, login, navigation, reportError, track]);

  const handleContinueWalletFlow = useCallback(() => {
    if (authMechanism?.authMechanismType === 'eoa') {
      navigation.navigate('OnboardingUsername', {
        authMechanism,
        authMethod: 'Wallet',
        email,
      });
    }
  }, [authMechanism, email, navigation]);

  const handleContinue = useCallback(() => {
    if (authMethod === 'Email') {
      handleContinueEmailFlow();
    } else {
      handleContinueWalletFlow();
    }
  }, [authMethod, handleContinueEmailFlow, handleContinueWalletFlow]);

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
              Add your email
            </Typography>
          </View>

          <View />
        </View>

        <OnboardingProgressBar from={0} to={20} />
      </View>
      <View
        className="flex-1 justify-center items-center space-y-12 px-8"
        style={{
          marginBottom: bottom,
        }}
      >
        <OnboardingTextInput
          autoFocus
          placeholder="your@email.com"
          keyboardType="email-address"
          autoComplete="email"
          value={email}
          onChange={(e) => handleEmailChange(e.nativeEvent.text)}
        />
        <View className="space-y-4 w-full">
          <Suspense
            fallback={
              <Button
                eventElementId="Submit Email Button"
                eventName="Sign In Attempt"
                eventContext={contexts.Onboarding}
                className="w-full"
                text="Next"
              />
            }
          >
            <SubmitEmailButton
              authMethod={authMethod}
              email={email}
              onSubmit={handleContinue}
              onErrorMessage={setError}
              isLoggingIn={isLoggingIn}
            />
          </Suspense>

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
            {error ? error : 'You will receive an email with a link to verify your account'}
          </Typography>
        </View>
        <View />
      </View>
    </View>
  );
}

type SubmitEmailButtonProps = {
  authMethod: 'Email' | 'Wallet';
  email: string;
  onSubmit: () => void;
  onErrorMessage: (message: string) => void;
  isLoggingIn: boolean;
};

function SubmitEmailButton({
  authMethod,
  email,
  onErrorMessage,
  onSubmit,
  isLoggingIn,
}: SubmitEmailButtonProps) {
  const debouncedEmail = useDebounce(email, 500);

  const query = useLazyLoadQuery<OnboardingEmailScreenQuery>(
    graphql`
      query OnboardingEmailScreenQuery($emailAddress: Email!) {
        isEmailAddressAvailable(emailAddress: $emailAddress)
      }
    `,
    {
      emailAddress: debouncedEmail,
    }
  );

  const isInvalidEmail = useMemo(() => {
    return !EMAIL_FORMAT.test(email);
  }, [email]);

  const handleSubmit = useCallback(() => {
    if (isInvalidEmail) {
      onErrorMessage(
        "That doesn't look like a valid email address. Please double-check and try again"
      );
      return;
    }

    const isEmailAddressAvailable = query.isEmailAddressAvailable ?? false;

    if (!isEmailAddressAvailable && authMethod === 'Wallet') {
      onErrorMessage('This email address is already in use');
      return;
    }

    onSubmit();
  }, [authMethod, isInvalidEmail, onErrorMessage, onSubmit, query.isEmailAddressAvailable]);

  return (
    <Button
      eventElementId="Submit Email Button"
      eventName="Sign In Attempt"
      eventContext={contexts.Onboarding}
      className={clsx(
        'w-full',
        email.length > 0 && 'opacity-100',
        email.length === 0 && 'opacity-0'
      )}
      loading={isLoggingIn}
      onPress={handleSubmit}
      variant={isInvalidEmail ? 'disabled' : 'primary'}
      text="Next"
    />
  );
}

export function OnboardingEmailScreen() {
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
