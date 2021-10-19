import { useCallback, useState, useEffect } from 'react';
import styled from 'styled-components';
import { useModal } from 'contexts/modal/ModalContext';
import UserInfoForm from 'components/Profile/UserInfoForm';
import useUserInfoForm from 'components/Profile/useUserInfoForm';
import Button from 'components/core/Button/Button';
import Spacer from 'components/core/Spacer/Spacer';
import ErrorText from 'components/core/Text/ErrorText';
import { useAuthenticatedUser } from 'hooks/api/users/useUser';
import { navigate } from '@reach/router';

function EditUserInfoModal() {
  const existingUser = useAuthenticatedUser();
  const { hideModal } = useModal();

  const closeModalAndNavigateToNewUsername = useCallback(
    (newUsername: string) => {
      hideModal();

      // If the user chooses a new username, we should navigate them there
      const previousUsername = existingUser.username;
      if (newUsername !== previousUsername) {
        void navigate(`/${newUsername}`);
      }
    },
    [hideModal, existingUser.username],
  );

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
    onSuccess: closeModalAndNavigateToNewUsername,
    existingUsername: existingUser.username,
    existingBio: existingUser.bio,
    userId: existingUser.id,
  });

  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = useCallback(async () => {
    setIsLoading(true);
    await onEditUser();
    setIsLoading(false);
  }, [onEditUser]);

  useEffect(() => {
    const close = (e: any) => {
      // key press can work too but keydown is more consistent through browsers
      if(e.keyCode === 27){
        hideModal();
      }
    }
    window.addEventListener('keydown', close)
    return () => window.removeEventListener('keydown', close)
  },[hideModal])

  return (
    <StyledEditUserInfoModal>
      <UserInfoForm
        mode="Edit"
        onSubmit={handleSubmit}
        username={username}
        usernameError={usernameError}
        clearUsernameError={onClearUsernameError}
        onUsernameChange={onUsernameChange}
        bio={bio}
        onBioChange={onBioChange}
      />
      {generalError && (
        <>
          <Spacer height={8} />
          <ErrorText message={generalError} />
        </>
      )}
      <Spacer height={16} />
      <StyledButton
        mini
        text="Save"
        onClick={handleSubmit}
        disabled={isLoading}
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
