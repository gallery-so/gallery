import { useCallback } from 'react';
import styled from 'styled-components';
import UserInfoForm from 'components/Profile/UserInfoForm';
import FullPageCenteredStep from 'flows/../../src/components/Onboarding/FullPageCenteredStep/FullPageCenteredStep';
import ErrorText from 'components/core/Text/ErrorText';

import useUserInfoForm from 'components/Profile/useUserInfoForm';
import { useTrack } from 'contexts/analytics/AnalyticsContext';
import { VStack } from 'components/core/Spacer/Stack';
import { useRouter } from 'next/router';
import { OnboardingFooter } from 'flows/../../src/components/Onboarding/WizardFooter/OnboardingFooter';

function AddUserInfo() {
  const { push, query, back } = useRouter();

  const handleFormSuccess = useCallback(() => {
    push('/onboarding/create', { query: { ...query } });
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

  const handleSubmit = useCallback(async () => {
    const { success } = await onEditUser();
    if (success) {
      track('Save Name & Bio', { added_bio: bio.length > 0 });

      // begin pre-fetching NFTs for user before they get to the collection editor phase
      // TODO(Terence): Figure out a way to store a preloaded query in context
      // handleRefreshNfts();
    }
  }, [bio.length, onEditUser, track]);

  return (
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

      <OnboardingFooter
        step={'add-user-info'}
        onNext={handleSubmit}
        isNextEnabled={isUsernameValid}
        onPrevious={back}
      />
    </FullPageCenteredStep>
  );
}

const StyledUserInfoForm = styled(UserInfoForm)`
  width: 600px;
`;

const ErrorContainer = styled.div`
  width: 600px;
`;

export default AddUserInfo;
