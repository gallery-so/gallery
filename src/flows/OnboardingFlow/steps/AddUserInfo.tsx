import { useCallback, useEffect } from 'react';
import { WizardContext } from 'react-albus';
import styled from 'styled-components';
import { useWizardCallback } from 'contexts/wizard/WizardCallbackContext';
import UserInfoForm from 'components/Profile/UserInfoForm';
import FullPageCenteredStep from 'flows/shared/components/FullPageCenteredStep/FullPageCenteredStep';
import ErrorText from 'components/core/Text/ErrorText';

import useUserInfoForm from 'components/Profile/useUserInfoForm';
import { useTrack } from 'contexts/analytics/AnalyticsContext';
import { useWizardValidationActions } from 'contexts/wizard/WizardValidationContext';
import { useWizardState } from 'contexts/wizard/WizardDataProvider';
import { VStack } from 'components/core/Spacer/Stack';

type ConfigProps = {
  onNext: () => Promise<void>;
};

function useWizardConfig({ onNext }: ConfigProps) {
  const { setOnNext } = useWizardCallback();

  useEffect(() => {
    setOnNext(onNext);
  }, [setOnNext, onNext]);
}

function AddUserInfo({ next }: WizardContext) {
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
    onSuccess: next,
    userId: undefined,
    existingUsername: '',
  });

  const { setNextEnabled } = useWizardValidationActions();

  useEffect(() => {
    setNextEnabled(isUsernameValid);
  }, [isUsernameValid, setNextEnabled]);

  const track = useTrack();

  const { handleRefreshNfts } = useWizardState();

  const handleSubmit = useCallback(async () => {
    const { success } = await onEditUser();
    if (success) {
      track('Save Name & Bio', { added_bio: bio.length > 0 });
      // begin pre-fetching NFTs for user before they get to the collection editor phase
      handleRefreshNfts();
    }
  }, [bio.length, handleRefreshNfts, onEditUser, track]);

  useWizardConfig({ onNext: handleSubmit });

  return (
    <FullPageCenteredStep withFooter>
      <VStack gap={8}>
        <StyledUserInfoForm
          mode="Add"
          onSubmit={handleSubmit}
          username={username}
          usernameError={usernameError}
          onUsernameChange={onUsernameChange}
          bio={bio}
          onBioChange={onBioChange}
        />
        <ErrorContainer>
          <ErrorText message={generalError} />
        </ErrorContainer>
      </VStack>
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
