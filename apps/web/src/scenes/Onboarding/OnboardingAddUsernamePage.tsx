import { useRouter } from 'next/router';
import { useCallback, useMemo, useState } from 'react';
import useCreateUser from 'shared/hooks/useCreateUser';
import useUpdateEmail from 'shared/hooks/useUpdateEmail';
import { useIsUsernameAvailableFetcher } from 'shared/hooks/useUserInfoFormIsUsernameAvailableQuery';
import styled from 'styled-components';

import Input from '~/components/core/Input/Input';
import { HStack, VStack } from '~/components/core/Spacer/Stack';
import { TitleDiatypeM } from '~/components/core/Text/Text';
import useUpdateProfileImage from '~/components/NftSelector/useUpdateProfileImage';
import FullPageCenteredStep from '~/components/Onboarding/FullPageCenteredStep';
import { OnboardingFooter } from '~/components/Onboarding/OnboardingFooter';
import { useTrackCreateUserSuccess } from '~/contexts/analytics/authUtil';
import useSyncTokens from '~/hooks/api/tokens/useSyncTokens';
import useAuthPayloadQuery from '~/hooks/api/users/useAuthPayloadQuery';
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
  const createUser = useCreateUser();
  const authPayloadQuery = useAuthPayloadQuery();
  const trackCreateUserSuccess = useTrackCreateUserSuccess(
    authPayloadQuery?.userFriendlyWalletName
  );
  const { setProfileImage } = useUpdateProfileImage();
  const { isLocked, syncTokens } = useSyncTokens();
  const { push } = useRouter();
  const updateEmail = useUpdateEmail();

  const handleUsernameChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    setUsername(event.target.value);
    setUsernameError('');
  }, []);

  const isNextEnabled = useMemo(() => {
    return Boolean(username) && !usernameError;
  }, [username, usernameError]);

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

    try {
      // If new user, create user
      if (!authPayloadQuery) {
        throw new Error('Auth signature for creating user not found');
      }
      const response = await createUser(authPayloadQuery, username, '');
      trackCreateUserSuccess();

      if (response.createUser?.__typename === 'CreateUserPayload') {
        const user = response.createUser.viewer?.user;

        if (authPayloadQuery.authMechanismType === 'eoa' && authPayloadQuery.email) {
          // Attach the email to the user
          updateEmail(authPayloadQuery.email);
        }

        const ensAddress = user?.potentialEnsProfileImage?.wallet?.chainAddress;

        // If the user has an ENS address, set the profile image to the ENS address
        if (ensAddress) {
          const { address, chain } = ensAddress || {};

          if (!address || !chain || chain !== 'Ethereum') return;
          setProfileImage({
            walletAddress: {
              address,
              chain,
            },
          });
        }

        if (!isLocked) {
          // Start the sync tokens mutation so the user
          // sees their NFTs loaded ASAP.
          syncTokens({ type: 'Collected', chain: ['Ethereum', 'Zora', 'Base'], silent: true });
        }

        push({ pathname: '/onboarding/add-user-info' });

        // if wallet user
        // If email user
      }

      // If existing user, update username
    } catch (error) {}
  }, [
    authPayloadQuery,
    createUser,
    isLocked,
    isUsernameAvailableFetcher,
    push,
    setProfileImage,
    syncTokens,
    trackCreateUserSuccess,
    updateEmail,
    username,
  ]);

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
