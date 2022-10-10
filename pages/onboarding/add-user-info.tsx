import { useCallback } from 'react';
import styled from 'styled-components';
import UserInfoForm from 'components/Profile/UserInfoForm';
import ErrorText from 'components/core/Text/ErrorText';

import useUserInfoForm from 'components/Profile/useUserInfoForm';
import { useTrack } from 'contexts/analytics/AnalyticsContext';
import { VStack } from 'components/core/Spacer/Stack';
import { useRouter } from 'next/router';
import { OnboardingFooter } from 'components/Onboarding/OnboardingFooter';
import useSyncTokens from 'hooks/api/tokens/useSyncTokens';
import { getStepUrl } from 'components/Onboarding/constants';
import FullPageCenteredStep from 'components/Onboarding/FullPageCenteredStep';

function AddUserInfo() {
  const { push, back, query } = useRouter();

  const handleFormSuccess = useCallback(() => {
    // After we've created an account, we can remove these
    // params from the URL since we won't need them
    // and it looks better if the URL is clean
    const nextParams = { ...query };
    delete nextParams.signature;
    delete nextParams.nonce;
    delete nextParams.chain;
    delete nextParams.address;
    delete nextParams.authMechanism;
    delete nextParams.userFriendlyWalletName;

    push({ pathname: getStepUrl('create') });
  }, [push, query]);

  const {
    bio,
    username,
    onEditUser,
    onBioChange,
    generalError,
    usernameError,
    isUsernameValid,
    onUsernameChange,
  } = useUserInfoForm({
    existingBio: '',
    onSuccess: handleFormSuccess,
    userId: undefined,
    existingUsername: '',
  });

  const track = useTrack();
  const { isLocked, syncTokens } = useSyncTokens();

  const handleSubmit = useCallback(async () => {
    const { success } = await onEditUser();

    if (!success) {
      return;
    }

    track('Save Name & Bio', { added_bio: bio.length > 0 });

    if (!isLocked) {
      // Start the sync tokens mutation so the user
      // sees their NFTs loaded ASAP.
      syncTokens();
    }
  }, [bio.length, isLocked, onEditUser, syncTokens, track]);

  return (
    <VStack>
      <FullPageCenteredStep withFooter>
        <VStack gap={8}>
          <StyledUserInfoForm
            bio={bio}
            mode="Add"
            onSubmit={handleSubmit}
            username={username}
            usernameError={usernameError}
            onUsernameChange={onUsernameChange}
            onBioChange={onBioChange}
          />
          <ErrorContainer>
            <ErrorText message={generalError} />
          </ErrorContainer>
        </VStack>
      </FullPageCenteredStep>

      <OnboardingFooter
        step={'add-user-info'}
        onNext={handleSubmit}
        isNextEnabled={isUsernameValid}
        onPrevious={back}
      />
    </VStack>
  );
}

const StyledUserInfoForm = styled(UserInfoForm)`
  width: 600px;
`;

const ErrorContainer = styled.div`
  width: 600px;
`;

export default AddUserInfo;
