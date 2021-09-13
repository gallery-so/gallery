import { useCallback, useEffect } from 'react';
import { WizardContext } from 'react-albus';
import styled from 'styled-components';
import { useWizardCallback } from 'contexts/wizard/WizardCallbackContext';
import UserInfoForm from 'components/Profile/UserInfoForm';
import FullPageCenteredStep from 'flows/shared/components/FullPageCenteredStep/FullPageCenteredStep';
import ErrorText from 'components/core/Text/ErrorText';
import Spacer from 'components/core/Spacer/Spacer';

import useUserInfoForm from 'components/Profile/useUserInfoForm';
import { useAuthenticatedUser } from 'hooks/api/users/useUser';
import Mixpanel from 'utils/mixpanel';

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
  const user = useAuthenticatedUser();

  const {
    username,
    onUsernameChange,
    usernameError,
    onClearUsernameError,
    bio,
    onBioChange,
    generalError,
    onEditUser,
  } = useUserInfoForm({
    onSuccess: next,
    userId: user.id,
    existingUsername: user.username,
    existingBio: user.bio,
  });

  const handleSubmit = useCallback(() => {
    Mixpanel.track('Save Name & Bio', { 'Added Bio': bio.length > 0 });
    return onEditUser();
  }, [bio.length, onEditUser]);

  useWizardConfig({ onNext: handleSubmit });

  return (
    <FullPageCenteredStep withFooter>
      <StyledUserInfoForm
        onSubmit={handleSubmit}
        username={username}
        usernameError={usernameError}
        clearUsernameError={onClearUsernameError}
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
