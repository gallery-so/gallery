import { useRouter } from 'next/router';
import { useCallback, useMemo, useState } from 'react';
import { graphql, useLazyLoadQuery } from 'react-relay';
import { useReportError } from 'shared/contexts/ErrorReportingContext';
import useCreateUser from 'shared/hooks/useCreateUser';
import useDebounce from 'shared/hooks/useDebounce';
import useUpdateEmail from 'shared/hooks/useUpdateEmail';
import useUpdateUser from 'shared/hooks/useUpdateUser';
import { useIsUsernameAvailableFetcher } from 'shared/hooks/useUserInfoFormIsUsernameAvailableQuery';
import styled from 'styled-components';

import Input from '~/components/core/Input/Input';
import { HStack, VStack } from '~/components/core/Spacer/Stack';
import { TitleDiatypeM } from '~/components/core/Text/Text';
import useUpdateProfileImage from '~/components/NftSelector/useUpdateProfileImage';
import FullPageCenteredStep from '~/components/Onboarding/FullPageCenteredStep';
import { OnboardingFooter } from '~/components/Onboarding/OnboardingFooter';
import { useTrackCreateUserSuccess } from '~/contexts/analytics/authUtil';
import { OnboardingAddUsernamePageQuery } from '~/generated/OnboardingAddUsernamePageQuery.graphql';
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

const onboardingStepName = 'add-username';

export function OnboardingAddUsernamePage() {
  const query = useLazyLoadQuery<OnboardingAddUsernamePageQuery>(
    graphql`
      query OnboardingAddUsernamePageQuery {
        viewer {
          ... on Viewer {
            user {
              __typename
              dbid
              username
              bio
              profileImage {
                __typename
              }
            }
          }
        }
      }
    `,
    {}
  );

  const user = query?.viewer?.user;

  const [username, setUsername] = useState(user?.username || '');
  const debouncedUsername = useDebounce(username, 500);

  const [usernameError, setUsernameError] = useState('');
  const isUsernameAvailableFetcher = useIsUsernameAvailableFetcher();
  const createUser = useCreateUser();
  const updateUser = useUpdateUser();
  const authPayloadQuery = useAuthPayloadQuery();
  const trackCreateUserSuccess = useTrackCreateUserSuccess(
    authPayloadQuery?.userFriendlyWalletName
  );
  const { setProfileImage } = useUpdateProfileImage();
  const { isLocked, syncTokens } = useSyncTokens();
  const { push } = useRouter();
  const updateEmail = useUpdateEmail();
  const reportError = useReportError();

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

    try {
      // it doesn't make sense to tell users their current username is taken!
      if (user?.username && debouncedUsername === user.username) {
        if (
          user?.profileImage?.__typename === 'TokenProfileImage' ||
          user?.profileImage?.__typename === 'EnsProfileImage'
        ) {
          push({ pathname: '/onboarding/add-user-info' });
        } else {
          push({ pathname: '/onboarding/add-profile-picture' });
        }
        return;
      }

      const isUsernameAvailable = await isUsernameAvailableFetcher(username);
      if (!isUsernameAvailable) {
        setUsernameError('Username is already taken');
        return;
      }

      // If existing user, update username
      if (user?.username) {
        await updateUser(user.dbid, username, user.bio || '');
        push({ pathname: '/onboarding/add-user-info' });
        return;
      }

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

        if (!isLocked) {
          // Start the sync tokens mutation so the user
          // sees their NFTs loaded ASAP.
          syncTokens({ type: 'Collected', chain: ['Ethereum', 'Zora', 'Base'], silent: true });
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
          push({ pathname: '/onboarding/add-user-info' });
        } else {
          push({ pathname: '/onboarding/add-profile-picture' });
        }
      }
    } catch (error) {
      if (error instanceof Error) {
        reportError(error);
      } else {
        reportError('Uncaught error in creating user');
      }
    }
  }, [
    authPayloadQuery,
    createUser,
    debouncedUsername,
    isLocked,
    isUsernameAvailableFetcher,
    push,
    reportError,
    setProfileImage,
    syncTokens,
    trackCreateUserSuccess,
    updateEmail,
    updateUser,
    user,
    username,
  ]);

  return (
    <VStack>
      <FullPageCenteredStep stepName={onboardingStepName}>
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
        step={onboardingStepName}
        onNext={handleContinue}
        isNextEnabled={isNextEnabled}
      />
    </VStack>
  );
}

const Container = styled(VStack)`
  width: 480px;
`;
