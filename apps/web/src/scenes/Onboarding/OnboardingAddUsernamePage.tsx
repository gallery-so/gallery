import { useCallback, useMemo, useState } from 'react';
import { useIsUsernameAvailableFetcher } from 'shared/hooks/useUserInfoFormIsUsernameAvailableQuery';
import styled from 'styled-components';

import Input from '~/components/core/Input/Input';
import { HStack, VStack } from '~/components/core/Spacer/Stack';
import { TitleDiatypeM } from '~/components/core/Text/Text';
import FullPageCenteredStep from '~/components/Onboarding/FullPageCenteredStep';
import { OnboardingFooter } from '~/components/Onboarding/OnboardingFooter';
import {
  alphanumericUnderscores,
  maxLength,
  minLength,
  noConsecutivePeriodsOrUnderscores,
  required,
  validate,
} from '~/shared/utils/validators';

export function OnboardingAddUsernamePage() {
  const [username, setUsername] = useState('');
  const [usernameError, setUsernameError] = useState('');
  const isUsernameAvailableFetcher = useIsUsernameAvailableFetcher();

  const handleUsernameChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    setUsername(event.target.value);
    setUsernameError('');
  }, []);

  const isNextEnabled = useMemo(() => {
    return Boolean(username) && !usernameError;
  }, [username]);

  const handleContinue = useCallback(async () => {
    const clientSideUsernameError = validate(username, [
      required,
      minLength(2),
      maxLength(20),
      alphanumericUnderscores,
      noConsecutivePeriodsOrUnderscores,
    ]);

    if (clientSideUsernameError) {
      setUsernameError(clientSideUsernameError);

      return;
    } else {
      setUsernameError('');
    }

    const isUsernameAvailable = await isUsernameAvailableFetcher(username);
    if (!isUsernameAvailable) {
      setUsernameError('Username is already taken');
      return;
    }
  }, [isUsernameAvailableFetcher, username]);

  return (
    <VStack>
      <FullPageCenteredStep from={10} to={40}>
        <Container gap={16}>
          <TitleDiatypeM>Pick a username</TitleDiatypeM>

          <HStack gap={16} align="center">
            <Input
              onChange={handleUsernameChange}
              placeholder="username"
              defaultValue={username}
              errorMessage={usernameError}
              autoFocus
              variant="grande"
            />
          </HStack>
        </Container>
      </FullPageCenteredStep>
      <OnboardingFooter
        step={'add-username'}
        onNext={handleContinue}
        isNextEnabled={isNextEnabled}
      />
    </VStack>
  );
}

const Container = styled(VStack)`
  width: 480px;
`;
