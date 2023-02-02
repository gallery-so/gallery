import { useCallback, useMemo, useState } from 'react';
import styled from 'styled-components';

import { Button } from '~/components/core/Button/Button';
import colors from '~/components/core/colors';
import { HStack, VStack } from '~/components/core/Spacer/Stack';
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
  const [email, setEmail] = useState('');
  const sendMagicLink = useMagicLogin();
  const loginOrRedirectToOnboarding = useLoginOrRedirectToOnboarding();
  const { handleLogin } = useAuthActions();
  const trackSignInSuccess = useTrackSignInSuccess();
  const handleInputChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(event.target?.value);
  }, []);

  const handleSendClick = useCallback(async () => {
    const token = await sendMagicLink(email);

    if (token === null) {
      return; // handle error
    }

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
      return await handleLogin(userId, ''); // todo: see if address is necessary anymore
    }
  }, [email, handleLogin, loginOrRedirectToOnboarding, sendMagicLink, trackSignInSuccess]);

  const isValidEmail = useMemo(() => EMAIL_FORMAT.test(email), [email]);

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
          ></StyledInput>
          <HStack gap={8} justify="flex-end">
            <Button variant="secondary" onClick={reset}>
              Back
            </Button>
            <Button onClick={handleSendClick} disabled={!isValidEmail}>
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
