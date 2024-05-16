/* eslint-disable no-console */
import { useLoginWithEmail, usePrivy } from '@privy-io/expo';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import clsx from 'clsx';
import { Suspense, useCallback, useEffect, useMemo, useState } from 'react';
import { KeyboardAvoidingView, Platform, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { graphql, useLazyLoadQuery } from 'react-relay';
import useDebounce from 'shared/hooks/useDebounce';

import { BackButton } from '~/components/BackButton';
import { OnboardingProgressBar } from '~/components/Onboarding/OnboardingProgressBar';
import { OnboardingTextInput } from '~/components/Onboarding/OnboardingTextInput';
import { OnboardingEmailScreenQuery } from '~/generated/OnboardingEmailScreenQuery.graphql';
import {
  AuthMethodTitle,
  LoginStackNavigatorParamList,
  LoginStackNavigatorProp,
} from '~/navigation/types';
import { contexts } from '~/shared/analytics/constants';
import { useTrack } from '~/shared/contexts/AnalyticsContext';
import { useReportError } from '~/shared/contexts/ErrorReportingContext';
import { EMAIL_FORMAT } from '~/shared/utils/regex';

import { Button } from '../../components/Button';
import { Typography } from '../../components/Typography';

const FALLBACK_ERROR_MESSAGE = `Something unexpected went wrong while logging in. We've been notified and are looking into it`;

/**
 * There are three entrypoints into this screen:
 * 1) Email auth. User has opted to log in or sign up with email
 * 2) Wallet auth. User has authenticated through Coinbase or WalletConnect and we're additionally collecting their email
 * 3) Farcaster auth. User has authenticated through Farcaster and we're additionally collecting their email
 *
 * In all of these cases, we'll want the user to go through 2FA via Privy.
 */
function InnerOnboardingEmailScreen() {
  const [email, setEmail] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const navigation = useNavigation<LoginStackNavigatorProp>();
  const route = useRoute<RouteProp<LoginStackNavigatorParamList, 'OnboardingEmail'>>();

  const authMethod = route.params.authMethod;
  const authMechanism = route.params.authMechanism;
  const farcasterUsername = route.params.farcasterUsername;

  const { bottom } = useSafeAreaInsets();

  const [error, setError] = useState('');

  const reportError = useReportError();
  const track = useTrack();

  const handleEmailChange = useCallback((text: string) => {
    setError('');
    setEmail(text);
  }, []);

  const { sendCode, loginWithCode } = useLoginWithEmail({
    onSendCodeSuccess() {
      // TODO: track this. not a blocker
      console.log('successfully sent code');
    },
    onLoginSuccess(user) {
      // TODO: track this. not a blocker
      console.log('login success:', user);
    },
    onError(error) {
      // TODO: track this. not a blocker
      console.log('login error:', error);
    },
  });

  const handleContinueTo2FA = useCallback(async () => {
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

      const { success } = await sendCode({ email });

      if (!success) {
        throw new Error('Error sending 2FA code to email address');
      }

      // on the next screen we'll either log the user in or create a new account
      if (authMethod === 'Privy') {
        navigation.navigate('Onboarding2FA', {
          authMethod: 'Privy',
          authMechanism: {
            authMechanismType: 'privy',
          },
          email,
          loginWithCode,
        });
      }

      // a wallet-login user will only end up here if they're a new user
      // a farcaster-login user will only end up here if they're a new user
      if (authMechanism && (authMethod === 'Wallet' || authMethod === 'Farcaster')) {
        navigation.navigate('Onboarding2FA', {
          authMethod,
          authMechanism,
          loginWithCode,
          email,
          farcasterUsername,
        });
      }
    } catch (error) {
      if (error instanceof Error) {
        handleLoginError({
          message: error.message || FALLBACK_ERROR_MESSAGE,
          underlyingError: error,
        });
      }
    } finally {
      setIsLoggingIn(false);
    }
  }, [
    authMechanism,
    authMethod,
    email,
    loginWithCode,
    navigation,
    reportError,
    sendCode,
    track,
    farcasterUsername,
  ]);

  const handleBack = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  const { logout: logoutOfPrivy } = usePrivy();

  useEffect(() => {
    // ensures fresh start. this will throw a warning if the user is already logged out,
    // which we can safely ignore
    logoutOfPrivy();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
              Your email
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
          {/* This suspense boundary is needed as the SubmitEmailButton makes
              a lazy request to the server upon each character input to
              check whether the email address is available. We leave the
              variant `disabled` to prevent it from flashing to primary
              when the fallback is revealed. */}
          <Suspense
            fallback={
              <Button
                eventElementId="Submit Email Button"
                eventName="Sign In Attempt"
                eventContext={contexts.Onboarding}
                className="w-full"
                text="Next"
                variant="disabled"
              />
            }
          >
            <SubmitEmailButton
              authMethod={authMethod}
              email={email}
              onSubmit={handleContinueTo2FA}
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
  authMethod: AuthMethodTitle;
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
