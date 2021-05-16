import { useCallback, useEffect, useState } from 'react';
import { WizardContext } from 'react-albus';
import styled from 'styled-components';
import { useWizardCallback } from 'contexts/wizard/WizardCallbackContext';
import UserInfoForm, {
  BIO_MAX_CHAR_COUNT,
} from 'components/Profile/UserInfoForm';
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
    const usernameIsValid = USERNAME_REGEX.test(username);
    if (!usernameIsValid) {
      // TODO__v1: display error on form (or button), wait for final designs
      alert('username does not contain valid characters');
      return;
    }

    if (bio.length > BIO_MAX_CHAR_COUNT) {
      // no need to handle error here, since the form will mark the text as red
      return;
    }

    // TODO__v1: send request to server to UPDATE user's username and bio.
    // it should be an UPDATE because a user entity will have already been
    // created by this step
    await pause(1000);
    next();
  }, [username, next, bio]);

  useWizardConfig({ onNext: handleUserCreate });

  return (
    <FullPageCenteredStep withFooter>
      <StyledUserInfoForm
        onSubmit={handleUserCreate}
        onUsernameChange={setUsername}
        onBioChange={setBio}
        username={username}
        bio={bio}
      />
    </FullPageCenteredStep>
  );
}

const StyledUserInfoForm = styled(UserInfoForm)`
  width: 600px;
`;

export default AddUserInfo;
