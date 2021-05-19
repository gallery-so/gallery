import { useEffect } from 'react';
import { WizardContext } from 'react-albus';
import styled from 'styled-components';
import { useWizardCallback } from 'contexts/wizard/WizardCallbackContext';
import UserInfoForm from 'components/Profile/UserInfoForm';
import FullPageCenteredStep from 'flows/shared/components/FullPageCenteredStep/FullPageCenteredStep';
import ErrorText from 'components/core/Text/ErrorText';
import Spacer from 'components/core/Spacer/Spacer';

import useUserInfoForm from 'components/Profile/useUserInfoForm';

type ConfigProps = {
  onNext: () => Promise<void>;
};

function useWizardConfig({ onNext }: ConfigProps) {
  const { setOnNext } = useWizardCallback();

  useEffect(() => {
    setOnNext(onNext);

    return () => setOnNext(undefined);
  }, [setOnNext, onNext]);
}

function AddUserInfo({ next }: WizardContext) {
  const {
    username,
    onUsernameChange,
    usernameError,
    onClearUsernameError,
    bio,
    onBioChange,
    generalError,
    onEditUser,
  } = useUserInfoForm({ onSuccess: next });

  useWizardConfig({ onNext: onEditUser });

  return (
    <FullPageCenteredStep withFooter>
      <StyledUserInfoForm
        onSubmit={onEditUser}
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
