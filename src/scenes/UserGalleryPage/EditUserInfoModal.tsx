import { useCallback, useState } from 'react';
import styled from 'styled-components';
import { useModalActions } from 'contexts/modal/ModalContext';
import UserInfoForm from 'components/Profile/UserInfoForm';
import useUserInfoForm from 'components/Profile/useUserInfoForm';
import Button from 'components/core/Button/DeprecatedButton';
import Spacer from 'components/core/Spacer/Spacer';
import ErrorText from 'components/core/Text/ErrorText';
import breakpoints from 'components/core/breakpoints';
import { useRouter } from 'next/router';
import { graphql, useFragment } from 'react-relay';
import { EditUserInfoModalFragment$key } from '__generated__/EditUserInfoModalFragment.graphql';

type Props = {
  queryRef: EditUserInfoModalFragment$key;
};

function EditUserInfoModal({ queryRef }: Props) {
  const { viewer } = useFragment(
    graphql`
      fragment EditUserInfoModalFragment on Query {
        viewer {
          ... on Viewer {
            user {
              dbid
              username
              bio
            }
          }
        }
      }
    `,
    queryRef
  );

  if (!viewer?.user) {
    throw new Error('Entered the EditUserInfoModal without a logged in user in the cache');
  }

  const existingUser = viewer.user;

  const { hideModal } = useModalActions();
  const { push } = useRouter();

  const closeModalAndNavigateToNewUsername = useCallback(
    (newUsername: string) => {
      hideModal();

      // If the user chooses a new username, we should navigate them there
      const previousUsername = existingUser.username;
      if (newUsername !== previousUsername) {
        void push(`/${newUsername}`);
      }
    },
    [hideModal, existingUser.username, push]
  );

  const { username, onUsernameChange, usernameError, bio, onBioChange, generalError, onEditUser } =
    useUserInfoForm({
      onSuccess: closeModalAndNavigateToNewUsername,
      existingUsername: existingUser.username ?? undefined,
      existingBio: existingUser.bio ?? undefined,
      userId: existingUser.dbid,
    });

  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = useCallback(async () => {
    setIsLoading(true);
    await onEditUser();
    setIsLoading(false);
  }, [onEditUser]);

  return (
    <StyledEditUserInfoModal>
      <UserInfoForm
        onSubmit={handleSubmit}
        username={username}
        usernameError={usernameError}
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

      {/* TODO [GAL-256]: This spacer and button should be part of a new ModalFooter */}
      <Spacer height={12} />
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

  @media only screen and ${breakpoints.tablet} {
    width: 480px;
  }
`;

const StyledButton = styled(Button)`
  align-self: flex-end;
`;

export default EditUserInfoModal;
