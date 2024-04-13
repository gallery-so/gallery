import { useRouter } from 'next/router';
import { useCallback, useMemo, useState } from 'react';
import colors from 'shared/theme/colors';
import styled from 'styled-components';

import { Button } from '~/components/core/Button/Button';
import { SlimInput } from '~/components/core/Input/Input';
import { HStack, VStack } from '~/components/core/Spacer/Stack';
import { Spinner } from '~/components/core/Spinner/Spinner';
import ErrorText from '~/components/core/Text/ErrorText';
import { BaseM, BaseS, TitleS } from '~/components/core/Text/Text';
import { EmptyState } from '~/components/EmptyState/EmptyState';
import { useTrackSignInSuccess } from '~/contexts/analytics/authUtil';
import useMagicLogin from '~/hooks/useMagicLink';
import { MagicLinkIcon } from '~/icons/MagicLinkIcon';
import { contexts } from '~/shared/analytics/constants';
import { EMAIL_FORMAT } from '~/shared/utils/regex';

import useLoginOrRedirectToOnboarding from '../mutations/useLoginOrRedirectToOnboarding';

export default function MagicLinkLogin() {
  const sendMagicLink = useMagicLogin();
  const [loginOrRedirectToOnboarding] = useLoginOrRedirectToOnboarding();
  const trackSignInSuccess = useTrackSignInSuccess();
  const { push } = useRouter();

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

    let magicLinkToken: string | null = null;

    try {
      // send Magic Link email and wait for user to click link
      magicLinkToken = await sendMagicLink(email);

      if (magicLinkToken === null) {
        throw new Error('Invalid token'); // `sendMagicLink` resolves and returns a token if the magic link is opened, so if the token is null it most likely is an issue with the magic link api which should be rare
      }

      setIsAttemptingSignIn(true);
      // we can't use isMutating because we want a single state to represent waiting for both loginOrRedirectToOnboarding and handleLogin to resolve

      // attempt sign in using the Magic Link token
      const userId = await loginOrRedirectToOnboarding({
        authMechanism: {
          mechanism: {
            magicLink: {
              token: magicLinkToken,
            },
          },
        },
        userExists: true,
      });

      if (userId) {
        trackSignInSuccess('Magic Link');
      } else {
        throw new Error('Invalid token');
      }
    } catch (error: unknown) {
      if (magicLinkToken) {
        push({
          pathname: '/onboarding/welcome',
          query: {
            authMechanismType: 'magicLink',
            token: magicLinkToken,
            userFriendlyWalletName: 'unknown',
          },
        });
      }
      setIsAttemptingSignIn(false);
      setClickedSendLink(false);
    }
  }, [email, loginOrRedirectToOnboarding, push, sendMagicLink, trackSignInSuccess]);

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
              <TitleS>Almost there – keep this tab open!</TitleS>
            </VStack>
            <VStack gap={8}>
              <BaseM>
                We sent a magic link to <strong>{email}</strong>. Open the link on any device and
                you&#39;ll be signed in here.
              </BaseM>
            </VStack>
          </>
        )}
      </EmptyState>
    );
  }

  return (
    <VStack gap={24}>
      <form>
        <VStack gap={12}>
          <SlimInput
            onChange={handleInputChange}
            placeholder="your@email.com"
            autoFocus
            defaultValue={email}
          />
          {errorMessage && <StyledErrorText message={errorMessage} />}
          <Button
            eventElementId="Send Magic Link Button"
            eventName="Send Magic Link Login"
            eventContext={contexts.Authentication}
            onClick={handleSendClick}
            disabled={!isValidEmail || clickedSendLink}
            type="submit"
          >
            Submit
          </Button>
        </VStack>
      </form>

      <HStack gap={16} align="center" justify="center">
        <BaseS color={colors.metal}>Secured by</BaseS>
        <MagicLinkIcon />
      </HStack>
    </VStack>
  );
}

const StyledErrorText = styled(ErrorText)`
  text-align: left;
`;
