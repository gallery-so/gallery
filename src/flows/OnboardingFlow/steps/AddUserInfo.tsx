import { useCallback, useEffect } from 'react';
import { WizardContext } from 'react-albus';
import styled from 'styled-components';
import { useWizardCallback } from 'contexts/wizard/WizardCallbackContext';
import UserInfoForm from 'components/Profile/UserInfoForm';
import FullPageCenteredStep from 'flows/shared/components/FullPageCenteredStep/FullPageCenteredStep';
import ErrorText from 'components/core/Text/ErrorText';
import Spacer from 'components/core/Spacer/Spacer';

import useUserInfoForm from 'components/Profile/useUserInfoForm';
import { useTrack } from 'contexts/analytics/AnalyticsContext';

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
  const { username, onUsernameChange, usernameError, bio, onBioChange, generalError, onEditUser } =
    useUserInfoForm({
      onSuccess: next,
      userId: undefined,
      existingUsername: '',
      existingBio: '',
    });

  const track = useTrack();

  const handleSubmit = useCallback(async () => {
    track('Save Name & Bio', { added_bio: bio.length > 0 });
    return onEditUser();
  }, [bio.length, onEditUser, track]);

  useWizardConfig({ onNext: handleSubmit });

  return (
    <FullPageCenteredStep withFooter>
      <StyledUserInfoForm
        mode="Add"
        onSubmit={handleSubmit}
        username={username}
        usernameError={usernameError}
        onUsernameChange={onUsernameChange}
        bio={bio}
        onBioChange={onBioChange}
      />
      <Spacer height={8} />
      <ErrorContainer>
        <ErrorText message={generalError} />
      </ErrorContainer>
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
