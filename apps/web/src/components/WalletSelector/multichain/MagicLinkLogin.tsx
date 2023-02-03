import { useCallback, useMemo, useState } from 'react';
import styled from 'styled-components';

import { Button } from '~/components/core/Button/Button';
import colors from '~/components/core/colors';
import { HStack, VStack } from '~/components/core/Spacer/Stack';
import { Spinner } from '~/components/core/Spinner/Spinner';
import ErrorText from '~/components/core/Text/ErrorText';
import { BaseM, TitleS } from '~/components/core/Text/Text';
import { EmptyState } from '~/components/EmptyState/EmptyState';
import { useTrackSignInSuccess } from '~/contexts/analytics/authUtil';
import { useAuthActions } from '~/contexts/auth/AuthContext';
import useMagicLogin from '~/hooks/useMagicLink';
import { EMAIL_FORMAT } from '~/utils/regex';

import useLoginOrRedirectToOnboarding from '../mutations/useLoginOrRedirectToOnboarding';

type Props = {
  reset: () => void;
};

export default function MagicLinkLogin({ reset }: Props) {
  const sendMagicLink = useMagicLogin();
  const [loginOrRedirectToOnboarding] = useLoginOrRedirectToOnboarding();
  const { handleLogin } = useAuthActions();
  const trackSignInSuccess = useTrackSignInSuccess();
  const [email, setEmail] = useState('');
  const [clickedSendLink, setClickedSendLink] = useState(false);
  const [attemptingSignIn, setIsAttemptingSignIn] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleInputChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(event.target?.value);
  }, []);
  const handleSendClick = useCallback(async () => {
    setErrorMessage('');
    setClickedSendLink(true);

    try {
      // send Magic Link email and wait for user to click link
      const token = await sendMagicLink(email);

      if (token === null) {
        throw new Error('Invalid token'); // `sendMagicLink` resolves and returns a token if the magic link is opened, so if the token is null it most likely is an issue with the magic link api which should be rare
      }

      setIsAttemptingSignIn(true);
      // we can't use isMutating because we want a single state to represent waiting for both loginOrRedirectToOnboarding and handleLogin to resolve

      // attempt sign in using the Magic Link token
      const userId = await loginOrRedirectToOnboarding({
        authMechanism: {
          mechanism: {
            magicLink: {
              token,
            },
          },
        },
        userExists: true,
      });

      if (userId) {
        trackSignInSuccess('Magic Link');
        return await handleLogin(userId);
      } else {
        throw new Error('Invalid token');
      }
    } catch (error: unknown) {
      setErrorMessage(
        'Login failed. Please ensure that the email address is associated with an existing Gallery user.'
      );
      setIsAttemptingSignIn(false);
      setClickedSendLink(false);
    }
  }, [email, handleLogin, loginOrRedirectToOnboarding, sendMagicLink, trackSignInSuccess]);

  const isValidEmail = useMemo(() => EMAIL_FORMAT.test(email), [email]);

  if (clickedSendLink) {
    return (
      <EmptyState title="">
        {attemptingSignIn ? (
          <VStack gap={8} align="center">
            <BaseM>Signing in...</BaseM>
            <Spinner />
          </VStack>
        ) : (
          <>
            <VStack gap={8} align="center">
              <TitleS>Check your email (Keep this tab open!)</TitleS>
              <Icon src="/icons/delegate_cash_logo.svg" />
            </VStack>
            <VStack gap={8}>
              <BaseM>
                We emailed a magic link to <strong>{email}</strong>.
              </BaseM>

              <BaseM>Open the link on any device and it'll automatically sign you in here.</BaseM>
            </VStack>
          </>
        )}
      </EmptyState>
    );
  }

  return (
    <EmptyState title="">
      <VStack gap={24}>
        <TitleS>Sign in via Magic Link</TitleS>
        <VStack gap={8}>
          <StyledText>
            If you are an existing Gallery user with a verified email address, you can sign in using
            a magic link delivered to your inbox.
          </StyledText>
          <StyledText>
            To continue, enter your verified email address and follow the instructions in the email.
          </StyledText>
        </VStack>
        <VStack gap={8}>
          <StyledInput
            onChange={handleInputChange}
            placeholder="Email"
            autoFocus
            defaultValue={email}
          />
          {errorMessage && <StyledErrorText message={errorMessage} />}
          <HStack gap={8} justify="flex-end">
            <Button variant="secondary" onClick={reset}>
              Back
            </Button>
            <Button onClick={handleSendClick} disabled={!isValidEmail || clickedSendLink}>
              Send Magic Link
            </Button>
          </HStack>
        </VStack>
      </VStack>
    </EmptyState>
  );
}

const StyledText = styled(BaseM)`
  text-align: left;
`;

const StyledInput = styled.input`
  border: 0;
  background-color: ${colors.faint};
  padding: 6px 12px;
  width: 100%;
  height: 32px;
`;

const StyledErrorText = styled(ErrorText)`
  text-align: left;
`;

const Icon = styled.img`
  width: 24px;
  height: 24px;
  margin: 5px;
`;
