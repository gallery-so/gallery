import { useCallback, useMemo, useState } from 'react';
import styled from 'styled-components';
import { useModal } from 'contexts/modal/ModalContext';
import UserInfoForm, {
  BIO_MAX_CHAR_COUNT,
} from 'components/Profile/UserInfoForm';
import Button from 'components/core/Button/Button';
import Spacer from 'components/core/Spacer/Spacer';
import { USERNAME_REGEX } from 'utils/regex';
import { pause } from 'utils/time';

function EditUserInfoModal() {
  const { hideModal } = useModal();

  // TODO__v1: auto-populate username and bio from useSwr()
  const [username, setUsername] = useState('RogerKilimanjaro');
  const [bio, setBio] = useState(
    'French Graphic Designer + Digital Artist Sparkles Founder of @healthedeal\nSparkles lorem ipsum sit dolor http://superrare.co/maalavidaa Sparkles Shop\n& More → http://linktr.ee/maalavidaa'
  );

  const [isLoading, setIsLoading] = useState(false);

  const isValid = useMemo(() => {
    const usernameIsValid = USERNAME_REGEX.test(username);
    const bioIsValid = bio.length <= BIO_MAX_CHAR_COUNT;
    return usernameIsValid && bioIsValid;
  }, [username, bio]);

  const onSubmit = useCallback(async () => {
    if (isValid) {
      setIsLoading(true);

      try {
        // TODO__v1: send request to server to UPDATE user's username and bio.
        await pause(1000);
        hideModal();
      } catch (e) {
        // TODO__v1: depending on type of server error, set error for username,
        // bio, or general modal
      }

      setIsLoading(false);
    }
  }, [hideModal, isValid]);

  return (
    <StyledEditUserInfoModal>
      <UserInfoForm
        mode="Edit"
        onSubmit={onSubmit}
        username={username}
        onUsernameChange={setUsername}
        bio={bio}
        onBioChange={setBio}
      />
      <Spacer height={16} />
      <StyledButton
        mini
        text="Save"
        onClick={onSubmit}
        disabled={!isValid || isLoading}
        loading={isLoading}
      />
    </StyledEditUserInfoModal>
  );
}

const StyledEditUserInfoModal = styled.div`
  display: flex;
  flex-direction: column;

  width: 480px;
`;

const StyledButton = styled(Button)`
  height: 30px;
  width: 80px;
  align-self: flex-end;
`;

export default EditUserInfoModal;
