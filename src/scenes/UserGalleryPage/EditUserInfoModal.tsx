import { useCallback, useState } from 'react';
import styled from 'styled-components';
import { useModalActions } from 'contexts/modal/ModalContext';
import UserInfoForm from 'components/Profile/UserInfoForm';
import useUserInfoForm from 'components/Profile/useUserInfoForm';
import { Button } from 'components/core/Button/Button';
import ErrorText from 'components/core/Text/ErrorText';
import breakpoints from 'components/core/breakpoints';
import { useRouter } from 'next/router';
import { graphql, useFragment } from 'react-relay';
import { EditUserInfoModalFragment$key } from '__generated__/EditUserInfoModalFragment.graphql';
import { HStack, VStack } from 'components/core/Spacer/Stack';

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
        void push({ pathname: '/[username]', query: { username: newUsername } });
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
    <StyledEditUserInfoModal gap={16}>
      <VStack gap={8}>
        <UserInfoForm
          onSubmit={handleSubmit}
          username={username}
          usernameError={usernameError}
          onUsernameChange={onUsernameChange}
          bio={bio}
          onBioChange={onBioChange}
        />
        {generalError && <ErrorText message={generalError} />}
      </VStack>
      {/* TODO [GAL-256]: This spacer and button should be part of a new ModalFooter */}
      <StyledButtonContainer justify="flex-end">
        <Button onClick={handleSubmit} disabled={!!usernameError} pending={isLoading}>
          Save
        </Button>
      </StyledButtonContainer>
    </StyledEditUserInfoModal>
  );
}

const StyledEditUserInfoModal = styled(VStack)`
  @media only screen and ${breakpoints.tablet} {
    width: 480px;
  }
`;

const StyledButtonContainer = styled(HStack)`
  padding-top: 12px;
`;

export default EditUserInfoModal;
