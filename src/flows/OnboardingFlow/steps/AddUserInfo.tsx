import { useCallback, useEffect, useState } from 'react';
import { WizardContext } from 'react-albus';
import styled from 'styled-components';
import { useWizardCallback } from 'contexts/wizard/WizardCallbackContext';
import UserInfoForm from 'components/Profile/UserInfoForm';
import FullPageCenteredStep from 'flows/shared/components/FullPageCenteredStep/FullPageCenteredStep';
import { pause } from 'utils/time';
import { USERNAME_REGEX } from 'utils/regex';

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
  const [username, setUsername] = useState('');
  const [bio, setBio] = useState('');

  const handleUserCreate = useCallback(async () => {
    // client-side check for error
    const isValid = USERNAME_REGEX.test(username);
    if (!isValid) {
      // TODO__v1: display error on form (or button), wait for final designs
      alert('username does not contain valid characters');
      return;
    }

    // TODO__v1: send request to server to create a user
    await pause(1000);
    next();
  }, [username, next]);

  useWizardConfig({ onNext: handleUserCreate });

  return (
    <FullPageCenteredStep withFooter>
      <StyledUserInfoForm
        onSubmit={handleUserCreate}
        onUsernameChange={setUsername}
        onBioChange={setBio}
      />
    </FullPageCenteredStep>
  );
}

const StyledUserInfoForm = styled(UserInfoForm)`
  width: 600px;
`;

export default AddUserInfo;
